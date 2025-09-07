import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { GroupDetailHeader } from './GroupDetailHeader';
import { GroupDetailTabs } from './GroupDetailTabs';
import { GroupMemberManager } from './GroupMemberManager';
import GroupEdit from './GroupEdit';
import { GroupApproval } from './GroupApproval';
import { GroupRoutineDialog } from '../GroupChat/GroupRoutineDialog';
import type { AuthMessage,IPersonalRankingData } from "../../../interfaces";
import { getGroupMembers } from '../../../api/group';
import type { GroupMemberResponse } from "../../../interfaces";
import { deleteGroup,getJoinedGroups,delegateLeader } from '../../../api/group';
import { getGroupTop3Ranking } from '../../../api/ranking';
import type { GlobalGroupRankingData } from '../../Ranking/RankingScreen';

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
  groupMembers: GroupMemberResponse[];
  //onDeleteGroupSuccess: (deletedGroupId: number) => void;
  onDeleteGroupSuccess: () => void;
  myid: string | number;
  onGroupJoined: () => void;
  isJoined: boolean;
  
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

  const group = groups.find((g) => g.groupId === groupId);
  const pendingGroupAuthMessages = pendingAuthMessages[groupId] || [];
  const isLeader = group?.leaderName === currentUser.nickname;
  
   console.log('GroupDetailScreen: isLeader 계산 결과:', isLeader);
const [weeklyRanking, setWeeklyRanking] = useState<GlobalGroupRankingData[]>([]);

  
  const recentActivities = [
    { id: 1, nickname: '루티니', action: '운동 인증 완료', time: '10분 전', image: null },
    { id: 2, nickname: '관습박', action: '목표 달성!', time: '1시간 전', image: null },
    { id: 3, nickname: '지속성', action: '운동 인증 완료', time: '2시간 전', image: null },
  ];

  //const handleJoinGroup = () => onJoinGroup(groupId);
  const handleChatClick = () => onNavigate('group-chat', group);
  const handleRoutineAuthClick = () => setShowRoutineModal(true);
  const handleMemberClick = (member: any) => onNavigate('user-home', member);

  const handleKickMember = (groupMemberId: string | number) => {
    alert('멤버를 그룹에서 내보냈습니다.');
    setShowExMembersModal(false);
  };

  /*const handleDelegateLeader = (newLeaderId: string | number) => {
    alert('리더 권한이 성공적으로 위임되었습니다.');
    setShowExMembersModal(false);
  };*/

 const handleAuthSubmit = (data: { description: string; image: File | null; isPublic: boolean }) => {
  const routineId = 123; // 테스트용 루틴 ID 또는 실제 값
  onAddAuthMessage(groupId, data, currentUser.nickname,  currentUser.id, routineId);
  setShowRoutineModal(false);
};

// 그룹 삭제 로직을 GroupDetailScreen에 통합
 const handleGroupDeleted = async () => {
    if (group?.groupId) {
       try {
         await deleteGroup(group.groupId); // API 호출
        alert("그룹이 성공적으로 삭제되었습니다.");
         onDeleteGroupSuccess(); // ✅ 매개변수 없이 부모 컴포넌트에 삭제 완료 알림
      } catch (error) {
         console.error("그룹 삭제 실패:", error);
        alert("그룹 삭제에 실패했습니다.");
      }
     }
  };
useEffect(() => {
  const fetchRanking = async () => {
    // ✅ 1. currentUser와 currentUser.id가 유효한지 확인
    if (!currentUser || currentUser.id === undefined || currentUser.id === null) {
      console.error("사용자 정보가 없어 랭킹을 불러올 수 없습니다.");
      setWeeklyRanking([]); // 또는 로딩 상태를 유지
      return;
    }

    try {
      // 2. 유효성이 확인된 후 함수 호출
      const response = await getGroupTop3Ranking(groupId, Number(currentUser.id));
      
      console.log("API로부터 받은 전체 응답:", response);
      
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



// 리더 위임 비동기 함수를 GroupDetailScreen에서 구현합니다.
  const handleDelegateLeader = async (targetMemberId: number, targetMemberName: string) => {
  try {
    // API가 리더의 ID와 위임 대상의 ID를 받으므로, ID를 찾아서 전달합니다.
    const currentLeader = groupMembers.find(m => m.memberName === group.leaderName);
    
    if (!currentLeader) {
      alert("현재 리더 정보를 찾을 수 없습니다.");
      return;
    }

    const currentLeaderId = currentLeader.groupMemberId;
    
    // API 호출
    const response = await delegateLeader(group.groupId, Number(currentLeaderId), targetMemberId);
    
    // API 응답에 따라 성공 여부 판단
    if (response.success) { // API 응답에 success 필드가 있다고 가정
      alert(`그룹 리더가 ${targetMemberName}님으로 성공적으로 위임되었습니다.`);
      setShowExMembersModal(false);
      // 부모 컴포넌트의 그룹 정보를 업데이트하여 UI 갱신
      onUpdateGroup({ ...group, leaderName: targetMemberName, leaderId: targetMemberId });
    } else {
      alert(response.message || '리더 위임에 실패했습니다.');
    }
    
  } catch (error) {
    console.error("리더 위임 실패:", error);
    alert('리더 위임에 실패했습니다.');
  }
};

  return (
    <div className="min-h-screen relative">
      <GroupDetailHeader
        group={group}
        isJoined={isJoined}
        isLeader={isLeader}
        onBack={onBack}
       // onJoinGroup={handleJoinGroup}
        onChatClick={handleChatClick}
        onRoutineAuthClick={handleRoutineAuthClick}
        onOpenEdit={() => setIsEditing(true)}
        onOpenApproval={() => setShowApprovalModal(true)}
        onOpenExMembers={() => setShowExMembersModal(true)}
        pendingAuthCount={pendingGroupAuthMessages.length}
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


