import React from 'react';
import { CommonModal } from './CommonModal';
import { Button } from '../ui/button';
import { getStreakInfo, getStreakMessage } from '../utils/streakUtils';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
}

export function StreakModal({ isOpen, onClose, streakDays }: StreakModalProps) {
  const streakInfo = getStreakInfo(streakDays);
  const streakMessage = getStreakMessage(streakDays);

  return (
    <CommonModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className={`p-4 w-15 h-15 flex items-center justify-center rounded-full ${streakInfo.bgColor}`}>
          <span className="text-4xl">{streakInfo.icon}</span>
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground">
            어느덧 {streakDays}일!
          </h3>
          <p className="text-sm text-muted-foreground"> {streakInfo.stage}의 단계에 오르셨네요!<br/>이 정도면 루틴잇의 진정한 짝꿍!</p>
        </div>
        <Button onClick={onClose} className="w-full">계속하기</Button>
      </div>
    </CommonModal>
  );
}