import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ArrowLeft, Save, Camera, User } from 'lucide-react';

interface ProfileEditScreenProps {
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  initialUserInfo: {
    nickname: string;
    email?: string;
    profileImageUrl: string;
    profileMessage?: string;
  };
  onSaveProfile: (updatedInfo: any) => void;
  onDeleteAccount: () => void;
}

export function ProfileEditScreen({ 
  onBack, 
  onNavigate, 
  isDarkMode, 
  onToggleDarkMode, 
  initialUserInfo, 
  onSaveProfile,
  onDeleteAccount
}: ProfileEditScreenProps) {
  // initialUserInfo prop을 사용하여 초기 상태 설정
  const [profileData, setProfileData] = useState({
    nickname: initialUserInfo.nickname,
    email: initialUserInfo.email,
    profileMessage: initialUserInfo.profileMessage,
    // 초기 prop에 없는 필드는 예시 데이터로 추가
  });

  // 아바타 URL 상태 추가
  const [avatarUrl, setAvatarUrl] = useState(initialUserInfo.profileImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 컴포넌트 마운트 시 initialUserInfo로 상태 초기화
  useEffect(() => {
    setProfileData({
      nickname: initialUserInfo.nickname,
      email: initialUserInfo.email,
      profileMessage: initialUserInfo.profileMessage,
    });
    setAvatarUrl(initialUserInfo.profileImageUrl);
  }, [initialUserInfo]);

  // 저장 버튼 클릭 핸들러
  const handleSave = async () => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('accessToken'); // 인증 토큰 가져오기
    if (!token) {
      console.error("인증 토큰이 없습니다.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/users/me/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nickname: profileData.nickname,
          profileMessage: profileData.profileMessage,
          // 기타 수정 가능한 필드
        }),
      });

      if (!response.ok) {
        throw new Error('프로필 업데이트 실패');
      }

      const updatedUser = await response.json();
      onSaveProfile(updatedUser); // 상위 컴포넌트로 업데이트된 정보 전달
      onBack(); // 이전 화면으로 돌아가기
      alert('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error("프로필 업데이트 에러:", error);
      alert('프로필 업데이트에 실패했습니다.');
    }
  };

  // 아바타 변경 버튼 클릭 시 파일 탐색기 열기
  const handleAvatarChangeClick = () => {
    // useRef로 참조한 input 요소의 click() 메서드 호출
    fileInputRef.current?.click();
  };

  // 파일 선택 시 실행될 핸들러
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 선택된 파일의 임시 URL 생성
      const newAvatarUrl = URL.createObjectURL(file);
      setAvatarUrl(newAvatarUrl);
      console.log('새 프로필 사진:', newAvatarUrl);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-1">
              <ArrowLeft className="h-5 w-5 text-icon-secondary dark:text-white" />
            </Button>
            <h1 className="font-bold">프로필 편집</h1>
          </div>
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 프로필 사진 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  {/* avatarUrl 상태 사용 */}
                  <AvatarImage src={avatarUrl} alt="프로필" />
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  onClick={handleAvatarChangeClick}
                  className="absolute -bottom-1 -right-1 rounded-full h-8 w-8 p-0"
                  size="sm"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" onClick={handleAvatarChangeClick}>
                사진 변경
              </Button>
              {/* 숨겨진 파일 입력 필드 */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange} // 파일 변경 핸들러 추가
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 기본 정보 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">

            <div>
              <Label htmlFor="nickname" className='ml-3.5'>닉네임</Label>
              <Input
                id="nickname"
                value={profileData.nickname}
                onChange={(e) => setProfileData({...profileData, nickname: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="email" className='ml-3.5'>이메일</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                이메일은 변경할 수 없습니다
              </p>
            </div>
            
          </CardContent>
        </Card>

        {/* 자기소개 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">자기소개</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div>
              <Label htmlFor="profileMessage" className='ml-3.5'>소개글</Label>
              <textarea
                id="profileMessage"
                value={profileData.profileMessage ?? ''}
                onChange={(e) => setProfileData({...profileData, profileMessage: e.target.value})}
                placeholder="자신을 소개해주세요"
                className="w-full min-h-[80px] p-3 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {(profileData.profileMessage ?? '').length}/100자
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 계정 설정 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">계정 설정</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <Button variant="outline" className="w-full justify-start">
              계정 연동 관리
            </Button>
            <Button variant="outline" className="w-full justify-start text-destructive" onClick={onDeleteAccount}>
              계정 삭제
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}