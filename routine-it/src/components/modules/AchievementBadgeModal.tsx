import React from 'react';
import { CommonModal } from './CommonModal';
import { Button } from '../ui/button';
import { Trophy, Zap, Heart, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface AchievementBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  badgeName: string;
  badgeImage: string; 
}

const badgeData = {
  '첫걸음': {
    icon: Zap,
    bgColor: 'bg-amber-500/70',
    borderColor: 'border-amber-200/50',
    textColor: 'text-amber-100/80'
  },
  '꾸준함': {
    icon: Heart,
    bgColor: 'bg-green-500/70',
    borderColor: 'border-green-200/50',
    textColor: 'text-green-100/90'
  },
  '루틴 마스터': {
    icon: Shield,
    bgColor: 'bg-blue-500/70',
    borderColor: 'border-blue-200/50',
    textColor: 'text-blue-100/90'
  },
  '월간 챔피언': {
    icon: Trophy,
    bgColor: 'bg-red-400/70',
    borderColor: 'border-red-400/50',
    textColor: 'text-red-100'
  }
};

export function AchievementBadgeModal({ isOpen, onClose, badgeName, badgeImage }: AchievementBadgeModalProps) {
  const badge = badgeData[badgeName as keyof typeof badgeData];
  const IconComponent = badge?.icon || Trophy;

  return (
    <CommonModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* 동그란 배경과 아이콘을 렌더링 */}
          <div className={`
            w-20 h-20 rounded-full flex items-center justify-center
            ${badge?.bgColor || 'bg-yellow-500/20'}
            border-4 ${badge?.borderColor || 'border-yellow-200/50'}
          `}>
            <IconComponent className={`h-12 w-12 ${badge?.textColor || 'text-yellow-500'}`} />
          </div>
        </motion.div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground">
            {badgeName} 배지를 획득했어요!
          </h3>
          <p className="text-sm text-muted-foreground">당신의 노력이 빛을 발하네요!</p>
        </div>
        <Button onClick={onClose} className="w-full">확인</Button>
      </div>
    </CommonModal>
  );
}