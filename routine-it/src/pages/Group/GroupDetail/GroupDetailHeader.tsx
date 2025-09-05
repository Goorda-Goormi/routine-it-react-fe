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

interface GroupDetailHeaderProps {
  group: any;
  isJoined: boolean;
  isLeader: boolean;
  onBack: () => void;
 // onJoinGroup: () => void;
  onChatClick: () => void;
  onRoutineAuthClick: () => void;
  onOpenEdit: () => void;
  onOpenApproval: () => void;
  onOpenExMembers: () => void;
  pendingAuthCount: number;
}

export const GroupDetailHeader = ({
  group,
  isJoined,
  isLeader,
  onBack,
 // onJoinGroup,
  onChatClick,
  onRoutineAuthClick,
  onOpenEdit,
  onOpenApproval,
  onOpenExMembers,
  pendingAuthCount,
}: GroupDetailHeaderProps) => {
  const handleMenuClick = (action: string) => {
    if (!isLeader) {
      // 이 부분은 이미 드롭다운이 비활성화되어 접근할 수 없지만, 혹시 모를 상황에 대비해 남겨둡니다.
      alert('리더만 권한이 있습니다');
      return;
    }

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
      default:
        break;
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
                  {/* pendingAuthCount가 0보다 클 때만 뱃지 표시 */}
                  {pendingAuthCount > 0 && (
                    <Badge variant="destructive" className="ml-2 px-2 py-0.5 text-xs">
                      {pendingAuthCount}
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleMenuClick('ex-members')}>멤버 관리하기</DropdownMenuItem>
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
                <p className="text-sm text-muted-foreground mt-1">{group.groupDescription}</p>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="font-bold text-card-foreground">{group.currentMemberCount}</div>
                  <div className="text-xs text-muted-foreground">참여자</div>
                </div>
                <div className="text-center">
                  <Badge variant={group.type === '의무참여' ? 'destructive' : 'secondary'}>{group.type === "REQUIRED" ? "의무참여":"자유참여"}</Badge>
                  <div className="text-xs text-muted-foreground mt-1">그룹 유형</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-card-foreground">{group.time}</div>
                  <div className="text-xs text-muted-foreground">인증 시간</div>
                </div>
              </div>
              {!isJoined ? (
                <Button /*onClick={onJoinGroup}*/ className="w-full">그룹 참여하기</Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={onChatClick} className="flex-1">
                    <MessageCircle className="h-4 w-4 mr-2 icon-primary" />
                    채팅
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