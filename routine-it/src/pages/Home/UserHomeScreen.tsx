import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ArrowLeft, ChevronLeft, ChevronRight, X, Camera, Flame, TrendingUp, Calendar, Trophy, Users, CheckCircle, Target, Clock, Lock } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { getStreakInfo, getStreakMessage } from '../../components/utils/streakUtils';
import type {Routine, User} from '../../interfaces';



interface UserHomeScreenProps {
  user: any;
  onBack: () => void;
}

export function UserHomeScreen({ user, onBack }: UserHomeScreenProps) {
  const today = new Date();
  const todayString = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const openGallery = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeGallery = () => {
    setSelectedPhotoIndex(null);
  };

  const showNextPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % allVerificationPhotos.length);
    }
  };

  const showPrevPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + allVerificationPhotos.length) % allVerificationPhotos.length);
    }
  };

  // 다른 유저의 정보 (공개 정보)
  const [userProfile] = useState<User>({
    id: user.id,
    name: user?.name || '이지영',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b95fcebf?w=80&h=80&fit=crop&crop=face',
    level: 12,
    streakDays: 15,
    totalPoints: 1850,
    joinDate: '2024년 3월',
    bio: '오늘도 으쌰으쌰!'
  });

  // 연속 출석일 정보
  const streakInfo = getStreakInfo(userProfile.streakDays);

  // 상대방의 오늘 루틴 (공개)
  const userRoutines: Routine[] = [
    {
      id: 1,
      name: '아침 요가',
      completed: true,
      time: '07:00',
      streak: 8,
      category: '운동'
    },
    {
      id: 2,
      name: '책 읽기',
      completed: true,
      time: '21:00',
      streak: 15,
      category: '학습'
    },
    {
      id: 3,
      name: '물 마시기',
      completed: false,
      time: '언제든',
      streak: 22,
      category: '건강'
    }
  ];

  // 상대방이 참여 중인 그룹
  const userGroups = [
    {
      id: 1,
      name: '아침 운동 챌린지',
      members: 12,
      recentMembers: [
        { id: 1, name: '김민수', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
        { id: 2, name: '이지영', avatar: userProfile.avatar },
        { id: 3, name: '박철수', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' }
      ]
    },
    {
      id: 2,
      name: '독서 모임',
      members: 8,
      recentMembers: [
        { id: 4, name: '정수현', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
        { id: 5, name: '이지영', avatar: userProfile.avatar }
      ]
    }
  ];

  // 인증 사진 데이터 (공개여부에 따라 필터링)
  const allVerificationPhotos = [
    { 
      id: 1, 
      routine: '아침 요가', 
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', 
      date: '오늘',
      isPublic: true
    },
    { 
      id: 2, 
      routine: '책 읽기', 
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773', 
      date: '어제',
      isPublic: true
    },
    { 
      id: 3, 
      routine: '물 마시기', 
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', 
      date: '11월 13일',
      isPublic: false // 비공개
    },
    { 
      id: 4, 
      routine: '명상', 
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', 
      date: '11월 12일',
      isPublic: true
    },
    { 
      id: 5, 
      routine: '일기 쓰기', 
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a', 
      date: '11월 11일',
      isPublic: false // 비공개
    },
    { 
      id: 6, 
      routine: '산책', 
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a', 
      date: '11월 10일',
      isPublic: true
    }
  ];

  // 공개된 인증사진만 필터링
  const publicVerificationPhotos = allVerificationPhotos.filter(photo => photo.isPublic);
  const totalPhotos = allVerificationPhotos.length;
  const publicPhotosCount = publicVerificationPhotos.length;

  const completedRoutines = userRoutines.filter(routine => routine.completed).length;
  const totalRoutines = userRoutines.length;
  const completionRate = Math.round((completedRoutines / totalRoutines) * 100);

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case '운동': return '💪';
      case '건강': return '🏥';
      case '학습': return '📚';
      case '생활': return '🏠';
      default: return '📋';
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* 헤더 */}
      <div className="flex items-center space-x-3 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-primary hover:text-primary p-1"
        >
          <ArrowLeft className="h-5 w-5 icon-secondary" />
        </Button>
        <div>
          <h1 className="text-lg text-left font-medium text-primary">
            {userProfile.name}님의 홈
          </h1>
          <p className="text-sm text-muted-foreground">
            {todayString} • 공개된 정보만 표시됩니다
          </p>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-auto space-y-6 mx-1">
        {/* 사용자 정보 및 현황 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
              <AvatarFallback className="text-lg">{userProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 ml-1">
              <div className="flex items-center justify-between w-90">
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-xl font-bold text-muted-foreground">{userProfile.name}</h2>
                  <Badge variant="secondary" className="text-xs">Lv.{userProfile.level}</Badge>
                </div>
                <p className="text-sm font-semibold text-muted-foreground mt-0.5">{userProfile.joinDate}에 가입</p>
              </div>
              <div className="text-sm text-left text-muted-foreground font-semibold">
                "{userProfile.bio}"
              </div>
            </div>
          </div>

          {/* 완료 현황 및 연속 출석 카드 */}
          <div className="grid grid-cols-3 gap-3">
            {/* 완료일수 - 노란색 계열 */}
            <Card className="card-yellow dark:card-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{completedRoutines}</div>
                    <div className="text-xs">완료</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 누적점수 - 아이보리 계열 */}
            <Card className="card-ivory dark:card-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{userProfile.totalPoints.toLocaleString()}</div>
                    <div className="text-xs">누적점수</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 동적 연속 출석 */}
            <Card className={`${streakInfo.bgColor} ${streakInfo.borderColor} dark:card-shadow`}>
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-2xl">
                    {streakInfo.icon}
                  </div>
                  <div className="text-center">
                    <div className={`text-xl font-bold ${streakInfo.textColor}`}>{userProfile.streakDays}</div>
                    <div className={`text-xs ${streakInfo.subTextColor}`}>{streakInfo.stage}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 연속 출석 메시지 */}
          <div className={`p-3 rounded-lg ${streakInfo.bgColor} ${streakInfo.borderColor} border dark:card-shadow`}>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{streakInfo.icon}</span>
              <span className={`text-sm ${streakInfo.textColor}`}>
                {getStreakMessage(userProfile.streakDays)}
              </span>
            </div>
          </div>
        </div>

        {/* 오늘의 루틴 */}
        <Card className="dark:card-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-primary flex items-center space-x-2">
                <Target className="h-4 w-4 icon-accent" />
                <span>오늘의 루틴</span>
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {completedRoutines}/{totalRoutines} 완료
              </Badge>
            </div>
            <Progress value={completionRate} className="h-2" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0">
              {userRoutines.map((routine, index) => (
                <div key={routine.id}>
                  <div className={`flex items-center justify-between p-3 transition-colors ${
                    routine.completed 
                      ? 'bg-green-50/50 dark:bg-green-900/20' 
                      : 'bg-accent/20'
                  } ${index < userRoutines.length - 1 ? 'border-b border-border/30' : ''}`}>
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        routine.completed 
                          ? 'bg-green-500'
                          : 'border-2 border-muted-foreground'
                      }`}>
                        {routine.completed && <CheckCircle className="h-4 w-4 text-white" />}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${
                          routine.completed 
                            ? 'text-green-700 dark:text-green-400 line-through' 
                            : 'text-foreground'
                        }`}>
                          {getCategoryEmoji(routine.category)} {routine.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {routine.time} • {routine.streak}일 연속
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 참여 그룹 */}
        <Card className="dark:card-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-primary flex items-center space-x-2">
              <Users className="h-4 w-4 icon-accent" />
              <span>참여 중인 그룹</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0">
              {userGroups.map((group, index) => (
                <div key={group.id}>
                  <div className={`flex items-center justify-between p-3 hover:bg-accent/50 transition-colors ${
                    index < userGroups.length - 1 ? 'border-b border-border/30' : ''
                  }`}>
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex -space-x-2 w-20">
                        {group.recentMembers.slice(0, 3).map((member, memberIndex) => (
                          <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{group.name}</div>
                        <div className="text-xs text-left text-muted-foreground">{group.members}명 참여</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 인증 사진 (공개된 것만) */}
        <Card className="dark:card-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-primary flex items-center space-x-2">
                <Camera className="h-4 w-4 icon-accent" />
                <span>인증 사진</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  공개 {publicPhotosCount}/{totalPhotos}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {publicVerificationPhotos.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {publicVerificationPhotos.map((photo, index) => (
                  <div key={photo.id} className="space-y-2 cursor-pointer" onClick={() => openGallery(index)}>
                    {/* 인증 이미지 */}
                    <div className="relative rounded-lg overflow-hidden aspect-square">
                      <ImageWithFallback
                        src={photo.image}
                        alt={photo.routine}
                        className="w-full h-full object-cover"
                      />
                      {/* 오버레이 정보 */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-end">
                        <div className="p-2 w-full">
                          <div className="text-white text-xs font-medium truncate">
                            {photo.routine}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 날짜 정보 */}
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">{photo.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">공개된 인증 사진이 없습니다</p>
                <p className="text-xs text-muted-foreground">
                  사용자가 인증 사진을 비공개로 설정했습니다
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    {/* 갤러리 모달 */}
      {selectedPhotoIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative h-full w-full max-w-lg flex flex-col items-center justify-center">
            {/* 닫기 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-black/50 hover:text-white hover:border-none rounded-full"
              onClick={closeGallery}
            >
              <X className="h-6 w-6" />
            </Button>
            {/* 사진 */}
            <div className="flex-1 w-full flex items-center justify-center p-4">
              <img 
                src={publicVerificationPhotos[selectedPhotoIndex].image} 
                alt={publicVerificationPhotos[selectedPhotoIndex].routine} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            {/* 사진 설명 */}
            <div className="absolute bottom-16 w-full text-center text-white text-lg font-semibold">
              {publicVerificationPhotos[selectedPhotoIndex].routine}
            </div>
            <div className="absolute inset-y-0 flex items-center justify-between w-full px-6">
              {/* 이전 사진 버튼 */}
              <Button 
                variant="ghost"
                size="icon"
                className="text-white opacity-80 rounded-full hover:bg-black/50  hover:text-white hover:border-none"
                onClick={showPrevPhoto} 
                disabled={selectedPhotoIndex === 0}
              >
                <ChevronLeft className="h-10 w-10" />
              </Button>
              
              {/* 다음 사진 버튼 */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white opacity-80 rounded-full hover:bg-black/50  hover:text-white hover:border-none"
                onClick={showNextPhoto} 
                disabled={selectedPhotoIndex === publicVerificationPhotos.length - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}