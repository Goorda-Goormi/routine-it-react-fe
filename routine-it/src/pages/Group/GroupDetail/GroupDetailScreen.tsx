import React, { useState } from 'react';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { GroupDetailHeader } from './GroupDetailHeader';
import { GroupDetailTabs } from './GroupDetailTabs';
import { GroupMemberManager } from './GroupMemberManager';
import GroupEdit from './GroupEdit';
import { GroupApproval } from './GroupApproval';
import { GroupRoutineDialog } from '../GroupChat/GroupRoutineDialog';

interface GroupDetailScreenProps {
   groupId: number;
  groups: any[];
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
  onUpdateGroup: (group: any) => void;
}

export function GroupDetailScreen({
  groupId,
  groups,
  onBack,
  onNavigate,
  onUpdateGroup,
}: GroupDetailScreenProps){
  const [isJoined, setIsJoined] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showExMembersModal, setShowExMembersModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
   const group = groups.find(g => g.id === groupId);

  // 가상 데이터
  const [members, setMembers] = useState([
    {
      id: '1',
      name: '김루틴',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      rank: 1,
      score: 850,
      isOnline: true,
      isLeader: true,
      isCertified: true,
    },
    {
      id: '2',
      name: '박습관',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b95fcebf?w=40&h=40&fit=crop&crop=face',
      rank: 2,
      score: 780,
      isOnline: false,
      isLeader: false,
      isCertified: false,
    },
    {
      id: '3',
      name: '이지속',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      rank: 3,
      score: 720,
      isOnline: true,
      isLeader: false,
      isCertified: true,
    },
    {
      id: '4',
      name: '최노력',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      rank: 4,
      score: 680,
      isOnline: false,
      isLeader: false,
      isCertified: false,
    },
    {
      id: '5',
      name: '정성실',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      rank: 5,
      score: 650,
      isOnline: true,
      isLeader: false,
      isCertified: true,
    },
  ]);

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

  const authMessages = [
    { id: 1, user: '이지속', message: '오전 운동 인증' },
    { id: 2, user: '박습관', message: '아침 독서 완료' },
  ];

  const currentUser = { id: '1', name: '김루틴' };
  const isLeader = members.find((m) => m.id === currentUser.id)?.isLeader ?? false;

  const handleJoinGroup = () => {
    setIsJoined(true);
  };

  const handleChatClick = () => {
    onNavigate('group-chat', group);
  };

  const handleRoutineAuthClick = () => {
    setShowRoutineModal(true);
  };

  const handleAuthSubmit = (data: { description: string; image: File | null; isPublic: boolean }) => {
    console.log('인증 데이터 제출:', data);
    alert('인증이 제출되었습니다!');
    setShowRoutineModal(false);
  };

  const handleMemberClick = (member: any) => {
    onNavigate('user-home', member);
  };

  const handleKickMember = (memberId: string) => {
    setMembers(members.filter((member) => member.id !== memberId));
    alert('멤버를 그룹에서 내보냈습니다.');
    setShowExMembersModal(false);
  };

  const handleDelegateLeader = (newLeaderId: string) => {
    // 새로운 리더 ID를 받아 멤버 상태를 업데이트합니다.
    const updatedMembers = members.map(member => ({
      ...member,
      isLeader: member.id === newLeaderId,
    }));
    setMembers(updatedMembers);
    alert('리더 권한이 성공적으로 위임되었습니다.');
    setShowExMembersModal(false);
  };

  const handleApprove = (id: number) => {
    console.log(`${id}번 인증을 승인했습니다.`);
    alert(`${id}번 인증이 승인되었습니다.`);
    setShowApprovalModal(false);
  };

  const handleReject = (id: number) => {
    console.log(`${id}번 인증을 거절했습니다.`);
    alert(`${id}번 인증이 거절되었습니다.`);
    setShowApprovalModal(false);
  };

  return (
    <div className="min-h-screen relative">
      <GroupDetailHeader
        group={group}
        isJoined={isJoined}
        isLeader={isLeader}
        onBack={onBack}
        onJoinGroup={handleJoinGroup}
        onChatClick={handleChatClick}
        onRoutineAuthClick={handleRoutineAuthClick}
        onOpenEdit={() => setIsEditing(true)}
        onOpenApproval={() => setShowApprovalModal(true)}
        onOpenExMembers={() => setShowExMembersModal(true)}
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
    group={group} // 최신 group 참조
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
            authMessages={authMessages}
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