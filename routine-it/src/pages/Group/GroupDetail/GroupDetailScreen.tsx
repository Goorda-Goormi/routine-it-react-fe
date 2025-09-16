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

    // 루틴 인증 요청 알림을 가져오는 함수
    const fetchAuthNotifications = async () => {
        try {
            // 1. 모든 루틴 인증 요청 알림을 조회
            const notifications = await getNotificationsByType('GROUP_TODAY_AUTH_REQUEST' as NotificationType);
            
            // 2. 현재 그룹 이름과 현재 사용자의 닉네임(리더)에 일치하는 알림만 필터링
            const currentGroupAuthRequests = notifications.filter(
                (notification) => notification.groupName === group?.groupName && notification.receiverName === currentUser.nickname
            );

            // 3. 필터링된 알림을 원하는 형식으로 가공
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

    const handleApprove = async (targetId: number) => {
        try {
            alert("인증 승인 로직이 아직 구현되지 않았습니다. 초대만 승인합니다.");
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
            console.error("승인 처리에 실패했습니다:", error);
            alert("승인 처리에 실패했습니다.");
        }
    };

    const handleReject = async (targetId: number) => {
        try {
            alert("인증 거절 로직이 아직 구현되지 않았습니다. 초대만 거절합니다.");
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
            console.error("거절 처리에 실패했습니다:", error);
            alert("거절 처리에 실패했습니다.");
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
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onClose={() => setShowApprovalModal(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}