import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { GroupDetailHeader } from './GroupDetailHeader';
import { GroupDetailTabs } from './GroupDetailTabs';
import { GroupMemberManager } from './GroupMemberManager';
import GroupEdit from './GroupEdit';
import { GroupApproval } from './GroupApproval';
import { GroupRoutineDialog } from '../GroupChat/GroupRoutineDialog';
import type { AuthMessage, GroupMemberResponse, NotificationApiResponse } from "../../../interfaces";
import { deleteGroup, delegateLeader } from '../../../api/group';
import { getGroupTop3Ranking } from '../../../api/ranking';
import type { GlobalGroupRankingData } from '../../Ranking/RankingScreen';
import { getPendingAuthMembers, updateAuthStatus, requestAuthApproval } from '../../../api/group';
import { getNotificationsByType, markNotificationAsRead } from '../../../api/notification';

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
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [pendingAuths, setPendingAuths] = useState<AuthMessage[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);

  const group = groups.find((g) => g.groupId === groupId);

  if (!group) {
    return <div>그룹 정보를 불러오는 중이거나, 그룹을 찾을 수 없습니다.</div>;
  }

  const isLeader = group?.leaderName === currentUser.nickname;
  const [weeklyRanking, setWeeklyRanking] = useState<GlobalGroupRankingData[]>([]);
  const recentActivities = [
    { id: 1, nickname: '루티니', action: '운동 인증 완료', time: '10분 전', image: null },
    { id: 2, nickname: '관습박', action: '목표 달성!', time: '1시간 전', image: null },
    { id: 3, nickname: '지속성', action: '운동 인증 완료', time: '2시간 전', image: null },
  ];

  const handleChatClick = () => onNavigate('group-chat', group);
  const handleRoutineAuthClick = () => setShowRoutineModal(true);
  const handleMemberClick = (member: any) => onNavigate('user-home', member);

  const handleKickMember = (groupMemberId: string | number) => {
    alert('멤버를 그룹에서 내보냈습니다.');
    setShowExMembersModal(false);
  };

  const handleAuthSubmit = async (data: { description: string; image: File | null; isPublic: boolean }) => {
    const leader = groupMembers.find(member => member.role === 'LEADER');
    if (!leader) {
      alert('그룹 리더 정보를 찾을 수 없어 인증을 요청할 수 없습니다.');
      setShowRoutineModal(false);
      return;
    }
    try {
      const authData = {
      leaderId: leader.groupMemberId,
      targetMemberId: myid, // 현재 로그인한 사용자의 ID
      activityDate: new Date().toISOString().split('T')[0], // 오늘 날짜 (YYYY-MM-DD)
      imageUrl: "https://placeholder.com/image.jpg", 
    };

    await requestAuthApproval(groupId, authData);
    alert('인증이 성공적으로 제출되었습니다.');
    setShowRoutineModal(false);

  } catch (error) {
    alert('인증 제출에 실패했습니다.');
    console.error(error);
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
    const fetchRanking = async () => {
      if (!currentUser || currentUser.id === undefined || currentUser.id === null) {
        console.error("사용자 정보가 없어 랭킹을 불러올 수 없습니다.");
        setWeeklyRanking([]);
        return;
      }
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
    };
    fetchRanking();
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
  };

  // 새로운 인터페이스에 맞게 알림 데이터를 가져오는 함수
  const handleOpenApprovalModal = async () => {
    try {
      // 루틴 인증 요청 알림 조회
      const authNotifications = await getNotificationsByType('GROUP_TODAY_AUTH_REQUEST');
      console.log('루틴 인증 요청 API 원본 데이터:', authNotifications);
      const authMessages = authNotifications.map((notification: NotificationApiResponse) => ({
        id: notification.id,
        nickname: notification.senderName,
        message: notification.content,
        //imageUrl: notification.imageUrl, // 인터페이스에 imageUrl이 없으므로 임시로 추가
        //routineId: notification.relatedId, // 인터페이스에 relatedId를 routineId로 매핑
       // userId: notification.relatedId // 사용자 ID도 relatedId로 가정
      }));
      console.log('루틴 인증 요청 가공된 데이터:', authMessages);
      setPendingAuths(authMessages);

      // 그룹 가입 요청 알림 조회
      const inviteNotifications = await getNotificationsByType('GROUP_JOIN_REQUEST');
      console.log('그룹 가입 요청 API 원본 데이터:', inviteNotifications);
      const inviteMessages = inviteNotifications.map((notification: NotificationApiResponse) => ({
        id: notification.id,
        user: notification.senderName
      }));
      console.log('그룹 가입 요청 가공된 데이터:', inviteMessages);
      setPendingInvites(inviteMessages);

      setShowApprovalModal(true);
    } catch (error) {
      alert("알림 목록을 불러오는데 실패했습니다.");
      console.error(error);
    }
  };

  // 루틴 인증 승인 및 거절을 위한 핸들러
  const handleApprove = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId, true);
      alert("인증을 승인했습니다.");
      setPendingAuths(prev => prev.filter(p => p.id !== notificationId));
      setShowApprovalModal(false);
    } catch (error) {
      alert("승인 처리에 실패했습니다.");
      console.error(error);
    }
  };

  const handleReject = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId, true);
      alert("인증을 거절했습니다.");
      setPendingAuths(prev => prev.filter(p => p.id !== notificationId));
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
        onRoutineAuthClick={handleRoutineAuthClick}
        onOpenEdit={() => setIsEditing(true)}
        onOpenApproval={handleOpenApprovalModal}
        onOpenExMembers={() => setShowExMembersModal(true)}
        pendingAuthCount={pendingAuths.length}
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
            authMessages={pendingAuths}
            inviteMessages={pendingInvites}
            onApprove={handleApprove}
            onReject={handleReject}
            onClose={() => setShowApprovalModal(false)}
          />
        </DialogContent>
      </Dialog>
      <GroupRoutineDialog
        isOpen={showRoutineModal}
        onOpenChange={setShowRoutineModal}
        onAuthSubmit={handleAuthSubmit}
        isMandatory={group?.isMandatory}
        selectedRoutine={group?.routines?.[0] || null}
      />
    </div>
  );
}