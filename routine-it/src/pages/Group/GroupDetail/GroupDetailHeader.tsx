import React from 'react';
import {
  ArrowLeft,
  Users,
  MessageCircle,
  Settings,
  Crown,
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

import type { GroupMemberResponse } from '../../../interfaces';
import { deleteGroup, requestJoinGroup } from '../../../api/group';

interface GroupDetailHeaderProps {
  group: any;
  isJoined: boolean;
  //isLeader: boolean;
  onBack: () => void;
 // onJoinGroup: () => void;
  onChatClick: () => void;
  onRoutineAuthClick: () => void;
  onOpenEdit: () => void;
  onOpenApproval: () => void;
  onOpenExMembers: () => void;
  pendingAuthCount: number;
  groupMembers: GroupMemberResponse[];
  onGroupDeleted: () => void; 
  myid: string | number;
}

export const GroupDetailHeader = ({
  group,
  isJoined,
  //isLeader,
  onBack,
 // onJoinGroup,
  onChatClick,
  onRoutineAuthClick,
  onOpenEdit,
  onOpenApproval,
  onOpenExMembers,
  pendingAuthCount,
  groupMembers,
  onGroupDeleted,
  myid,
}: GroupDetailHeaderProps) => {
  const myIdAsNumber = typeof myid === 'string' ? parseInt(myid, 10) : myid;
  
  const isLeader = groupMembers.some(member => member.role === 'LEADER' && member.groupMemberId === myIdAsNumber);
  //const isJoined = groupMembers.some(
  //(member) => member.status === 'JOINED' && member.groupMemberId === myid
//);

console.log('--- GroupDetailHeader Variables ---');
  console.log('GroupDetailHeader: isJoined:', isJoined);
  console.log('GroupDetailHeader: isLeader:', isLeader);
  console.log('GroupDetailHeader: myid:', myid, `(${typeof myid})`);
  console.log('GroupDetailHeader: group:', group);
  console.log('GroupDetailHeader: groupMembers:', groupMembers);
  console.log('-----------------------------------');
  const handleMenuClick = async (action: string) => {
    switch (action) {
      case 'edit':
        onOpenEdit();
        break;
      case 'approval':
        onOpenApproval();
        break;
      case 'ex-members':
        onOpenExMembers();
        break;
      case 'delete':
        if (window.confirm("정말로 그룹을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
          onGroupDeleted();
        }
        break;
      default:
        break;
    }
  };

  // 그룹 가입 요청 처리 함수
  const handleJoinGroup = async () => {
    try {
      await requestJoinGroup(group.groupId, myIdAsNumber);

      if (group.groupType === 'FREE') {
        alert('그룹에 성공적으로 가입되었습니다.');
      } else {
        alert('그룹 가입 요청이 전송되었습니다. 리더의 승인을 기다려주세요.');
      }

      // 가입 요청 성공 후, 상위 컴포넌트의 멤버 목록을 새로고침
      // `getGroupMembers` 함수를 호출하여 데이터를 업데이트
      // 이 로직은 `GroupDetailScreen`에서 관리하는 것이 더 적합합니다.
      // 따라서 `onGroupJoined` 함수를 사용하는 것이 좋습니다.
      // 다만, 요구사항에 따라 `GroupDetailHeader`에서 직접 로직을 처리하는 예시를 보여드립니다.
      // 이 코드를 사용하려면 `GroupDetailScreen`에서 `setGroupMembers` 상태 관리 함수를 props로 넘겨줘야 합니다.
      // 이 방식은 컴포넌트 간 의존성을 높이므로 추천하지는 않습니다.
      //
      // **(대안) `GroupDetailHeader`에서 직접 처리하는 로직은 다음과 같지만,
      //   `GroupDetailScreen`에 `onGroupJoined` 함수를 만들어 전달하는 것이 더 깔끔합니다.**
      //
      // try {
      //   const updatedMembers = await getGroupMembers(group.groupId);
      //   // 상위 컴포넌트의 `setGroupMembers` 함수가 props로 전달되어야 함.
      //   // onSetGroupMembers(updatedMembers);
      // } catch (fetchError) {
      //   console.error("멤버 목록 새로고침 실패:", fetchError);
      // }
      
      // onGroupJoined를 사용하지 않고, 상위 컴포넌트에서 이 버튼 클릭에 대한 로직을 처리하는 것이 좋습니다.
      // 따라서 여기서는 단순히 alert를 띄우는 것까지만 진행하고,
      // 상위 컴포넌트에서 `groupMembers` 상태가 변경될 때 UI가 자동으로 업데이트되도록 하는 것이 올바른 방향입니다.
      
    } catch (error) {
      alert('그룹 가입 요청에 실패했습니다.');
      console.error("그룹 가입 실패:", error);
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur ">
      <div className="flex items-center justify-between backdrop-blur p-4 border-b border-b-[var(--color-border-bottom-custom)]">
        <div className="flex items-center space-x-3 ">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-1">
            <ArrowLeft className="h-5 w-5 text-icon-secondary dark:text-white" />
          </Button>
          <h1 className="font-bold text-card-foreground">그룹 상세</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-card-foreground hover:text-card-foreground"></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={!isLeader}>
              <Button
                variant="ghost"
                size="sm"
                className={`hover:bg-accent ${isLeader ? 'text-card-foreground' : 'text-muted-foreground'}`}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleMenuClick('edit')}>그룹 정보 편집</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleMenuClick('approval')} className="relative">
                <div className="flex items-center justify-between w-full">
                  <span>인증 승인 / 반려</span>
                  {pendingAuthCount > 0 && (
                    <Badge variant="destructive" className="ml-2 px-2 py-0.5 text-xs">
                      {pendingAuthCount}
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleMenuClick('ex-members')}>멤버 관리하기</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleMenuClick('delete')}>그룹 삭제하기</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-card-foreground">{group.groupName}</h2>
                <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="font-bold text-card-foreground">{group.currentMemberCount}</div>
                  <div className="text-xs text-muted-foreground">참여자</div>
                </div>
                <div className="text-center">
                  <Badge variant={group.type === 'REUQIRED' ? 'destructive' : 'secondary'}>{group.type === "REQUIRED" ? "의무참여":"자유참여"}</Badge>
                  <div className="text-xs text-muted-foreground mt-1">그룹 유형</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-card-foreground">{group.alarmTime ? group.alarmTime.slice(0, 5) : ''}</div>
                  <div className="text-xs text-muted-foreground">인증 시간</div>
                </div>
              </div>
              {!isJoined ? (
                <Button onClick={handleJoinGroup} className="w-full">그룹 참여하기</Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={onChatClick} className="flex-1">
                    <MessageCircle className="h-4 w-4 mr-2 icon-primary" />
                    채팅하기
                  </Button>
                  <Button
                    onClick={onRoutineAuthClick}
                    variant="outline"
                    className="flex-1 text-card-foreground border-border hover:bg-accent hover:text-card-foreground"
                  >
                    인증하기
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};