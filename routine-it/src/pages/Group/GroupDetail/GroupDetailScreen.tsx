import React, { useState, useEffect,useCallback } from 'react';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { GroupDetailHeader } from './GroupDetailHeader';
import { GroupDetailTabs } from './GroupDetailTabs';
import { GroupMemberManager } from './GroupMemberManager';
import GroupEdit from './GroupEdit';
import { GroupApproval } from './GroupApproval';
import type { GroupMemberResponse } from "../../../interfaces";
import {
    deleteGroup,
    delegateLeader,
    getUserActivitiesByDay,
    updateGroupMemberStatus,
    getPendingMembersByGroupId,
    approveAuthRequest,
    type AuthApprovalPayload,
} from '../../../api/group';
import { getGroupTop3Ranking } from '../../../api/ranking';
import type { GlobalGroupRankingData } from '../../Ranking/RankingScreen';
import { fetchChatHistory } from '../../../api/chat';
import { getUserProfile } from '../../../api/user';
import { getNotificationsByType, markNotificationAsRead } from '../../../api/notification';
import { presignGet } from '../../../api/storage';
interface GroupDetailScreenProps {
    groupId: number;
    groups: any[];
    onBack: () => void;
    onNavigate: (screen: string, params?: any) => void;
    onUpdateGroup: (group: any) => void;
    currentUser: { nickname: string; id: string | number; profileImageUrl?: string };
    groupMembers: GroupMemberResponse[];
    onDeleteGroupSuccess: () => void;
    myid: number;
    onGroupJoined: () => void;
    isJoined: boolean;
    onRefreshMembers: () => void;
}


