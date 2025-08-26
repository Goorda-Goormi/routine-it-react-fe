import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { MinusCircle, Crown } from 'lucide-react';

// 그룹 멤버 데이터 타입을 정의합니다. isLeader 속성을 추가합니다.
interface GroupMember {
  id: string;
  name: string;
  isLeader: boolean; // isLeader 속성 추가
}

// 컴포넌트 prop 인터페이스를 업데이트합니다.
interface GroupMemberManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: GroupMember[];
  onKickMember: (memberId: string) => void;
  onDelegateLeader: (memberId: string) => void;
}

export function GroupMemberManager({ open, onOpenChange, members, onKickMember, onDelegateLeader }: GroupMemberManagerProps) {
  const [showKickConfirmDialog, setShowKickConfirmDialog] = useState(false);
  const [showDelegateConfirmDialog, setShowDelegateConfirmDialog] = useState(false);
  const [memberToKickId, setMemberToKickId] = useState<string | null>(null);
  const [memberToDelegateId, setMemberToDelegateId] = useState<string | null>(null);

  const handleKickClick = (memberId: string) => {
    setMemberToKickId(memberId);
    setShowKickConfirmDialog(true);
  };

  const handleDelegateClick = (memberId: string) => {
    setMemberToDelegateId(memberId);
    setShowDelegateConfirmDialog(true);
  };

  const handleConfirmKick = () => {
    if (memberToKickId) {
      onKickMember(memberToKickId);
      setMemberToKickId(null);
      setShowKickConfirmDialog(false);
    }
  };

  const handleConfirmDelegate = () => {
    if (memberToDelegateId) {
      onDelegateLeader(memberToDelegateId);
      setMemberToDelegateId(null);
      setShowDelegateConfirmDialog(false);
      onOpenChange(false);
    }
  };

  const handleCancelKick = () => {
    setMemberToKickId(null);
    setShowKickConfirmDialog(false);
  };

  const handleCancelDelegate = () => {
    setMemberToDelegateId(null);
    setShowDelegateConfirmDialog(false);
  };

  const delegateMemberName = members.find(m => m.id === memberToDelegateId)?.name;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className=" max-w-md text-icon-secondary dark:text-white rounded-xl">
          <DialogHeader>
            <DialogTitle>그룹 멤버 관리</DialogTitle>
            <DialogDescription>
              아래 목록에서 그룹 멤버를 관리하거나 리더 권한을 위임할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {members.length > 0 ? (
              members.map(member => (
                <div key={member.id} className="flex items-center justify-between space-x-2 p-2 rounded-md bg-secondary/30">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">
                        {member.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-card-foreground">
                      {member.name}
                    </span>
                  </div>
                  {/* 여기를 수정했습니다. member.isLeader 속성을 직접 사용합니다. */}
                  {member.isLeader ? (
                    <div className="flex items-center space-x-1 text-yellow-500 font-bold text-sm">
                      <Crown className="h-4 w-4" />
                      <span>그룹 리더</span>
                    </div>
                  ) : (
                    <div className='flex space-x-2'>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleDelegateClick(member.id)} 
                         className="hover:text-yellow-500"
                         title="리더 위임"
                       >
                         <Crown className="h-4 w-4" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleKickClick(member.id)} 
                         className="hover:text-destructive"
                         title="멤버 내보내기"
                       >
                         <MinusCircle className="h-4 w-4" />
                       </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground text-sm py-4">
                그룹에 멤버가 없습니다.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 멤버 내보내기 확인 모달 */}
      <Dialog open={showKickConfirmDialog} onOpenChange={setShowKickConfirmDialog}>
        <DialogContent className="max-w-md text-icon-secondary dark:text-white rounded-xl">
          <DialogHeader>
            <DialogTitle>멤버 내보내기</DialogTitle>
            <DialogDescription>
              정말로 이 멤버를 그룹에서 내보내시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelKick}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleConfirmKick}>
              내보내기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 리더 위임 확인 모달 */}
      <Dialog open={showDelegateConfirmDialog} onOpenChange={setShowDelegateConfirmDialog}>
        <DialogContent className="max-w-md text-icon-secondary dark:text-white rounded-xl">
          <DialogHeader>
            <DialogTitle>리더 권한 위임</DialogTitle>
            <DialogDescription>
              정말로 {delegateMemberName || '이 멤버'}에게 리더 권한을 위임하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelegate}>
              취소
            </Button>
            <Button variant="default" onClick={handleConfirmDelegate}>
              위임
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}