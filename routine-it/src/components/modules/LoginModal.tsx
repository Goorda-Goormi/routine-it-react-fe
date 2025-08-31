
import React from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog'; // Dialog 컴포넌트 추가
import { Card, CardContent } from '../ui/card'; // Card 컴포넌트 추가

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  // 로그인 버튼 클릭 시 호출될 함수
  const handleLoginClick = () => {
    // 실제 로그인 로직(예: API 호출)을 여기에 추가
    // 로그인 성공 시 onLoginSuccess 함수를 호출하여 부모 컴포넌트의 상태 변경
    onLoginSuccess();
    onClose(); // 로그인 성공 후 모달 닫기
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none max-w-sm rounded-xl">
        <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex flex-col items-center justify-center p-8 rounded-xl shadow-2xl">
          {/* 앱 로고 및 제목 */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
                <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
                  <div className="h-5 w-5 bg-white rounded-full flex items-center justify-center">
                    <div className="h-2.5 w-2.5 bg-green-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">루틴잇</h1>
            <p className="text-sm text-green-100">건강한 습관, 함께 만들어요!</p>
          </div>

          {/* 특징 카드 */}
          <Card className="w-full bg-white/90 backdrop-blur-sm shadow-inner mb-6 border-0">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100">
                  <span className="text-red-600 text-sm">🔥</span>
                </div>
                <span className="text-sm text-gray-700 font-medium">실시간 스트릭으로 꾸준함 유지</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100">
                  <span className="text-orange-600 text-sm">🗓️</span>
                </div>
                <span className="text-sm text-gray-700 font-medium">자유로운 루틴 생성과 목표 설정</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-100">
                  <span className="text-yellow-600 text-sm">🏆</span>
                </div>
                <span className="text-sm text-gray-700 font-medium">랭킹과 도전으로 동기 부여</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-100">
                  <span className="text-lime-600 text-sm">⏰</span>
                </div>
                <span className="text-sm text-gray-700 font-medium">실시간 체크인으로 초점 유지</span>
              </div>
            </CardContent>
          </Card>

          {/* 로그인 버튼 */}
          <div className="w-full space-y-4">
            <Button
              onClick={handleLoginClick}
              className="w-full bg-white hover:bg-gray-50 text-green-700 font-semibold py-4 h-12 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl border-0"
              size="lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-400 rounded-sm flex items-center justify-center">
                  <span className="text-gray-900 text-xs font-bold">K</span>
                </div>
                <span>카카오로 시작하기</span>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}