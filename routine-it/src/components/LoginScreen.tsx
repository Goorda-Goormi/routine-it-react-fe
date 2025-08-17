import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="h-full w-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex flex-col justify-center">
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-h-full">
        {/* 앱 로고 및 제목 */}
        <div className="text-center mb-6">
          {/* 로고 */}
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
              <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
                <div className="h-5 w-5 bg-white rounded-full flex items-center justify-center">
                  <div className="h-2.5 w-2.5 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 앱 이름 */}
          <h1 className="text-2xl font-bold text-white mb-2">루틴잇</h1>
          <p className="text-white/90 text-base">간편한 습관 만들기 앱</p>
        </div>

        {/* 기능 소개 카드 */}
        <Card className="w-full mb-6 bg-white/95 backdrop-blur border-0 shadow-xl">
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
                  <span className="text-green-600 text-sm">📊</span>
                </div>
                <span className="text-sm text-gray-700 font-medium">개인 루틴 관리 및 추적</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                  <span className="text-emerald-600 text-sm">👥</span>
                </div>
                <span className="text-sm text-gray-700 font-medium">그룹과 함께하는 습관 만들기</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100">
                  <span className="text-teal-600 text-sm">🏆</span>
                </div>
                <span className="text-sm text-gray-700 font-medium">랭킹과 도전으로 동기 부여</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-100">
                  <span className="text-lime-600 text-sm">⏰</span>
                </div>
                <span className="text-sm text-gray-700 font-medium">실시간 체크인으로 초점 유지</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 로그인 버튼 */}
        <div className="w-full space-y-3">
          <Button 
            onClick={onLogin}
            className="w-full bg-white hover:bg-gray-50 text-green-700 font-semibold py-3 h-11 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl border-0"
            size="lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-yellow-400 rounded-sm flex items-center justify-center">
                <span className="text-gray-900 text-xs font-bold">K</span>
              </div>
              <span>카카오로 시작하기</span>
            </div>
          </Button>
          
          <p className="text-center text-white/80 text-xs leading-relaxed">
            간편 서비스 이용약관 및 개인정보처리방침에 동의합니다.
          </p>
        </div>
      </div>
    </div>
  );
}