import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ArrowLeft, Save, Camera, User } from 'lucide-react';

interface ProfileEditScreenProps {
  onBack: () => void;
}

export function ProfileEditScreen({ onBack }: ProfileEditScreenProps) {
  const [profileData, setProfileData] = useState({
    name: '김루틴',
    email: 'routine@example.com',
    bio: '꾸준함이 최고의 재능이라고 믿습니다.',
    phone: '010-1234-5678'
  });

  const handleSave = () => {
    // 프로필 저장 로직
    console.log('프로필 저장:', profileData);
    onBack();
  };

  const handleAvatarChange = () => {
    // 프로필 사진 변경 로직
    console.log('프로필 사진 변경');
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
                  <AvatarImage src="/placeholder-avatar.jpg" alt="프로필" />
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  onClick={handleAvatarChange}
                  className="absolute -bottom-1 -right-1 rounded-full h-8 w-8 p-0"
                  size="sm"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" onClick={handleAvatarChange}>
                사진 변경
              </Button>
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
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="email">이메일</Label>
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
            
            <div>
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              />
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
              <Label htmlFor="bio">소개글</Label>
              <textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                placeholder="자신을 소개해주세요"
                className="w-full min-h-[80px] p-3 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {profileData.bio.length}/100자
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
              비밀번호 변경
            </Button>
            <Button variant="outline" className="w-full justify-start">
              계정 연동 관리
            </Button>
            <Button variant="outline" className="w-full justify-start text-destructive">
              계정 삭제
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}