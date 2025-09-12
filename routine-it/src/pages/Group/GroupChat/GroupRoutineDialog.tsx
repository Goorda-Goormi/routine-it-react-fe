// src/components/GroupChat/GroupRoutineDialog.tsx
import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Camera, CheckCircle } from 'lucide-react';
import type { Group, Routine } from '../../../interfaces';

interface GroupRoutineDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // ✅ group 데이터를 onAuthSubmit 함수에 추가로 전달
  onAuthSubmit: (data: { description: string; image: File | null; isPublic: boolean }) => void;
  selectedRoutine: Routine | null; 
  group: Group;
}

export function GroupRoutineDialog({ isOpen, onOpenChange, onAuthSubmit, group }: GroupRoutineDialogProps) {
  const [authData, setAuthData] = useState({
    description: '',
    image: null as File | null,
    isPublic: true,
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAuthData({ ...authData, image: file });
    }
  };

  const handleSubmit = () => {
     if (group.groupType==="REQUIRED" && !authData.image) {
        alert('의무 참여 그룹은 사진 인증이 필수입니다!');
        return;
    }
    
    if (authData.description.trim() || authData.image) {
      // ✅ onAuthSubmit 함수 호출
      onAuthSubmit(authData);
      setAuthData({ description: '', image: null, isPublic: true });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {group && (
      <DialogContent className="max-w-sm mx-auto dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">루틴 인증하기</DialogTitle>
          <DialogDescription>오늘의 루틴 수행 내용을 그룹 멤버들과 공유해주세요.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="description" className="text-card-foreground">인증 내용</Label>
            <Textarea
              id="description"
              placeholder="오늘의 루틴 수행 내용을 적어주세요"
              value={authData.description}
              onChange={(e) => setAuthData({...authData, description: e.target.value})}
              rows={3}
              className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <Label htmlFor="image" className="text-card-foreground">
              사진 첨부 ({group.groupType==="REQUIRED" ? '필수' : '선택'})
              </Label>
            <div className="mt-2">
              <input type="file" id="image" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <Button
                type="button"
                variant="outline"
                className="w-full text-card-foreground border-border hover:bg-accent hover:text-card-foreground"
                onClick={() => document.getElementById('image')?.click()}
              >
                <Camera className="h-4 w-4 mr-2 icon-secondary" />
                {authData.image ? authData.image.name : '사진 선택'}
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is-public"
              checked={authData.isPublic}
              onChange={(e) => setAuthData({...authData, isPublic: e.target.checked})}
              className="form-checkbox h-4 w-4 text-green-600 rounded"
            />
            <Label htmlFor="is-public" className="text-sm font-medium text-card-foreground">
              {authData.isPublic ? '전체 공개' : '나만 보기'}
            </Label>
          </div>
          <Button 
            onClick={handleSubmit} 
            className="w-full bg-green-600 hover:bg-green-700 text-gray-700"
              disabled={!authData.description.trim() || (group.groupType==="REQUIRED" && !authData.image)}
          >
            인증 완료
          </Button>
        </div>
      </DialogContent>
      )}
    </Dialog>
  );
}