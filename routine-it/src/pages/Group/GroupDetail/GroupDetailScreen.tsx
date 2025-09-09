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
import { deleteGroup,getJoinedGroups,delegateLeader, } from '../../../api/group';
import { getGroupTop3Ranking } from '../../../api/ranking';
import type { GlobalGroupRankingData } from '../../Ranking/RankingScreen';
import { getPendingAuthMembers, updateAuthStatus, requestAuthApproval } from '../../../api/group'; 

interface GroupDetailScreenProps {
  groupId: number;
  groups: any[];
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
  onUpdateGroup: (group: any) => void;
  //onJoinGroup: (groupId: number) => void;
  //pendingAuthMessages: { [groupId: number]: AuthMessage[] };
  //onAddAuthMessage: (groupId: number, data: any, nickname: string, userId: string | number,  routineId: number) => void;
  //onApproveAuthMessage: (groupId: number, id: number) => void; 
  //onRejectAuthMessage: (groupId: number, id: number) => void;
  currentUser: { nickname: string; id: string | number; profileImageUrl?: string };
  groupMembers: GroupMemberResponse[];
  //onDeleteGroupSuccess: (deletedGroupId: number) => void;
  onDeleteGroupSuccess: () => void;
  //myid: string | number;
  myid:number;
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
  // pendingAuthMessages,
  // onAddAuthMessage,
  // onApproveAuthMessage,
  // onRejectAuthMessage,
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
  const group = groups.find((g) => g.groupId === groupId);
  
  if (!group) {
    return <div>그룹 정보를 불러오는 중이거나, 그룹을 찾을 수 없습니다.</div>;
  }
  //const pendingGroupAuthMessages = pendingAuthMessages[groupId] || [];
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

 const handleAuthSubmit = async (data: { description: string; image: File | null; isPublic: boolean }) => {
    const leader = groupMembers.find(member => member.role === 'LEADER');
    
    if (!leader) {
      alert('그룹 리더 정보를 찾을 수 없어 인증을 요청할 수 없습니다.');
      setShowRoutineModal(false);
      return;
    }

    // 필요한 다른 데이터가 있다면 formData에 추가합니다.
    
    try {

    const authData = {
      leaderId: leader.groupMemberId,
      targetMemberId: myid, 
      activityDate: new Date().toISOString().split('T')[0], 
      imageUrl: "https://placeholder.com/image.jpg", 
    };

    // 3. API를 호출합니다.
    await requestAuthApproval(groupId, authData);
    alert('인증이 성공적으로 제출되었습니다.');
    setShowRoutineModal(false);

  } catch (error) {
    alert('인증 제출에 실패했습니다.');
    console.error(error);
  }
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

// ▼▼▼ '승인 관리' 모달을 열 때 API를 호출하는 함수 추가 ▼▼▼
  const handleOpenApprovalModal = async () => {
    try {
      const pendingMembers = await getPendingAuthMembers(groupId);
      const transformedAuths: AuthMessage[] = pendingMembers.map(member => ({
        id: member.groupMemberId, 
        userId: member.groupMemberId, 
        nickname: member.memberName,
        message: member.message || '인증 요청', 
        imageUrl: null, 
        routineId: 0,
      }));

      setPendingAuths(transformedAuths || []);
    setShowApprovalModal(true);

  } catch (error) {
    alert("인증 대기 목록을 불러오는데 실패했습니다.");
    console.error(error);
  }
};

  // ▼▼▼ '승인' 버튼을 눌렀을 때 API를 호출하는 함수 추가 ▼▼▼
  const handleApprove = async (authId: number) => {

    // 1. 승인할 대상(targetMember)의 정보를 pendingAuths 목록에서 찾습니다.
    const targetAuth = pendingAuths.find(auth => auth.id === authId);
    // 2. 현재 그룹 리더의 정보를 groupMembers 목록에서 찾습니다.
    const leader = groupMembers.find(member => member.role === 'LEADER');

  if (!targetAuth || !leader) {
    alert("승인 처리 중 오류가 발생했습니다. (사용자 또는 리더 정보 없음)");
    return;
  }

    try {
    // 3. API가 요구하는 모든 정보를 담아 payload 객체를 만듭니다.
    const payload = {
      groupId: groupId,
      leaderId: leader.groupMemberId,
      targetMemberId: targetAuth.userId as number, // targetMemberId는 인증을 올린 사람의 ID
      approved: true, // 승인이므로 true
    };
    
    // 4. 수정한 API 함수를 호출합니다.
    await updateAuthStatus(payload);
    alert("인증을 승인했습니다.");
    
    // 성공 시, 목록에서 해당 항목을 제거하고 모달을 닫음
    setPendingAuths(prev => prev.filter(p => p.id !== authId));
    setShowApprovalModal(false);

  } catch (error) {
    alert("승인 처리에 실패했습니다.");
  }
};

  // ▼▼▼ '거절' 버튼을 눌렀을 때 API를 호출하는 함수 추가 ▼▼▼
  const handleReject = async (authId: number) => {
    const targetAuth = pendingAuths.find(auth => auth.id === authId);
    const leader = groupMembers.find(member => member.role === 'LEADER');

    if (!targetAuth || !leader) {
      alert("거절 처리 중 오류가 발생했습니다. (사용자 또는 리더 정보 없음)");
      return;
    }

    try {
      const payload = {
        groupId: groupId,
        leaderId: leader.groupMemberId,
        targetMemberId: targetAuth.userId as number,
        approved: false, // 거절이므로 false
      };

      await updateAuthStatus(payload);
      alert("인증을 거절했습니다.");
      
      setPendingAuths(prev => prev.filter(p => p.id !== authId));
      setShowApprovalModal(false);

    } catch (error) {
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
       // onJoinGroup={handleJoinGroup}
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
            authMessages={pendingAuths} // API로 받아온 데이터를 전달
            onApprove={handleApprove} // 새로 만든 핸들러 전달
            onReject={handleReject} 
            // onApprove={(messageId) => {
            //   const message = pendingGroupAuthMessages.find(m => m.id === messageId);
            //   if (message) {
            //     console.log("인증 제출한 사용자 ID:", message.userId);
            //     console.log("승인 처리 대상 메시지 ID:", messageId);
            //     onApproveAuthMessage(groupId, messageId);
            //   }
            //   setShowApprovalModal(false);
            // }}
            // onReject={(messageId) => {
            //   const message = pendingGroupAuthMessages.find(m => m.id === messageId);
            //   if (message) {
            //     console.log("거절 처리 대상 사용자 ID:", message.userId);
            //   }
            //   onRejectAuthMessage(groupId, messageId);
            //   setShowApprovalModal(false);
            // }}
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


