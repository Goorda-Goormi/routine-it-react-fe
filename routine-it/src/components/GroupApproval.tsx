import React from 'react';
import { Button } from './ui/button';
import { DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface AuthMessage {
  id: number;
  user: string;
  message: string;
}

interface GroupApprovalProps {
  authMessages: AuthMessage[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onClose?: () => void;
}

export function GroupApproval({ authMessages, onApprove, onReject, onClose }: GroupApprovalProps) {
  return (
    <div className="space-y-2">
      <DialogHeader>
        <DialogTitle>인증 승인 관리</DialogTitle>
        <DialogDescription>그룹원이 올린 인증을 승인/거절할 수 있습니다.</DialogDescription>
      </DialogHeader>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {authMessages.length === 0 && (
          <p className="text-sm text-muted-foreground">승인할 인증이 없습니다.</p>
        )}
        {authMessages.map(auth => (
          <div
            key={auth.id}
            className="flex justify-between items-center p-2 rounded hover:bg-accent/20"
          >
            <span>{auth.user} - {auth.message}</span>
            <div className="space-x-1">
              <Button
                size="sm"
                className="bg-green-400  hover:bg-green-500 text-white"
                onClick={() => { onApprove(auth.id); onClose?.(); }}
              >
                승인
              </Button>
              <Button
                size="sm"
               className="bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                onClick={() => { onReject(auth.id); onClose?.(); }}
              >
                거절
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
