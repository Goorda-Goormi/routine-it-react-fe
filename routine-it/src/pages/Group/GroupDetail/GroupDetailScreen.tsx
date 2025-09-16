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
    approveRoutineAuth, // 가상의 루틴 인증 승인 API 함수
    rejectRoutineAuth, // 가상의 루틴 인증 거절 API 함수
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

            const authRequestList = currentGroupAuthRequests.map(notification => ({
                id: notification.id,
                nickname: notification.senderName,
                message: notification.content,
                imageUrl: notification.imageUrl,
            }));

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

    // --- 새로운 루틴 인증 승인/거절 로직 ---
    const handleApproveAuth = async (notificationId: number) => {
        try {
            // 루틴 인증 승인 API 호출 (가정)
            // await approveRoutineAuth(notificationId);
            console.log(`알림 ID ${notificationId}에 대한 루틴 인증을 승인했습니다.`);

            // 승인된 항목을 목록에서 제거
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
            // 루틴 인증 거절 API 호출 (가정)
            // await rejectRoutineAuth(notificationId);
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
                        onApproveInvite={handleApproveInvite} // 함수명 변경
                        onRejectInvite={handleRejectInvite} // 함수명 변경
                        onApproveAuth={handleApproveAuth} // 루틴 인증 승인
                        onRejectAuth={handleRejectAuth} // 루틴 인증 거절
                        onClose={() => setShowApprovalModal(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}