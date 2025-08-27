import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CommonModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function CommonModal({ isOpen, onClose, children }: CommonModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} // 배경 클릭 시 모달 닫힘
      >
        <motion.div
          className="relative bg-background p-6 rounded-2xl shadow-lg w-full max-w-sm"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 400 }}
          onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않음
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}