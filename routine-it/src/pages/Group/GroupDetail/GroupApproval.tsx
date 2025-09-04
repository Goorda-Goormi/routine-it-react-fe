import React from 'react';
import { Button } from '../../../components/ui/button';
import { DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import type { AuthMessage } from '../../../interfaces';

interface InviteMessage {
  id: number;
  user: string;
}

interface GroupApprovalProps {
  authMessages: AuthMessage[];
  inviteMessages?: InviteMessage[]; // 초대 대기 유저
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onClose?: () => void;
}

export function GroupApproval({
  authMessages,
  inviteMessages = [
    { id: 1, user: "더미 유저 A" },
    { id: 2, user: "더미 유저 B" },
  ],
  onApprove,
  onReject,
  onClose,
}: GroupApprovalProps) {
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>승인 관리</DialogTitle>
        <DialogDescription>
          초대 승인 대기 유저와 루틴 인증 대기를 확인하세요.
        </DialogDescription>
      </DialogHeader>

      {/* 초대 승인 대기 유저 목록 */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">📌 초대 승인 대기 유저</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {inviteMessages.length === 0 && (
            <p className="text-sm text-muted-foreground">대기 중인 유저가 없습니다.</p>
          )}
          {inviteMessages.map(invite => (
            <div
              key={invite.id}
              className="flex justify-between items-center p-2 rounded hover:bg-accent/20"
            >
              <span className="text-sm font-medium">{invite.user}</span>
              <div className="space-x-1">
                <Button
                  size="sm"
                  className="bg-green-400 hover:bg-green-500 text-white"
                  onClick={() => {
                    onApprove(invite.id);
                    //onClose?.();
                  }}
                >
                  승인
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    onReject(invite.id);
                    //onClose?.();
                  }}
                >
                  거절
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/*<hr className="border-t border-t-[var(--color-border-bottom-custom)]" />*/}
          <hr className="border-t border-t-[var(--color-border-bottom-custom)]" />
      {/* 루틴 인증 대기 목록 */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">📸 루틴 인증 대기</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {authMessages.length === 0 && (
            <p className="text-sm text-muted-foreground">승인할 인증이 없습니다.</p>
          )}
          {authMessages.map(auth => (
            <div
              key={auth.id}
              className="flex flex-col space-y-2 p-2 rounded hover:bg-accent/20"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {auth.nickname} - {auth.message}
                </span>
                <div className="space-x-1">
                  <Button
                    size="sm"
                    className="bg-green-400 hover:bg-green-500 text-white"
                    onClick={() => {
                      onApprove(auth.id);
                      onClose?.();
                    }}
                  >
                    승인
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() => {
                      onReject(auth.id);
                      onClose?.();
                    }}
                  >
                    거절
                  </Button>
                </div>
              </div>

              <img
                src={
                  auth.imageUrl ||
                  'https://via.placeholder.com/400x200?text=Placeholder+Image'
                }
                alt="인증 이미지"
                className="max-h-40 rounded-lg object-cover cursor-pointer"
                onClick={() =>
                  window.open(
                    auth.imageUrl ||
                      'https://via.placeholder.com/400x200?text=Placeholder+Image',
                    '_blank'
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
