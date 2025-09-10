import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { GroupDetailHeader } from './GroupDetailHeader';
import { GroupDetailTabs } from './GroupDetailTabs';
import { GroupMemberManager } from './GroupMemberManager';
import GroupEdit from './GroupEdit';
import { GroupApproval } from './GroupApproval';
import type { AuthMessage, GroupMemberResponse, NotificationApiResponse } from "../../../interfaces";
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
    const [pendingInvites, setPendingInvites] = useState<GroupMemberResponse[]>([]);
    const [pendingAuthCount, setPendingAuthCount] = useState(0);

    const group = groups.find((g) => g.groupId === groupId);

    if (!group) {
        return <div>그룹 정보를 불러오는 중이거나, 그룹을 찾을 수 없습니다.</div>;
    }

    const isLeader = group?.leaderName === currentUser.nickname;
    const [weeklyRanking, setWeeklyRanking] = useState<GlobalGroupRankingData[]>([]);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);

    const handleChatClick = () => onNavigate('group-chat', group);
    
    const handleMemberClick = (member: GroupMemberResponse) => {
        if (!member || !member.userId || !member.memberName) {
            console.error("전달된 멤버 객체에 필수 정보가 없습니다:", member);
            return;
        }
        
        const userForNav = {
            id: member.userId,
            nickname: member.memberName,
        };

        onNavigate('user-home', userForNav);
    };

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

            try {
                const response = await fetchChatHistory(groupId, 50);
                const chatHistory = response.data?.content || [];
                
                const authMessages = chatHistory
                    .filter(msg => msg.messageType === 'NOTICE')
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
                console.log("최근 인증 내역 (KST):", authMessages);
            } catch (error) {
                console.error("채팅 인증 내역 로딩 실패:", error);
                setRecentActivities([]);
            }
        };

        fetchData();
    }, [groupId, currentUser.id]);

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
            const pendingMembers = await getPendingMembersByGroupId(groupId);
            
            setPendingInvites(pendingMembers);
            setPendingAuthCount(pendingMembers.length);
            setShowApprovalModal(true);
        } catch (error) {
            alert("가입 대기중인 멤버 목록을 불러오는데 실패했습니다.");
            console.error(error);
        }
    };

    const handleApprove = async (targetMemberId: number) => {
        try {
            const currentLeader = groupMembers.find(m => m.memberName === group.leaderName);
            if (!currentLeader || !currentLeader.groupMemberId) {
                alert("리더의 정보를 찾을 수 없어 승인에 실패했습니다.");
                return;
            }

            const response = await updateGroupMemberStatus(groupId, {
                groupId: groupId,
                leaderId: currentLeader.groupMemberId,
                targetMemberId: targetMemberId,
                status: "JOINED",
                role: "MEMBER",
                approved: true
            });

            if (response && response.status === 'JOINED') {
                alert("그룹 가입을 승인했습니다.");
                setPendingInvites(prev => prev.filter(p => p.groupMemberId !== targetMemberId));
                setPendingAuthCount(prev => prev - 1);
                
                onUpdateGroup({ 
                    ...group, 
                    currentMemberCount: group.currentMemberCount + 1,
                    members: [...groupMembers, response]
                });
            } else {
                alert("승인 처리에 실패했습니다.");
            }
        } catch (error) {
            console.error("승인 처리에 실패했습니다:", error);
            alert("승인 처리에 실패했습니다.");
        }
    };

    const handleReject = async (targetMemberId: number) => {
        try {
            const currentLeader = groupMembers.find(m => m.memberName === group.leaderName);
            if (!currentLeader || !currentLeader.groupMemberId) {
                alert("리더의 정보를 찾을 수 없어 거절에 실패했습니다.");
                return;
            }

            await updateGroupMemberStatus(groupId, {
                groupId: groupId,
                leaderId: currentLeader.groupMemberId,
                targetMemberId: targetMemberId,
                status: "BLOCKED",
                role: "MEMBER",
                approved: false
            });

            alert("그룹 가입을 거절했습니다.");
            setPendingInvites(prev => prev.filter(p => p.groupMemberId !== targetMemberId));
            setPendingAuthCount(prev => prev - 1);
        } catch (error) {
            console.error("거절 처리에 실패했습니다:", error);
            alert("거절 처리에 실패했습니다.");
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
                pendingAuthCount={pendingAuthCount}
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