import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Target, Users, Camera, CheckCircle, Plus, TrendingUp, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { getStreakInfo, getStreakMessage } from '../../components/utils/streakUtils';
import type { Routine, Group, Member, GroupMemberResponse } from '../../interfaces';
import { getUserAuthPhotos } from '../../api/activity';

const getTodayDayOfWeek = () => {
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date();
  return dayOfWeek[today.getDay()];
};

interface UserInfo {
  id: number;
  nickname: string;
  profileImageUrl: string;
  profileMessage?: string;
  exp: number;
}

interface HomeScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  userInfo: UserInfo;
  routines: Routine[];
  onTogglePersonalRoutine: (routineId: number) => void;
  streakDays: number;
  participatingGroups: Group[];
  //pendingAuthMessages: PendingAuthMap;
  onOpenAttendanceModal: () => void;
  onOpenStreakModal: (streakDays: number) => void;
  onOpenBadgeModal: (badgeName: string, badgeImage: string) => void;
  userTotalScore: number | null;
}

interface VerificationPhoto {
  id: number;
  routine: string;
  imageUrl: string; 
  activityDate: string;
  isPublic: boolean;
}

export function HomeScreen({
  onNavigate,
  userInfo,
  routines,
  onTogglePersonalRoutine,
  streakDays,
  participatingGroups,
  onOpenAttendanceModal,
  onOpenStreakModal,
  onOpenBadgeModal,
  userTotalScore
  
}: HomeScreenProps) {
  const today = new Date();
  const todayString = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  
  const streakInfo = getStreakInfo(streakDays);

  const todayDay = getTodayDayOfWeek();

  const allTodayRoutines = (routines || []).filter((routine: Routine) => {
    return routine.frequency && routine.frequency.includes(todayDay);
  })
  .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

  const [myVerificationPhotos, setMyVerificationPhotos] = useState<VerificationPhoto[]>([]);

  useEffect(() => {
    const fetchMyPhotos = async () => {
      try {
        // userId 없이 호출하여 내 사진을 가져옵니다.
        const photosData = await getUserAuthPhotos();
        // API 응답 구조에 맞게 activityInfos에서 데이터를 추출합니다.
        setMyVerificationPhotos(photosData || []);
      } catch (error) {
        console.error("내 인증 사진 로딩 실패:", error);
      }
    };

    fetchMyPhotos();
  }, []);

  const publicVerificationPhotos = myVerificationPhotos.filter(photo => photo.isPublic);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const handleRoutineClick = (routine: Routine) => {
    onNavigate('routine-detail', routine);
  };

  const handleGroupClick = (group: Group) => {
    onNavigate('group-detail', group);
  };

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const handleCloseGallery = () => {
    setSelectedPhotoIndex(null);
  };

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

  const completedRoutines = allTodayRoutines.filter(routine => routine.completed).length;

  const totalRoutines = allTodayRoutines.length;
  const completionRate = totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0;

  return (
    <div className="space-y-6 h-full p-4 ">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start m-2">
            <h2 className="text-xl bg-font-semibold text-foreground">안녕하세요, {userInfo.nickname}님!</h2>
            <p className="text-sm text-foreground">
              {todayString} • {userInfo.profileMessage}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('create-routine')}
            className="text-foreground border-1 border-border/60 hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-4 w-4 mr-1 icon-secondary bg" />
            루틴 추가
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card-yellow-bg border border-card-yellow-border dark:border-none dark:card-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 dark:bg-orange-500">
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

          <Card className="bg-card-lavender-bg border border-card-lavender-border dark:border-none dark:card-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-400">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-card-lavender-text">{(userTotalScore ?? 0).toLocaleString()}</div>
                  <div className="text-xs font-normal text-card-lavender-text/80">누적점수</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${streakInfo.containBgColor} border ${streakInfo.borderColor} dark:border-none dark:card-shadow`}>
            <CardContent className="p-4">
              <div className="flex flex-col items-center space-y-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${streakInfo.bgColor}`}>
                  <div className="text-xl mb-0 bg">{streakInfo.icon}</div>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold ${streakInfo.textColor}`}>
                    {streakDays}
                  </div>
                  <div className={`text-xs ${streakInfo.subTextColor}`}>
                    {streakInfo.stage}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className={`${streakInfo.containBgColor} border ${streakInfo.borderColor} rounded-lg dark:border-none dark:card-shadow`}>
          <div className="flex items-center space-x-2 ml-3">
            <span className="text-lg">{streakInfo.icon}</span>
            <span className={`text-sm ${streakInfo.textColor}`}>
              {getStreakMessage(streakDays)}
            </span>
          </div>
        </div>
      </div>

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
            {allTodayRoutines.length > 0 ? (
              allTodayRoutines.map((routine: Routine, index: number) => {
                // const currentState = routineStates[routine.id] || 'initial';
                // const isPending = currentState === 'pending';
                // const isCompleted = currentState === 'completed';

                return (
                  <div key={routine.isGroupRoutine ? `group-${routine.id}` : `personal-${routine.id}`}>
                    <div
                      className={`flex items-center justify-between rounded-lg p-3 transition-colors ${
                        routine.completed ? 'bg-green-50/50 dark:bg-green-900/20' : 'hover:bg-accent/50'
                      } ${index < routines.length - 1 ? 'mb-1' : ''}`}
                    >
                      <div className="flex items-center space-x-3 flex-1 cursor-pointer " onClick={() => handleRoutineClick(routine)}>
                        <div className="flex items-center space-x-3">
                          <div className='flex flex-col items-start ml-2'>
                            <div className={`text-sm font-medium ${routine.completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-foreground'}`}>
                              {routine.name}
                            </div>
                            <div className="text-xs text-foreground dark:opacity-75">
                              {routine.time} • {routine.streak}일 연속
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 h-[30px]">
                        {routine.isGroupRoutine ? (
                          routine.completed ? (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors p-0 m-0 bg-green-500">
                              <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const group = participatingGroups.find(g => g.groupId === routine.id);
                                if (group) {
                                  // 그룹 채팅 화면으로 이동시킵니다.
                                  onNavigate('group-chat', group);
                                }
                              }}
                              className="w-auto h-8 rounded-full flex items-center justify-center transition-colors px-3 py-1 text-xs text-foreground border-2 border-border/60 hover:bg-accent"
                            >
                              <span className="flex items-center">
                                {routine.type === '의무참여' && <Camera className="h-4 w-4 mr-1 text-foreground/70" />}
                                인증
                              </span>
                            </button>
                          )
                        ) : (
                          <button
                            onClick={(e) => {
                              onTogglePersonalRoutine(routine.id);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors m-0 border-0 ${
                              routine.completed ? 'bg-green-500 hover:bg-green-600' : 'border-2 border-border/60 hover:border-green-500'
                            } !p-0`}
                          >
                            <CheckCircle
                              className={`h-5 w-5 ${
                                routine.completed ? 'text-white' : 'text-transparent'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-center text-muted-foreground p-4">오늘은 루틴이 없어요!</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="dark:card-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-foreground flex items-center space-x-2">
            <Users className="h-4 w-4 icon-accent" />
            <span>참여 중인 그룹</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-0">
            {participatingGroups.length > 0 ? (
              participatingGroups.map((group: Group, index: number) => (
                <div key={group.groupId}>
                  <div
                    className={`flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                      index < participatingGroups.length - 1 ? 'border-b border-border/60' : ''
                    }`}
                    onClick={() => handleGroupClick(group)}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex w-14">
                        
                          <div className="cursor-pointer hover:scale-110 transition-transform" >
                            <Avatar className="w-12 h-12">
                              <AvatarImage className='object-cover' src={group.groupImageUrl} alt={group.groupName} />
                              <AvatarFallback>{group.groupName.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </div>
                        
                      </div>
                      <div className='flex flex-col items-start'>
                        <div className="text-sm font-medium text-foreground">{group.groupName}</div>
                        <div className="text-xs text-foreground dark:opacity-75">{group.currentMemberCount}명 참여</div>
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
              ))
            ) : (
              <p className="text-sm text-center text-muted-foreground p-4">아직 참여 중인 그룹이 없어요.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="dark:card-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-foreground flex items-center space-x-2">
            <Camera className="h-4 w-4 icon-accent" />
            <span>나의 인증 사진</span>
            <Badge variant="secondary" className="text-xs">공개된 사진만</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {publicVerificationPhotos.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {publicVerificationPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="space-y-2 cursor-pointer"
                  onClick={() => handlePhotoClick(index)}
                >
                  <div className="relative rounded-lg overflow-hidden aspect-square">
                    <ImageWithFallback
                      src={photo.imageUrl} // imageUrl로 수정
                      alt={photo.routine}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-end">
                      <div className="p-2">
                        <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">
                          {photo.activityDate}
                        </span>
                      </div>
                    </div>
                  </div>
                <div className="text-xs text-foreground font-medium text-center">
                  {photo.routine}
                </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="text-center py-8">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">아직 인증사진이 없습니다.</p>
              <p className="text-xs text-muted-foreground">
                루틴을 완료하고 기록으로 남겨보세요!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 갤러리 모달 */}
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
                    <img 
                      src={publicVerificationPhotos[selectedPhotoIndex].imageUrl} 
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
                      onClick={handlePrevPhoto} 
                      disabled={selectedPhotoIndex === 0}
                    >
                      <ChevronLeft className="h-10 w-10" />
                    </Button>
                    
                    {/* 다음 사진 버튼 */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white opacity-80 rounded-full hover:bg-black/50  hover:text-white hover:border-none"
                      onClick={handleNextPhoto} 
                      disabled={selectedPhotoIndex === publicVerificationPhotos.length - 1}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
    <div className='h-3'></div>
    </div>
  );
}