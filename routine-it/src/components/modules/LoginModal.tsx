import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import { Input } from '../ui/input'; // Input 컴포넌트 추가
import { Card, CardContent } from '../ui/card';
import { CircleCheckBig, XCircle } from 'lucide-react'; // 아이콘 추가

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (nickname: string) => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [nickname, setNickname] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<boolean | null>(null);

  // 닉네임 중복 확인 함수
  const handleCheckNickname = async () => {
    if (!nickname) return;

    setIsChecking(true);
    setIsNicknameAvailable(null);

    try {
      // 실제 API 호출 로직을 여기에 추가
      // 예시: const response = await fetch(`/api/check-nickname?name=${nickname}`);
      // 예시: const data = await response.json();
      
      // 임시로 1초 후 중복 여부 판정
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isDuplicatedFromServer = ['김구름', '루틴이'].includes(nickname);
      setIsDuplicate(isDuplicatedFromServer);
      setIsNicknameAvailable(!isDuplicatedFromServer);
    } catch (error) {
      console.error('닉네임 중복 확인 중 오류 발생:', error);
      setIsNicknameAvailable(false); // 오류 발생 시 사용 불가로 표시
    } finally {
      setIsChecking(false);
    }
  };

  // 회원가입 완료 함수
  const handleCompleteSignup = () => {
    // 닉네임 유효성 검사
    if (!nickname || isDuplicate || isNicknameAvailable === null || !isNicknameAvailable) {
      alert('닉네임을 확인해주세요.');
      return;
    }

    // 서버에 닉네임 전송 및 회원가입 완료 처리
    // 예시: await fetch('/api/signup', { method: 'POST', body: JSON.stringify({ nickname }) });

    // 로그인 성공 상태로 전환 (신규 회원임을 알리기 위해 true 전달)
    onLoginSuccess(nickname);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none max-w-sm rounded-xl">
        <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex flex-col items-center justify-center p-8 rounded-xl shadow-2xl">
          {/* 제목 및 설명 */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-white mb-2">닉네임 설정</h1>
            <p className="text-sm text-green-100">
              루틴잇에서 사용할 닉네임을 입력해주세요.
            </p>
          </div>

          {/* 닉네임 입력 카드 */}
          <Card className="w-full bg-white/90 backdrop-blur-sm shadow-inner mb-6 border-0">
            <CardContent className="p-6 space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="닉네임 입력"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setIsNicknameAvailable(null); // 입력 시 상태 초기화
                  }}
                  className="w-full pl-3 pr-10"
                />
                {isNicknameAvailable !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isNicknameAvailable ? (
                      <CircleCheckBig className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  {isNicknameAvailable === true && (
                    <span className="text-green-600 font-medium">사용 가능한 닉네임입니다.</span>
                  )}
                  {isNicknameAvailable === false && (
                    <span className="text-red-600 font-medium">이미 사용 중인 닉네임입니다.</span>
                  )}
                </div>
                <Button 
                  onClick={handleCheckNickname}
                  disabled={!nickname || isChecking}
                  variant="outline"
                  size="sm"
                  className="bg-white border-2 !border-green-600 text-green-700 hover:bg-green-200"
                >
                  {isChecking ? '확인 중...' : '중복 확인'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 회원가입 완료 버튼 */}
          <div className="w-full">
            <Button
              onClick={handleCompleteSignup}
              disabled={isChecking || isNicknameAvailable !== true}
              className="w-full bg-white hover:bg-gray-50 text-green-700 font-semibold py-4 h-12 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl border-0"
              size="lg"
            >
              회원가입 완료하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}