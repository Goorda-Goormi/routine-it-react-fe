import React, { useState } from 'react';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { GroupDetailHeader } from './GroupDetailHeader';
import { GroupDetailTabs } from './GroupDetailTabs';
import { GroupMemberManager } from './GroupMemberManager';
import GroupEdit from './GroupEdit';
import { GroupApproval } from './GroupApproval';
import { GroupRoutineDialog } from '../GroupChat/GroupRoutineDialog';
import type { AuthMessage } from "../../../interfaces";
interface GroupDetailScreenProps {
  groupId: number;
  groups: any[];
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
  onUpdateGroup: (group: any) => void;
  onJoinGroup: (groupId: number) => void;
   // AuthMessage 배열만 받도록 타입 변경
   pendingAuthMessages: { [groupId: number]: AuthMessage[] };
  
  // 함수 호출 시 groupId를 넘기도록 변경 (App.tsx에서 이미 처리)
  onAddAuthMessage: (groupId: number, data: any, userName: string) => void;
  onApproveAuthMessage: (groupId: number, id: number) => void; 
  onRejectAuthMessage: (groupId: number, id: number) => void;
  
  currentUser: { name: string; id: string | number; avatar?: string };
}

export function GroupDetailScreen({
  groupId,
  groups,
  onBack,
  onNavigate,
  onUpdateGroup,
  onJoinGroup,
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
  
  const group = groups.find((g) => g.id === groupId);
   const pendingGroupAuthMessages = pendingAuthMessages[groupId] || [];
  // NOTE: 여기는 가상(mock) 데이터입니다. 실제 앱에서는 API를 통해 받아와야 합니다.
  // currentUser와 ID가 일치하는 멤버를 찾는 로직으로 변경했습니다.
  const members = group?.recentMembers ?? [
    {
      id: 1,
      name: '김루틴',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      rank: 1,
      score: 850,
      isOnline: true,
      isLeader: true,
      isCertified: true,
    },
    {
      id: 2,
      name: '박습관',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b95fcebf?w=40&h=40&fit=crop&crop=face',
      rank: 2,
      score: 780,
      isOnline: false,
      isLeader: false,
      isCertified: false,
    },
    // ... 더 많은 가상 멤버 데이터
  ];

  // group.isOwner를 사용하여 리더 여부를 판단합니다.
  const isLeader = group?.isOwner ?? false;

  // 나머지 코드는 그대로 유지됩니다.
  const weeklyRanking = [
    { rank: 1, name: '김루틴', score: 95, change: 'up' },
    { rank: 2, name: '박습관', score: 88, change: 'same' },
    { rank: 3, name: '이지속', score: 82, change: 'down' },
  ];
  const recentActivities = [
    { id: 1, user: '김루틴', action: '운동 인증 완료', time: '10분 전', image: null },
    { id: 2, user: '박습관', action: '목표 달성!', time: '1시간 전', image: null },
    { id: 3, user: '이지속', action: '운동 인증 완료', time: '2시간 전', image: null },
  ];
  const handleJoinGroup = () => {
    onJoinGroup(groupId);
  };
  const handleChatClick = () => {
    onNavigate('group-chat', group);
  };
  const handleRoutineAuthClick = () => {
    setShowRoutineModal(true);
  };
  const handleMemberClick = (member: any) => {
    onNavigate('user-home', member);
  };
  const handleKickMember = (memberId: string | number) => {
    // 실제로는 API 호출을 통해 멤버를 내보내야 합니다.
    alert('멤버를 그룹에서 내보냈습니다.');
    setShowExMembersModal(false);
  };
  const handleDelegateLeader = (newLeaderId: string | number) => {
    // 실제로는 API 호출을 통해 리더를 위임해야 합니다.
    alert('리더 권한이 성공적으로 위임되었습니다.');
    setShowExMembersModal(false);
  };
  const handleAuthSubmit = (data: { description: string; image: File | null; isPublic: boolean }) => {
    onAddAuthMessage(groupId, data, currentUser.name);
    setShowRoutineModal(false);
  };
  const handleApprove = (id: number) => {
    onApproveAuthMessage(groupId, id);


    setShowApprovalModal(false);
  };
  const handleReject = (id: number) => {
    onRejectAuthMessage(groupId, id);

  
    setShowApprovalModal(false);
  };

  return (
    <div className="min-h-screen relative">
      <GroupDetailHeader
        group={group}
        isJoined={group?.isJoined}
        isLeader={isLeader} // group.isOwner를 사용
        onBack={onBack}
        onJoinGroup={handleJoinGroup}
        onChatClick={handleChatClick}
        onRoutineAuthClick={handleRoutineAuthClick}
        onOpenEdit={() => setIsEditing(true)}
        onOpenApproval={() => setShowApprovalModal(true)}
        onOpenExMembers={() => setShowExMembersModal(true)}
        pendingAuthCount={pendingGroupAuthMessages.length}
      />
      <div className="p-4 space-y-4">
        <GroupDetailTabs
          members={members}
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
        members={members}
        onKickMember={handleKickMember}
        onDelegateLeader={handleDelegateLeader} 
      />
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-md text-icon-secondary dark:text-white">
          <GroupApproval
            authMessages={pendingGroupAuthMessages}
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
      />
    </div>
  );
}