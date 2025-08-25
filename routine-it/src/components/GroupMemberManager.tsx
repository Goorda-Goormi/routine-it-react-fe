import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
import { MinusCircle } from 'lucide-react';

// 그룹 멤버 데이터 타입을 정의합니다.
interface GroupMember {
  id: string;
  name: string;
}

// 컴포넌트 prop 인터페이스를 업데이트합니다.
interface GroupMemberManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: GroupMember[];
  onKickMember: (memberId: string) => void;
}

export function GroupMemberManager({ open, onOpenChange, members, onKickMember }: GroupMemberManagerProps) {
  // 확인 모달의 상태와 내보낼 멤버의 ID를 관리하는 상태를 추가합니다.
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [memberToKickId, setMemberToKickId] = useState<string | null>(null);

  // 내보내기 버튼 클릭 시 호출되는 함수입니다.
  const handleKickClick = (memberId: string) => {
    setMemberToKickId(memberId);
    setShowConfirmDialog(true);
  };

  // 확인 모달에서 '내보내기' 버튼 클릭 시 호출되는 함수입니다.
  const handleConfirmKick = () => {
    if (memberToKickId) {
      onKickMember(memberToKickId);
      setMemberToKickId(null);
      setShowConfirmDialog(false);
    }
  };

  // 확인 모달에서 '취소' 버튼 클릭 시 호출되는 함수입니다.
  const handleCancelKick = () => {
    setMemberToKickId(null);
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className=" max-w-md text-icon-secondary dark:text-white rounded-xl">
          <DialogHeader>
            <DialogTitle>그룹 멤버 관리</DialogTitle>
            <DialogDescription>
              아래 목록에서 그룹 멤버를 관리하거나 강제로 내보낼 수 있습니다.
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
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    // '내보내기' 버튼을 누르면 확인 함수를 호출합니다.
                    onClick={() => handleKickClick(member.id)} 
                    className="hover:text-destructive"
                    title="멤버 내보내기"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
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
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
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
    </>
  );
}