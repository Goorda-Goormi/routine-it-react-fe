import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

interface MonthlyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewContent: string;
  monthYear: string;
}

export function MonthlyReviewModal({ isOpen, onClose, reviewContent, monthYear }: MonthlyReviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{monthYear} 월간 회고</DialogTitle>
          <DialogDescription>
            지난 한 달간의 루틴 활동을 돌아보세요.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 my-2 max-h-[60vh] overflow-y-auto text-sm text-foreground whitespace-pre-wrap">
          {reviewContent}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}