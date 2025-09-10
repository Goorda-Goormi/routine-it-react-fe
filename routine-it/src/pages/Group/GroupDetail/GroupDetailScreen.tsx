import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { GroupDetailHeader } from './GroupDetailHeader';
import { GroupDetailTabs } from './GroupDetailTabs';
import { GroupMemberManager } from './GroupMemberManager';
import GroupEdit from './GroupEdit';
import { GroupApproval } from './GroupApproval';
import type { AuthMessage, GroupMemberResponse, NotificationApiResponse } from "../../../interfaces";
import { deleteGroup, delegateLeader, getUserActivitiesByDay,updateGroupMemberStatus } from '../../../api/group';
import { getGroupTop3Ranking } from '../../../api/ranking';
import type { GlobalGroupRankingData } from '../../Ranking/RankingScreen';
import { getNotificationsByType, markNotificationAsRead } from '../../../api/notification';
import { fetchChatHistory } from '../../../api/chat';

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
}: GroupDetailScreenProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showExMembersModal, setShowExMembersModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [pendingInvites, setPendingInvites] = useState<any[]>([]);

    const group = groups.find((g) => g.groupId === groupId);

    if (!group) {
        return <div>그룹 정보를 불러오는 중이거나, 그룹을 찾을 수 없습니다.</div>;
    }

    const isLeader = group?.leaderName === currentUser.nickname;
    const [weeklyRanking, setWeeklyRanking] = useState<GlobalGroupRankingData[]>([]);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);

    const handleChatClick = () => onNavigate('group-chat', group);
    const handleMemberClick = (member: any) => onNavigate('user-home', member);

   const handleKickMember = async (targetMemberId: number) => {
    try {
        const currentLeader = groupMembers.find(m => m.memberName === group.leaderName);
        
        if (!currentLeader || !currentLeader.groupMemberId) {
            alert("리더의 정보를 찾을 수 없습니다.");
            return;
        }

        // --- 이 부분을 추가해주세요. ---
        console.log("전송 데이터:", {
            groupId: groupId,
            leaderId: currentLeader.groupMemberId,
            targetMemberId: targetMemberId,
            status: "BLOCKED",
            role: "MEMBER",
            approved: false
        });
        // -----------------------------

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

    useEffect(() => {
        const fetchData = async () => {
            // 랭킹 데이터 가져오기
            if (currentUser && currentUser.id !== undefined && currentUser.id !== null) {
                try {
                    const response = await getGroupTop3Ranking(groupId, Number(currentUser.id));
                    if (response && response.data && response.data.top3Users) {
                        setWeeklyRanking(response.data.top3Users);
                    } else {
                        console.error("API 응답 구조가 예상과 다릅니다:", response);
                        setWeeklyRanking([]);
                    }
                } catch (error) {
                    console.error("랭킹 데이터 가져오기 실패:", error);
                    setWeeklyRanking([]);
                }
            }

            // 최근 활동 (인증 내역) 데이터 가져오기
            try {
                const response = await fetchChatHistory(groupId, 50);
                const chatHistory = response.data?.content || [];
                
                const authMessages = chatHistory
                    .filter(msg => msg.messageType === 'NOTICE')
                    .map(msg => {
                        // UTC 시간을 KST(UTC+9)로 변환
                        const date = new Date(msg.sentAt);
                        date.setHours(date.getHours() + 9);
                        const kstTime = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

                        return {
                            id: msg.messageId, // 고유 ID로 사용
                            nickname: msg.senderNickname,
                            action: '루틴 인증 완료',
                            time: kstTime,
                            imageUrl: msg.imageUrl,
                        };
                    });
                
                setRecentActivities(authMessages);
                console.log("최근 인증 내역 (KST):", authMessages); // 콘솔에 출력
            } catch (error) {
                console.error("채팅 인증 내역 로딩 실패:", error);
                setRecentActivities([]);
            }
        };

        fetchData();
    }, [groupId, currentUser.id]);

    /*const handleDelegateLeader = async (targetMemberId: number, targetMemberName: string) => {
        try {
            const currentLeader = groupMembers.find(m => m.memberName === group.leaderName);
            if (!currentLeader) {
                alert("현재 리더 정보를 찾을 수 없습니다.");
                return;
            }
            const currentLeaderId = currentLeader.groupMemberId;
            const response = await delegateLeader(group.groupId, Number(currentLeaderId), targetMemberId);
            if (response.success) {
                alert(`그룹 리더가 ${targetMemberName}님으로 성공적으로 위임되었습니다.`);
                setShowExMembersModal(false);
                onUpdateGroup({ ...group, leaderName: targetMemberName, leaderId: targetMemberId });
            } else {
                alert(response.message || '리더 위임에 실패했습니다.');
            }
        } catch (error) {
            console.error("리더 위임 실패:", error);
            alert('리더 위임에 실패했습니다.');
        }
    };*/
    const handleDelegateLeader = async (targetMemberId: number, targetMemberName: string) => {
        try {
            const currentLeader = groupMembers.find(m => m.memberName === group.leaderName);
            if (!currentLeader) {
                
                alert("현재 리더 정보를 찾을 수 없습니다.");
                return;
            }
            const currentLeaderId = currentLeader.groupMemberId;
            const response = await delegateLeader(group.groupId, Number(currentLeaderId), targetMemberId);
            if (response.success) {
                setShowExMembersModal(false);
                onUpdateGroup({ ...group, leaderName: targetMemberName, leaderId: targetMemberId });
            }
        } catch (error) {
            console.error("리더 위임 실패:", error);
        }
    };


    const handleOpenApprovalModal = async () => {
    try {
        const inviteNotifications = await getNotificationsByType('GROUP_JOIN_REQUEST');
        
        // 현재 그룹의 이름(currentGroupName)과 일치하는 알림만 필터링
        const currentGroupNotifications = inviteNotifications.filter(
            (notification) => notification.groupName === group.groupName
        );

        const inviteMessages = currentGroupNotifications.map((notification) => ({
            id: notification.id,
            user: notification.senderName
        }));

        setPendingInvites(inviteMessages);
        setShowApprovalModal(true);
    } catch (error) {
        alert("알림 목록을 불러오는데 실패했습니다.");
        console.error(error);
    }
};

    const handleApprove = async (notificationId: number) => {
        try {
            await markNotificationAsRead(notificationId, true);
            alert("그룹 가입을 승인했습니다.");
            setPendingInvites(prev => prev.filter(p => p.id !== notificationId));
            setShowApprovalModal(false);
        } catch (error) {
            alert("승인 처리에 실패했습니다.");
            console.error(error);
        }
    };

    const handleReject = async (notificationId: number) => {
        try {
            await markNotificationAsRead(notificationId, true);
            alert("그룹 가입을 거절했습니다.");
            setPendingInvites(prev => prev.filter(p => p.id !== notificationId));
            setShowApprovalModal(false);
        } catch (error) {
            alert("거절 처리에 실패했습니다.");
            console.error(error);
        }
    };

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
                pendingAuthCount={0}
                groupMembers={groupMembers}
                onGroupDeleted={handleGroupDeleted}
                myid={myid}
                onGroupJoined={onGroupJoined}
            />
            <div className="p-4 space-y-4">
                <GroupDetailTabs
                    weeklyRanking={weeklyRanking}
                    recentActivities={recentActivities}
                    onMemberClick={handleMemberClick}
                    groupMembers={groupMembers}
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
                        authMessages={[]}
                        inviteMessages={pendingInvites}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onClose={() => setShowApprovalModal(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}