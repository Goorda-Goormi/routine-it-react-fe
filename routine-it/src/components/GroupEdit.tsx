import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface GroupEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupEdit({ open, onOpenChange }: GroupEditProps) {
  const [groupName, setGroupName] = useState('내 그룹');

  const handleSave = () => {
    alert(`그룹 이름이 "${groupName}"(으)로 변경되었습니다.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">그룹 편집</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>그룹 편집</DialogTitle>
          <DialogDescription>그룹 이름을 수정하세요.</DialogDescription>
        </DialogHeader>
        <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} />
        <Button onClick={handleSave} className="mt-2 w-full">저장</Button>
      </DialogContent>
    </Dialog>
  );
}
