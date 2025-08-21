import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Calendar, Target, Trophy, Users, Camera, CheckCircle, Plus, TrendingUp, Clock, Heart, MessageCircle, Flame } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getStreakInfo, getStreakMessage } from './utils/streakUtils';

interface HomeScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const today = new Date();
  const todayString = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

  // 연속 출석일 (예시 데이터)
  const currentStreak = 365;
  const streakInfo = getStreakInfo(currentStreak);

  // 개인 루틴 데이터 (상태 관리)
  const [personalRoutines, setPersonalRoutines] = useState([
    {
      id: 1,
      name: '아침 운동',
      completed: true,
      time: '07:00',
      streak: 5
    },
    {
      id: 2,
      name: '물 2L 마시기',
      completed: false,
      time: '언제든',
      streak: 12
    },
    {
      id: 3,
      name: '독서 30분',
      completed: true,
      time: '21:00',
      streak: 8
    }
  ]);

  // 참여 그룹 데이터
  const participatingGroups = [
    {
      id: 1,
      name: '아침 운동 챌린지',
      members: 12,
      recentMembers: [
        { id: 1, name: '김민수', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
        { id: 2, name: '이지영', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b95fcebf?w=40&h=40&fit=crop&crop=face' },
        { id: 3, name: '박철수', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' }
      ]
    },
    {
      id: 2,
      name: '독서 모임',
      members: 8,
      recentMembers: [
        { id: 4, name: '정수현', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
        { id: 5, name: '최영호', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face' }
      ]
    }
  ];

  // 본인 인증 사진 그리드 데이터 (공개여부 추가)
  const myVerificationPhotos = [
    { 
      id: 1, 
      routine: '아침 운동', 
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop', 
      date: '오늘',
      isPublic: true
    },
    { 
      id: 2, 
      routine: '독서 30분', 
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=150&h=150&fit=crop', 
      date: '어제',
      isPublic: true
    },
    { 
      id: 3, 
      routine: '물 2L 마시기', 
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=150&h=150&fit=crop', 
      date: '11월 13일',
      isPublic: false
    },
    { 
      id: 4, 
      routine: '명상 10분', 
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop', 
      date: '11월 12일',
      isPublic: true
    },
    { 
      id: 5, 
      routine: '일기 쓰기', 
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=150&h=150&fit=crop', 
      date: '11월 11일',
      isPublic: false
    },
    { 
      id: 6, 
      routine: '스트레칭', 
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=150&h=150&fit=crop', 
      date: '11월 10일',
      isPublic: true
    }
  ];

  // 공개된 인증사진만 필터링
  const publicVerificationPhotos = myVerificationPhotos.filter(photo => photo.isPublic);

  const completedRoutines = personalRoutines.filter(routine => routine.completed).length;
  const totalRoutines = personalRoutines.length;
  const completionRate = Math.round((completedRoutines / totalRoutines) * 100);

  const handleRoutineClick = (routine: any) => {
    onNavigate('routine-detail', routine);
  };

  const handleGroupClick = (group: any) => {
    onNavigate('group-detail', group);
  };

  const handleMemberClick = (member: any) => {
    onNavigate('user-home', member);
  };

  // 루틴 완료 상태 토글
  const toggleRoutineCompletion = (routineId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 본문 클릭 이벤트 방지
    setPersonalRoutines(prev => 
      prev.map(routine => 
        routine.id === routineId 
          ? { ...routine, completed: !routine.completed }
          : routine
      )
    );
  };

  return (
    <div className="space-y-6 h-full p-4 ">
      {/* 오늘 날짜 및 완료 현황 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start m-2">
            <h2 className="text-xl font-semibold text-foreground">안녕하세요, 김민수님!</h2>
            <p className="text-sm text-foreground">
              {todayString} • 오늘도 화이팅!
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate('create-routine')}
            className="text-foreground border-border/60 hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-4 w-4 mr-1 icon-secondary bg" />
            루틴 추가
          </Button>
        </div>

        {/* 완료 현황 및 연속 출석 카드 - 다크모드에서 찐한 배경색 */}
          <div className="grid grid-cols-3 gap-3">
            {/* 완료일수 */}
            <Card className="bg-card-yellow-bg border border-card-yellow-border dark:border-none dark:card-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 dark:bg-orange-700">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-card-yellow-text">
                      {completedRoutines}
                    </div>
                    <div className="text-xs font-normal text-card-yellow-text/80">완료</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 누적점수 */}
            <Card className="bg-card-lavender-bg border border-card-lavender-border dark:border-none dark:card-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 dark:bg-purple-800">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-card-lavender-text">2,450</div>
                    <div className="text-xs font-normal text-card-lavender-text/80">누적점수</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 연속 출석 */}
            <Card className={`${streakInfo.containBgColor} border ${streakInfo.borderColor} dark:border-none dark:card-shadow`}>
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${streakInfo.bgColor}`}>
                    <div className="text-xl mb-0 bg">{streakInfo.icon}</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl font-bold ${streakInfo.textColor}`}>
                      {currentStreak}
                    </div>
                    <div className={`text-xs ${streakInfo.subTextColor}`}>
                      {streakInfo.stage}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 연속 출석 메시지 */}
          <div className={`${streakInfo.containBgColor} border ${streakInfo.borderColor} rounded-lg dark:border-none dark:card-shadow`}>
            <div className="flex items-center space-x-2 ml-3">
              <span className="text-lg">{streakInfo.icon}</span>
              <span className={`text-sm ${streakInfo.textColor}`}>
                {getStreakMessage(currentStreak)}
              </span>
            </div>
          </div>

      </div>

      {/* 오늘의 루틴 */}
      <Card className="dark:card-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-foreground flex items-center space-x-2">
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
            {personalRoutines.map((routine, index) => (
              <div key={routine.id}>
                <div 
                  className={`flex items-center justify-between rounded-lg p-3 transition-colors ${
                    routine.completed 
                      ? 'bg-green-50/50 dark:bg-green-900/20' 
                      : 'hover:bg-accent/50'
                  } ${index < personalRoutines.length - 1 ? 'mb-1' : ''}`}
                >
                  <div className="flex items-center space-x-3 flex-1 cursor-pointer " onClick={() => handleRoutineClick(routine)}>
                    <div className="flex items-center space-x-3">
                      <div className='flex flex-col items-start ml-2'>
                        <div className={`text-sm font-medium ${
                          routine.completed 
                            ? 'text-green-700 dark:text-green-400 line-through' 
                            : 'text-foreground'
                        }`}>
                          {routine.name}
                        </div>
                        <div className="text-xs text-foreground dark:opacity-75">
                          {routine.time} • {routine.streak}일 연속
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* 완료 체크박스 */}
                    <button
                      onClick={(e) => toggleRoutineCompletion(routine.id, e)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        routine.completed 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'border-2 border-border/60 hover:border-green-500'
                      }`}
                    >
                      {routine.completed && <CheckCircle className="h-w w-4 text-white" />}
                    </button>
                    
                    {!routine.completed && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-foreground border-border/60 hover:bg-accent hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          // 인증 로직
                        }}
                      >
                        <Camera className="h-4 w-4 mr-1 icon-secondary" />
                        인증
                      </Button>
                    )}
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
          <CardTitle className="text-base text-foreground flex items-center space-x-2">
            <Users className="h-4 w-4 icon-accent" />
            <span>참여 중인 그룹</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-0">
            {participatingGroups.map((group, index) => (
              <div key={group.id}>
                <div 
                  className={`flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                    index < participatingGroups.length - 1 ? 'border-b border-border/60' : ''
                  }`}
                  onClick={() => handleGroupClick(group)}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex -space-x-2 w-20">
                      {group.recentMembers.slice(0, 3).map((member, memberIndex) => (
                        <Avatar 
                          key={member.id} 
                          className="w-8 h-8 border-2 border-background cursor-pointer hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMemberClick(member);
                          }}
                        >
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <div className='flex flex-col items-start ml-2'>
                      <div className="text-sm font-medium text-foreground">{group.name}</div>
                      <div className="text-xs text-foreground dark:opacity-75">{group.members}명 참여</div>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-foreground hover:text-foreground"
                  >
                    보기
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 나의 인증 사진 그리드 (공개된 것만) */}
      <Card className="dark:card-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-foreground flex items-center space-x-2">
            <Camera className="h-4 w-4 icon-accent" />
            <span>나의 인증 사진</span>
            <Badge variant="secondary" className="text-xs">공개된 사진만</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3">
            {publicVerificationPhotos.map((photo) => (
              <div key={photo.id} className="space-y-2">
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
                  <span className="text-xs text-foreground dark:opacity-75">{photo.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}