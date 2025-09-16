import React, { useState, useEffect } from 'react';
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
    approveAuthRequest, // 새로운 API 함수 import
} from '../../../api/group';
import { getGroupTop3Ranking } from '../../../api/ranking';
import type { GlobalGroupRankingData } from '../../Ranking/RankingScreen';
import { fetchChatHistory } from '../../../api/chat';
import { getUserProfile } from '../../../api/user';
import { getNotificationsByType, NotificationType } from '../../../api/notification';

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

    const group = groups.find((g) => g.groupId === groupId);
    const isLeader = group?.leaderName === currentUser.nickname;

  const fetchAuthNotifications = async () => {
    try {
        const notifications = await getNotificationsByType('GROUP_TODAY_AUTH_REQUEST' as NotificationType);
        
        const currentGroupAuthRequests = notifications.filter(
            (notification) => notification.groupName === group?.groupName && notification.receiverName === currentUser.nickname
        );

        const authRequestList = currentGroupAuthRequests.map(notification => {
            let targetUserId = null;
            let targetGroupMemberId = null; // 그룹 멤버 ID를 추가합니다.

            // notification.senderName을 이용해 그룹 멤버 목록에서 필요한 ID를 찾습니다.
            const memberInfo = groupMembers.find(member => member.memberName === notification.senderName);
            if (memberInfo) {
                targetUserId = memberInfo.userId;
                targetGroupMemberId = memberInfo.groupMemberId; // 여기서 groupMemberId를 가져옵니다.
            }
            
            return {
                id: notification.id,
                nickname: notification.senderName,
                imageUrl: null, // 요청하신 대로 null 유지
                message: notification.content,
                targetUserId: targetUserId,
                targetGroupMemberId: targetGroupMemberId, // payload에 사용될 그룹 멤버 ID
            };
        });

        setAuthRequests(authRequestList);
        setPendingAuthCount(authRequestList.length);
    } catch (error) {
        console.error("루틴 인증 요청 알림 로딩 실패:", error);
        setAuthRequests([]);
        setPendingAuthCount(0);
    }
};

    useEffect(() => {
        const fetchData = async () => {
            if (currentUser?.id) {
                try {
                    const rankingResponse = await getGroupTop3Ranking(groupId, Number(currentUser.id));
                    setWeeklyRanking(rankingResponse?.data?.top3Users || []);
                } catch (error) {
                    console.error("랭킹 데이터 가져오기 실패:", error);
                    setWeeklyRanking([]);
                }
            }
            
            try {
                const chatResponse = await fetchChatHistory(groupId, 50);
                const chatHistory = chatResponse.data?.content || [];
                const authMessages = chatHistory
                    .filter(msg => msg.messageType === 'NOTICE' && msg.content?.includes('루틴을 인증했어요'))
                    .map(msg => {
                        const date = new Date(msg.sentAt);
                        date.setHours(date.getHours() + 9);
                        const kstTime = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
                        return {
                            id: msg.messageId,
                            nickname: msg.senderNickname,
                            action: '루틴 인증 완료',
                            time: kstTime,
                            imageUrl: msg.imageUrl,
                        };
                    });
                setRecentActivities(authMessages);
            } catch (error) {
                console.error("채팅 인증 내역 로딩 실패:", error);
                setRecentActivities([]);
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

        fetchData();

        if (groupMembers.length > 0) {
            fetchMemberProfiles();
        }
    }, [groupId, currentUser.id, groupMembers]);

    const handleOpenApprovalModal = async () => {
        try {
            const pendingMembers = await getPendingMembersByGroupId(groupId);
            setPendingInvites(pendingMembers);

            await fetchAuthNotifications();

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

    // --- 루틴 인증 승인/거절 로직 수정 ---
   const handleApproveAuth = async (notificationId: number) => {
    try {
        const authRequest = authRequests.find(req => req.id === notificationId);
        if (!authRequest || authRequest.targetGroupMemberId === null) {
            console.error("승인할 인증 요청을 찾을 수 없거나 멤버 ID가 누락되었습니다.");
            return;
        }

        const payload = {
            groupId: groupId,
            leaderId: myid,
            targetMemberId: authRequest.targetGroupMemberId, // <--- **이 부분을 수정했습니다.**
            approved: true,
            imageUrl: authRequest.imageUrl,
            activityDate: new Date().toISOString().split('T')[0],
        };

        await approveAuthRequest(groupId, payload);
        console.log(`알림 ID ${notificationId}에 대한 루틴 인증을 승인했습니다.`);
        
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
            if (!authRequest) {
                console.error("거절할 인증 요청을 찾을 수 없습니다.");
                return;
            }
    
            const payload = {
                groupId: groupId,
                leaderId: myid, // 현재 로그인한 사용자 ID
                targetMemberId: authRequest.targetUserId, // 인증 요청을 보낸 사용자 ID
                approved: false, // 거절 시 false
                imageUrl: authRequest.imageUrl,
                activityDate: new Date().toISOString().split('T')[0], // 오늘 날짜
            };

            await approveAuthRequest(groupId, payload); // approveAuthRequest 함수를 거절에도 사용
            console.log(`알림 ID ${notificationId}에 대한 루틴 인증을 거절했습니다.`);
            
            // 거절된 항목을 목록에서 제거
            setAuthRequests(prev => prev.filter(auth => auth.id !== notificationId));
            setPendingAuthCount(prev => prev - 1);
            alert("루틴 인증을 거절했습니다.");
        } catch (error) {
            console.error("루틴 인증 거절 처리에 실패했습니다:", error);
            alert("루틴 인증 거절 처리에 실패했습니다.");
        }
    };
    
    // --- 기존 가입 신청 승인/거절 로직 ---
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
                onGroupDeleted={onDeleteGroupSuccess}
                myid={myid}
                onGroupJoined={onGroupJoined}
                //isJoined={isJoined}
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
                onKickMember={() => {}}
                onDelegateLeader={() => {}}
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