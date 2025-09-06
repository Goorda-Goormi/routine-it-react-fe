import React, { useState } from 'react';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { GroupDetailHeader } from './GroupDetailHeader';
import { GroupDetailTabs } from './GroupDetailTabs';
import { GroupMemberManager } from './GroupMemberManager';
import GroupEdit from './GroupEdit';
import { GroupApproval } from './GroupApproval';
import { GroupRoutineDialog } from '../GroupChat/GroupRoutineDialog';
import type { AuthMessage } from "../../../interfaces";
import { getGroupMembers } from '../../../api/group';

interface GroupDetailScreenProps {
  groupId: number;
  groups: any[];
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
  onUpdateGroup: (group: any) => void;
  //onJoinGroup: (groupId: number) => void;
  pendingAuthMessages: { [groupId: number]: AuthMessage[] };
  onAddAuthMessage: (groupId: number, data: any, nickname: string, userId: string | number,  routineId: number) => void;
  onApproveAuthMessage: (groupId: number, id: number) => void; 
  onRejectAuthMessage: (groupId: number, id: number) => void;
  currentUser: { nickname: string; id: string | number; profileImageUrl?: string };
}

export function GroupDetailScreen({
  groupId,
  groups,
  onBack,
  onNavigate,
  onUpdateGroup,
 // onJoinGroup,
  pendingAuthMessages,
  onAddAuthMessage,
  onApproveAuthMessage,
  onRejectAuthMessage,
  currentUser,
}: GroupDetailScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showExMembersModal, setShowExMembersModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);

  const group = groups.find((g) => g.groupId === groupId);
  const pendingGroupAuthMessages = pendingAuthMessages[groupId] || [];
  
  const isLeader = group?.isOwner ?? false;

  const weeklyRanking = [
    { rank: 1, nickname: '루티니', score: 95, change: 'up' },
    { rank: 2, nickname: '관습박', score: 88, change: 'same' },
    { rank: 3, nickname: '지속성',score: 82, change: 'down' },
  ];
  
  const recentActivities = [
    { id: 1, nickname: '루티니', action: '운동 인증 완료', time: '10분 전', image: null },
    { id: 2, nickname: '관습박', action: '목표 달성!', time: '1시간 전', image: null },
    { id: 3, nickname: '지속성', action: '운동 인증 완료', time: '2시간 전', image: null },
  ];

  //const handleJoinGroup = () => onJoinGroup(groupId);
  const handleChatClick = () => onNavigate('group-chat', group);
  const handleRoutineAuthClick = () => setShowRoutineModal(true);
  const handleMemberClick = (member: any) => onNavigate('user-home', member);

  const handleKickMember = (memberId: string | number) => {
    alert('멤버를 그룹에서 내보냈습니다.');
    setShowExMembersModal(false);
  };

  const handleDelegateLeader = (newLeaderId: string | number) => {
    alert('리더 권한이 성공적으로 위임되었습니다.');
    setShowExMembersModal(false);
  };

 const handleAuthSubmit = (data: { description: string; image: File | null; isPublic: boolean }) => {
  const routineId = 123; // 테스트용 루틴 ID 또는 실제 값
  onAddAuthMessage(groupId, data, currentUser.nickname,  currentUser.id, routineId);
  setShowRoutineModal(false);
};


  return (
    <div className="min-h-screen relative">
      <GroupDetailHeader
        group={group}
        isJoined={group?.isJoined}
        isLeader={isLeader}
        onBack={onBack}
       // onJoinGroup={handleJoinGroup}
        onChatClick={handleChatClick}
        onRoutineAuthClick={handleRoutineAuthClick}
        onOpenEdit={() => setIsEditing(true)}
        onOpenApproval={() => setShowApprovalModal(true)}
        onOpenExMembers={() => setShowExMembersModal(true)}
        pendingAuthCount={pendingGroupAuthMessages.length}
      />

      <div className="p-4 space-y-4">
        <GroupDetailTabs
          members={group?.recentMembers || []} // 그룹 상태에서 직접 가져오기
          weeklyRanking={weeklyRanking}
          recentActivities={recentActivities}
          onMemberClick={handleMemberClick}
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
        members={group?.recentMembers || []} // 그룹 상태에서 직접 가져오기
        onKickMember={handleKickMember}
        onDelegateLeader={handleDelegateLeader} 
      />

      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-md text-icon-secondary dark:text-white">
          <GroupApproval
        authMessages={pendingGroupAuthMessages}
        onApprove={(messageId) => {
          const message = pendingGroupAuthMessages.find(m => m.id === messageId);
          if (message) {
            console.log("인증 제출한 사용자 ID:", message.userId);
            console.log("승인 처리 대상 메시지 ID:", messageId);
            onApproveAuthMessage(groupId, messageId);
          }
          setShowApprovalModal(false);
        }}
        onReject={(messageId) => {
          const message = pendingGroupAuthMessages.find(m => m.id === messageId);
          if (message) {
            console.log("거절 처리 대상 사용자 ID:", message.userId);
          }
          onRejectAuthMessage(groupId, messageId);
          setShowApprovalModal(false);
        }}
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

