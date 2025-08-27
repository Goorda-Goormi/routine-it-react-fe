import React from 'react';
import { CommonModal } from './CommonModal';
import { Button } from '../ui/button';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceModal({ isOpen, onClose }: AttendanceModalProps) {
  const today = new Date();
  const formattedDate = `${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <CommonModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <CheckCircle className="h-18 w-18 text-emerald-600" />
        </motion.div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground">{formattedDate} 출석 완료!</h3>
          <p className="text-sm text-muted-foreground">오늘도 루틴잇과 함께 해요!</p>
        </div>
        <Button onClick={onClose} className="w-full">확인</Button>
      </div>
    </CommonModal>
  );
}