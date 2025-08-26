/*import React from 'react';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';

interface GroupExitedMembersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupExitedMembers({ open, onOpenChange }: GroupExitedMembersProps) {
  const exitedMembers = [
    { id: 1, name: '탈퇴한 유저1' },
    { id: 2, name: '탈퇴한 유저2' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">탈퇴 멤버</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>탈퇴한 멤버</DialogTitle>
          <DialogDescription>이전에 그룹을 떠난 멤버 목록입니다.</DialogDescription>
        </DialogHeader>
        <ul className="list-disc pl-5 space-y-1">
          {exitedMembers.map((m) => (
            <li key={m.id}>{m.name}</li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
*/