export function GroupDetailScreen({
    groupId,
    groups,
    onBack,
    onNavigate,
    onUpdateGroup,
    currentUser,
    groupMembers,
    onDeleteGroupSuccess,
    myid,
    onGroupJoined,
    isJoined,
    onRefreshMembers,
}: GroupDetailScreenProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showExMembersModal, setShowExMembersModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [pendingInvites, setPendingInvites] = useState<GroupMemberResponse[]>([]);
    const [authRequests, setAuthRequests] = useState<any[]>([]);
    const [pendingAuthCount, setPendingAuthCount] = useState(0);
    const [weeklyRanking, setWeeklyRanking] = useState<GlobalGroupRankingData[]>([]);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [memberProfiles, setMemberProfiles] = useState<Record<number, string>>({});
    // 새 상태: 오늘 루틴을 인증한 멤버를 추적합니다. (채팅 + 리더 승인)
    const [todayCertifiedMembers, setTodayCertifiedMembers] = useState<Set<string>>(new Set());
    
    const group = groups.find((g) => g.groupId === groupId);
    const isLeader = group?.leaderName === currentUser.nickname;
    
    const toKst = useCallback((dateString: string) => {
        const utcDate = new Date(dateString);
        const kstOffset = 9 * 60 * 60 * 1000;
        return new Date(utcDate.getTime() + kstOffset);
    }, []);

    const fetchGroupData = useCallback(async () => {
  if (!group) return;

  try {
    const rankingResponse = await getGroupTop3Ranking(groupId, Number(currentUser.id));
    setWeeklyRanking(rankingResponse?.data?.top3Users || []);

    const chatResponse = await fetchChatHistory(groupId, 500);
    const chatHistory = chatResponse.data?.content || [];
    console.log("필터링 전 채팅 내역:", chatHistory);

    // 현재 날짜 (KST)
    const todayKst = toKst(new Date().toISOString());
    const todayString = todayKst.toISOString().split("T")[0];

    const certifiedMembersFromChat = new Set<string>();

    const authMessages = await Promise.all(
      chatHistory
        .filter(msg => {
          const msgKstDate = toKst(msg.sentAt);
          const isRoutineAuth =
            msg.message?.includes("루틴 인증을 요청했습니다") ||
            msg.message?.includes("루틴을 인증했습니다");

          return (
            msg.messageType === "NOTICE" &&
            isRoutineAuth &&
            msgKstDate.toISOString().split("T")[0] === todayString
          );
        })
        .map(async msg => {
          const kstDate = toKst(msg.sentAt);
          const kstTime = kstDate.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          const actionText = msg.message.includes("루틴을 인증했습니다")
            ? "루틴 인증 완료"
            : "루틴 인증 요청";

          if (group.groupType === "FREE" && actionText === "루틴 인증 완료") {
            certifiedMembersFromChat.add(msg.senderNickname);
          }

          // ✅ presigned URL 발급
          let signedUrl: string | null = null;
          if (msg.imageUrl) {
            try {
              const resp = await presignGet(msg.imageUrl, "inline");
              signedUrl = resp.url;
              console.log("presign 발급 성공",signedUrl)
            } catch (err) {
              console.error("presign 발급 실패:", err);
            }
          }

          return {
            id: msg.messageId,
            nickname: msg.senderNickname,
            action: actionText,
            time: kstTime,
            imageUrl: signedUrl, // presigned url을 저장
            message: msg.message,
          };
        })
    );

    setTodayCertifiedMembers(prev => {
      const mergedSet = new Set(prev);
      certifiedMembersFromChat.forEach(member => mergedSet.add(member));
      return mergedSet;
    });

    setRecentActivities(authMessages);
    console.log("필터링된 루틴 인증 메시지:", authMessages);

    // 프로필 이미지도 로드
    const profiles: Record<number, string> = {};
    await Promise.all(
      groupMembers.map(async member => {
        if (member.userId) {
          try {
            const profileData = await getUserProfile(member.userId);
            profiles[member.userId] = profileData.profileImageUrl;
          } catch (error) {
            console.error(`Failed to fetch profile for user ${member.userId}:`, error);
            profiles[member.userId] = "";
          }
        }
      })
    );
    setMemberProfiles(profiles);
  } catch (error) {
    console.error("그룹 데이터 로딩 실패:", error);
    setWeeklyRanking([]);
    setRecentActivities([]);
  }
}, [group, groupId, currentUser.id, groupMembers, toKst]);

   const fetchAuthNotificationsAndChatIds = async () => {
    if (!group) return;
    try {
        const notifications = await getNotificationsByType('GROUP_TODAY_AUTH_REQUEST');
        const unreadNotifications = notifications.filter(n => !n.read);
        const chatHistory = await fetchChatHistory(groupId, 500);
        const chatMessages = chatHistory.data?.content || [];

        const authRequestList = await Promise.all( // Promise.all을 사용하여 비동기 처리
            unreadNotifications
                .filter(notification => notification.groupName === group.groupName && notification.receiverName === currentUser.nickname)
                .map(async notification => { // async 키워드를 추가
                    const memberInfo = groupMembers.find(member => member.memberName === notification.senderName);

                    const matchingMessage = chatMessages.find(
                        msg => 
                            msg.messageType === 'NOTICE' &&
                            msg.senderNickname === notification.senderName &&
                            msg.imageUrl
                    );

                    let signedImageUrl = null;
                    if (matchingMessage?.imageUrl) {
                        try {
                            // ✅ 여기서 presignGet을 호출하여 이미지를 가져옵니다.
                            const resp = await presignGet(matchingMessage.imageUrl, "inline");
                            signedImageUrl = resp.url;
                            console.log("모달용 presign 발급 성공", signedImageUrl);
                        } catch (err) {
                            console.error("모달용 presign 발급 실패:", err);
                        }
                    }

                    const chatMsgId = matchingMessage?.id;

                    return {
                        id: notification.id, 
                        nickname: notification.senderName,
                        imageUrl: signedImageUrl, // presigned URL로 업데이트
                        message: notification.content,
                        targetUserId: memberInfo?.userId || null,
                        targetGroupMemberId: memberInfo?.groupMemberId || null,
                        chatMsgId: chatMsgId,
                    };
                })
        );

        setAuthRequests(authRequestList);
        setPendingAuthCount(authRequestList.length);
    } catch (error) {
        console.error("루틴 인증 요청 로딩 실패:", error);
        setAuthRequests([]);
        setPendingAuthCount(0);
    }
};
    useEffect(() => {
        fetchGroupData();
    }, [groupId, currentUser.id, groupMembers]);


       const handleKickMember = async (targetMemberId: number) => {
        try {
            const currentLeader = groupMembers.find(m => m.memberName === group.leaderName);
            if (!currentLeader || !currentLeader.groupMemberId) {
                alert("리더의 정보를 찾을 수 없습니다.");
                return;
            }

            console.log("전송 데이터:", {
                groupId: groupId,
                leaderId: currentLeader.groupMemberId,
                targetMemberId: targetMemberId,
                status: "BLOCKED",
                role: "MEMBER",
                approved: false
            });

            const response = await updateGroupMemberStatus(groupId, {
                groupId: groupId,
                leaderId: currentLeader.groupMemberId,
                targetMemberId: targetMemberId,
                status: "BLOCKED",
                role: "MEMBER",
                approved: false
            });


            if (response && response.status === "BLOCKED") {
                alert('멤버가 성공적으로 그룹에서 내보내졌습니다.');
                setShowExMembersModal(false);
                onUpdateGroup({ ...group, members: groupMembers.filter(m => m.groupMemberId !== targetMemberId) });
                onRefreshMembers();
            } else {
                alert('멤버 내보내기에 실패했습니다.');
            }
        } catch (error) {
            console.error("멤버 내보내기 실패:", error);
            alert('멤버 내보내기에 실패했습니다.');
        }
    };

    const handleGroupDeleted = async () => {
        if (group?.groupId) {
            try {
                await deleteGroup(group.groupId);
                alert("그룹이 성공적으로 삭제되었습니다.");
                onDeleteGroupSuccess();
            } catch (error) {
                console.error("그룹 삭제 실패:", error);
                alert("그룹 삭제에 실패했습니다.");
            }
        }
    };

    const handleDelegateLeader = async (targetMemberId: number, targetMemberName: string) => {
        try {
            const currentLeader = groupMembers.find(m => m.memberName === group.leaderName);
            if (!currentLeader) {
                alert("현재 리더 정보를 찾을 수 없습니다.");
                return;
            }
            const currentLeaderId = currentLeader.groupMemberId;
            const response = await delegateLeader(group.groupId, Number(currentLeaderId), targetMemberId);
            if (response && response.role === "LEADER") {
                alert("리더 위임이 완료되었습니다.");
                setShowExMembersModal(false);
                onUpdateGroup({ ...group, leaderName: targetMemberName, leaderId: targetMemberId });
                onRefreshMembers();
            }
        } catch (error) {
            console.error("리더 위임 실패:", error);
        }
    };


    const fetchMemberProfiles = async () => {
        const profiles: Record<number, string> = {};
        await Promise.all(groupMembers.map(async (member) => {
            if (member.userId) {
                try {
                    const profileData = await getUserProfile(member.userId);
                    profiles[member.userId] = profileData.profileImageUrl;
                } catch (error) {
                    console.error(`Failed to fetch profile for user ${member.userId}:`, error);
                    profiles[member.userId] = '';
                }
            }
        }));
        setMemberProfiles(profiles);
    };

    const handleOpenApprovalModal = async () => {
        try {
            const pendingMembers = await getPendingMembersByGroupId(groupId);
            setPendingInvites(pendingMembers);
            await fetchAuthNotificationsAndChatIds();
            setShowApprovalModal(true);
        } catch (error) {
            alert("승인 목록을 불러오는데 실패했습니다.");
            console.error(error);
        }
    };

    const handleChatClick = () => onNavigate('group-chat', group);

    const handleMemberClick = (member: GroupMemberResponse) => {
        if (!member?.userId || !member?.memberName) {
            console.error("전달된 멤버 객체에 필수 정보가 없습니다:", member);
            return;
        }
        onNavigate('user-home', { id: member.userId, nickname: member.memberName });
    };

    // 루틴 인증 승인/거절 로직 수정
    const handleApproveAuth = async (notificationId: number) => {
    try {
        const authRequest = authRequests.find(req => req.id === notificationId);
        
        // chatMsgId가 존재하는지 확인하는 null 체크를 추가합니다.
        if (!authRequest || authRequest.targetGroupMemberId === null || authRequest.chatMsgId === null) {
            console.error("승인할 인증 요청을 찾을 수 없거나 필수 정보(멤버 ID, 채팅 메시지 ID)가 누락되었습니다.");
            return;
        }

        const payload = {
            groupId: groupId,
            leaderId: myid,
            targetMemberId: authRequest.targetGroupMemberId,
            //approved: true,
            isApproved:true,
            imageUrl: authRequest.imageUrl,
            activityDate: new Date().toISOString().split('T')[0],
            // 찾은 chatMsgId를 페이로드에 포함시킵니다.
            chatMsgId: authRequest.chatMsgId, 
            status: authRequest?.status,
            role: (authRequest?.role==='LEADER' ? 'LEADER' : 'MEMBER') as AuthApprovalPayload['role'],
        };
         console.log("approveAuthRequest payload:", JSON.stringify(payload));


        await approveAuthRequest(groupId, payload);
        console.log(`알림 ID ${notificationId}에 대한 루틴 인증을 승인했습니다.`);
        
        // UI 상태 업데이트 로직은 그대로 유지
        setTodayCertifiedMembers(prev => {
            const newSet = new Set(prev);
            newSet.add(authRequest.nickname);
            return newSet;
        });

        await markNotificationAsRead(notificationId, true);
        
        setAuthRequests(prev => prev.filter(auth => auth.id !== notificationId));
        setPendingAuthCount(prev => prev - 1);
        alert("루틴 인증을 승인했습니다.");
    } catch (error) {
        console.error("루틴 인증 승인 처리에 실패했습니다:", error);
        alert("루틴 인증 승인 처리에 실패했습니다.");
    }
};
    const handleRejectAuth = async (notificationId: number) => {
    try {
        const authRequest = authRequests.find(req => req.id === notificationId);
        
        // chatMsgId가 존재하는지 확인하는 null 체크를 추가합니다.
        if (!authRequest || authRequest.targetGroupMemberId === null || authRequest.chatMsgId === null) {
            console.error("거절할 인증 요청을 찾을 수 없거나 필수 정보(멤버 ID, 채팅 메시지 ID)가 누락되었습니다.");
            return;
        }
    
        const payload = {
            groupId: groupId,
            leaderId: myid,
            targetMemberId: authRequest.targetGroupMemberId,
            approved: false, // 거절이므로 false
            isApproved:false,
            imageUrl: authRequest.imageUrl,
            activityDate: new Date().toISOString().split('T')[0],
            // 찾은 chatMsgId를 페이로드에 포함시킵니다.
            chatMsgId: authRequest.chatMsgId,
             status: authRequest?.status,
            role: (authRequest?.role==='LEADER' ? 'LEADER' : 'MEMBER') as AuthApprovalPayload['role'],
        };
        console.log("approveAuthRequest payload:", JSON.stringify(payload));

        await approveAuthRequest(groupId, payload);
        console.log(`알림 ID ${notificationId}에 대한 루틴 인증을 거절했습니다.`);
        
        await markNotificationAsRead(notificationId, true);
        // UI 상태 업데이트 로직은 그대로 유지
        setAuthRequests(prev => prev.filter(auth => auth.id !== notificationId));
        setPendingAuthCount(prev => prev - 1);
        alert("루틴 인증을 거절했습니다.");
    } catch (error) {
        console.error("루틴 인증 거절 처리에 실패했습니다:", error);
        alert("루틴 인증 거절 처리에 실패했습니다.");
    }
};
    
    // 기존 가입 신청 승인/거절 로직은 변경 없음
    const handleApproveInvite = async (targetId: number) => {
        try {
            const currentLeader = groupMembers.find(m => m.memberName === group.leaderName);
            if (!currentLeader?.groupMemberId) {
                alert("리더의 정보를 찾을 수 없어 승인에 실패했습니다.");
                return;
            }

            const response = await updateGroupMemberStatus(groupId, {
                groupId: groupId,
                leaderId: currentLeader.groupMemberId,
                targetMemberId: targetId,
                status: "JOINED",
                role: "MEMBER",
                approved: true
            });

            if (response?.status === 'JOINED') {
                alert("그룹 가입을 승인했습니다.");
                setPendingInvites(prev => prev.filter(p => p.groupMemberId !== targetId));
                onUpdateGroup({ ...group, currentMemberCount: group.currentMemberCount + 1, members: [...groupMembers, response] });
                onRefreshMembers();
            } else {
                alert("승인 처리에 실패했습니다.");
            }
        } catch (error) {
            console.error("가입 승인 처리에 실패했습니다:", error);
            alert("가입 승인 처리에 실패했습니다.");
        }
    };

    const handleRejectInvite = async (targetId: number) => {
        try {
            const currentLeader = groupMembers.find(m => m.memberName === group.leaderName);
            if (!currentLeader?.groupMemberId) {
                alert("리더의 정보를 찾을 수 없어 거절에 실패했습니다.");
                return;
            }

            await updateGroupMemberStatus(groupId, {
                groupId: groupId,
                leaderId: currentLeader.groupMemberId,
                targetMemberId: targetId,
                status: "BLOCKED",
                role: "MEMBER",
                approved: false
            });

            alert("그룹 가입을 거절했습니다.");
            setPendingInvites(prev => prev.filter(p => p.groupMemberId !== targetId));
            onRefreshMembers();
        } catch (error) {
            console.error("가입 거절 처리에 실패했습니다:", error);
            alert("가입 거절 처리에 실패했습니다.");
        }
    };

    if (!group) {
        return <div>그룹 정보를 불러오는 중이거나, 그룹을 찾을 수 없습니다.</div>;
    }

    return (
        <div className="min-h-screen relative">
            <GroupDetailHeader
                group={group}
                isJoined={isJoined}
                isLeader={isLeader}
                onBack={onBack}
                onChatClick={handleChatClick}
                onOpenEdit={() => setIsEditing(true)}
                onOpenApproval={handleOpenApprovalModal}
                onOpenExMembers={() => setShowExMembersModal(true)}
                pendingAuthCount={pendingAuthCount}
                groupMembers={groupMembers}
                onGroupDeleted={handleGroupDeleted}
                myid={myid}
                onGroupJoined={onGroupJoined}
                onRefreshMembers={onRefreshMembers}
            />
            <div className="p-4 space-y-4">
                <GroupDetailTabs
                    weeklyRanking={weeklyRanking}
                    recentActivities={recentActivities}
                    onMemberClick={handleMemberClick}
                    groupMembers={groupMembers}
                    memberProfiles={memberProfiles}
                    myid={myid}
                    certifiedMembers={todayCertifiedMembers}
                />
            </div>
            <GroupEdit
                open={isEditing}
                onOpenChange={setIsEditing}
                group={group}
                onSave={(updatedGroup) => {
                    onUpdateGroup({ ...group, ...updatedGroup });
                    setIsEditing(false);
                }}
            />
            <GroupMemberManager
                open={showExMembersModal}
                onOpenChange={setShowExMembersModal}
                members={groupMembers}
                onKickMember={handleKickMember}
                onDelegateLeader={handleDelegateLeader}

                isLeader={isLeader}
            />
            <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
                <DialogContent className="max-w-md text-icon-secondary dark:text-white">
                    <GroupApproval
                        authMessages={authRequests}
                        inviteMessages={pendingInvites.map(member => ({
                            id: member.groupMemberId,
                            user: member.memberName,
                        }))}
                        onApproveInvite={handleApproveInvite}
                        onRejectInvite={handleRejectInvite}
                        onApproveAuth={handleApproveAuth}
                        onRejectAuth={handleRejectAuth}
                        onClose={() => setShowApprovalModal(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}