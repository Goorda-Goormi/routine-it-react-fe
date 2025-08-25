import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Calendar, Target, Trophy, Users, Camera, CheckCircle, Plus, TrendingUp, Clock, Heart, MessageCircle, Flame, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getStreakInfo, getStreakMessage } from './utils/streakUtils';

const getTodayDayOfWeek = () => {
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date();
  return dayOfWeek[today.getDay()];
};

interface Routine {
  id: number;
  name: string;
  category?: string;
  time: string;
  completed: boolean;
  streak: number;
  difficulty?: string;
  isGroupRoutine?: boolean;
  frequency?: string[];
}

interface UserInfo {
  name: string;
  username: string;
  profileImage: string;
  bio: string;
}


interface HomeScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  initialUserInfo: UserInfo;
  personalRoutines: Routine[]; // <--- 이 부분을 추가
  onToggleCompletion: (routineId: number, isGroupRoutine?: boolean) => void; // <--- 이 부분을 추가
}

interface Member {
  id: number;
  name: string;
  avatar: string;
}

interface Group {
  id: number;
  name: string;
  members: number;
  recentMembers: Member[];
}

interface VerificationPhoto {
  id: number;
  routine: string;
  image: string;
  date: string;
  isPublic: boolean;
}

export function HomeScreen({ onNavigate, initialUserInfo, personalRoutines, onToggleCompletion }: HomeScreenProps) {
  const today = new Date();
  const todayString = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

  // 연속 출석일 (예시 데이터)
  const currentStreak = 365;
  const streakInfo = getStreakInfo(currentStreak);

  // 오늘의 루틴
  const todayDay = getTodayDayOfWeek();
  const todayRoutines = (personalRoutines || []).filter(routine => {
    return routine.frequency && routine.frequency.includes(todayDay);
  });

  const completedRoutines = todayRoutines.filter(routine => routine.completed).length;
  const totalRoutines = todayRoutines.length;
  const completionRate = totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0;

  // 참여 그룹 데이터
  const participatingGroups: Group[] = [
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
  const myVerificationPhotos: VerificationPhoto[] = [
    {
      id: 1,
      routine: '아침 운동',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?fit=crop',
      date: '오늘',
      isPublic: true
    },
    {
      id: 2,
      routine: '독서 30분',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?fit=crop',
      date: '어제',
      isPublic: true
    },
    {
      id: 3,
      routine: '물 2L 마시기',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?fit=crop',
      date: '11월 13일',
      isPublic: false
    },
    {
      id: 4,
      routine: '명상 10분',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?fit=crop',
      date: '11월 12일',
      isPublic: true
    },
    {
      id: 5,
      routine: '일기 쓰기',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?fit=crop',
      date: '11월 11일',
      isPublic: false
    },
    {
      id: 6,
      routine: '스트레칭',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?fit=crop',
      date: '11월 10일',
      isPublic: true
    }
  ];

  // 공개된 인증사진만 필터링
  const publicVerificationPhotos = myVerificationPhotos.filter(photo => photo.isPublic);

  // 갤러리 상태 관리
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const handleRoutineClick = (routine: Routine) => {
    onNavigate('routine-detail', routine);
  };

  const handleGroupClick = (group: Group) => {
    onNavigate('group-detail', group);
  };

  const handleMemberClick = (member: Member) => {
    onNavigate('user-home', member);
  };

  // 사진 클릭 핸들러
  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  // 갤러리 닫기 핸들러
  const handleCloseGallery = () => {
    setSelectedPhotoIndex(null);
  };

  // 갤러리 이전/다음 사진 보기 핸들러
  const handlePrevPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < publicVerificationPhotos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  // 루틴 완료 상태 토글
  const toggleRoutineCompletion = (routineId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCompletion(routineId);
  };

  return (
    <div className="space-y-6 h-full p-4 ">
      {/* 오늘 날짜 및 완료 현황 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start m-2">
            <h2 className="text-xl font-semibold text-foreground">안녕하세요, {initialUserInfo.name}님!</h2>
            <p className="text-sm text-foreground">
              {todayString} • {initialUserInfo.bio}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('create-routine')}
            className="text-foreground border-2 border-border/60 hover:bg-accent hover:text-foreground"
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
            {todayRoutines.length > 0 ? (
              todayRoutines.map((routine, index) => (
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

                    <div className="flex items-center space-x-2 h-[30px]">
                      {/* 완료 체크박스 */}
                      {/* 개인 루틴과 그룹 루틴에 따라 다른 로직 적용 */}
                      {routine.isGroupRoutine ? (
                        // 그룹 루틴
                        routine.completed ? (
                          // 완료된 그룹 루틴: div로 표시 (클릭 불가능)
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors p-0 m-0 bg-green-500`}
                          >
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                        ) : (
                          // 미완료 그룹 루틴: 인증 버튼
                          <button
                            onClick={(e) => toggleRoutineCompletion(routine.id, e)}
                            className={`w-auto h-8 rounded-full flex items-center justify-center transition-colors px-3 py-1 text-xs text-foreground border-2 border-border/60 hover:bg-accent`}
                          >
                            <span className='flex items-center'>
                              <Camera className="h-4 w-4 mr-1 text-foreground/70" />
                              인증
                            </span>
                          </button>
                        )
                      ) : (
                        // 개인 루틴
                        <button
                          onClick={(e) => toggleRoutineCompletion(routine.id, e)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors  ${
                            routine.completed
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'border-2 border-border/60 hover:border-green-500'
                          } !p-0 m-0 border-0`}
                        >
                          {routine.completed && <CheckCircle className="h-5 w-5 text-white" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-center text-muted-foreground p-4">오늘은 루틴이 없어요!</p>
          )}
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
            {publicVerificationPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="space-y-2 cursor-pointer"
                onClick={() => handlePhotoClick(index)} // 클릭 이벤트 추가
              >
                <div className="relative rounded-lg overflow-hidden aspect-square">
                  <ImageWithFallback
                    src={photo.image}
                    alt={photo.routine}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-2 w-full">
                      <div className="text-white text-xs font-medium truncate">
                        {photo.routine}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-xs text-foreground dark:opacity-75">{photo.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 갤러리 모달 (조건부 렌더링) */}
      {selectedPhotoIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative h-full w-full max-w-lg flex flex-col items-center justify-center">
            {/* 닫기 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-black/50 hover:text-white hover:border-none rounded-full"
              onClick={handleCloseGallery}
            >
              <X className="h-6 w-6" />
            </Button>
            {/* 사진 */}
            <div className="flex-1 w-full flex items-center justify-center p-4">
              <ImageWithFallback
                src={publicVerificationPhotos[selectedPhotoIndex].image}
                alt={publicVerificationPhotos[selectedPhotoIndex].routine}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            {/* 사진 정보 */}
            <div className="absolute bottom-16 w-full text-center text-white text-lg font-semibold">
              {publicVerificationPhotos[selectedPhotoIndex].routine}
            </div>
            {/* 탐색 버튼 */}
            <div className="absolute inset-y-0 flex items-center justify-between w-full px-6">
              <Button
                variant="ghost"
                size="icon"
                className="text-white opacity-80 rounded-full hover:bg-black/50  hover:text-white hover:border-none"
                onClick={handlePrevPhoto}
                disabled={selectedPhotoIndex === 0}
              >
                <ChevronLeft className="h-10 w-10" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white opacity-80 rounded-full hover:bg-black/50  hover:text-white hover:border-none"
                onClick={handleNextPhoto}
                disabled={selectedPhotoIndex === publicVerificationPhotos.length - 1}
              >
                <ChevronRight className="h-10 w-10" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}