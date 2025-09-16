import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ArrowLeft, ChevronLeft, ChevronRight, X, Camera, Flame, TrendingUp, Calendar, Trophy, Users, CheckCircle, Target, Clock, Lock } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { getStreakInfo, getStreakMessage } from '../../components/utils/streakUtils';
import type {Routine, UserProfile, Member, Group} from '../../interfaces';
import { getPersonalRoutinesByUser, type PersonalRoutineResponse } from '../../api/personalRoutine';
import { getUserProfile, type PublicUserProfile } from '../../api/user';
import { getUserAuthPhotos, getUserActivitiesByDay, getTotalAttendanceDays } from '../../api/activity';
import { getJoinedGroups } from '../../api/group'; 

interface AuthPhoto {
  id: number;
  routine: string; 
  imageUrl: string;
  activityDate: string;
  isPublic: boolean;
}

const getTodayDayOfWeek = () => {
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date();
  return dayOfWeek[today.getDay()];
};

// '1111100' -> ['월', '화', '수', '목', '금']
const convertAuthDaysToFrequency = (authDays: string): string[] => {
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  if (!authDays || authDays.length !== 7) return [];
  return authDays.split('').map((char, index) => (char === '1' ? daysOfWeek[index] : null)).filter(Boolean) as string[];
};

// { hour: 8, minute: 0 } -> '08:00'
const convertAlarmTimeToTimeString = (alarmTime: { hour?: number; minute?: number }): string => {
  if (!alarmTime || typeof alarmTime.hour !== 'number' || typeof alarmTime.minute !== 'number') {
    return '09:00';
  }
  const hour = String(alarmTime.hour).padStart(2, '0');
  const minute = String(alarmTime.minute).padStart(2, '0');
  return `${hour}:${minute}`;
};

// Group -> Routine
const transformGroupToRoutine = (group: Group): Routine => ({
  id: group.groupId,
  name: group.groupName,
  description: group.description,
  category: group.category,
  time: convertAlarmTimeToTimeString(group.alarmTime),
  frequency: convertAuthDaysToFrequency(group.authDays),
  isGroupRoutine: true,
  completed: false, 
  goal: '30',
  reminder: true,
  isPublic: true,
  streak: 0,
});

const transformUserRoutine = (pr: PersonalRoutineResponse): Routine => ({
  id: pr.routineId,
  name: pr.routineName,
  description: pr.description,
  time: pr.startTime,

  isPublic: pr.isPublic,
  reminder: pr.isAlarmOn,
  frequency: convertAuthDaysToFrequency(pr.repeatDays), 
  isGroupRoutine: false,
  completed: false, 
  streak: 0, 
  goal: '30', 
  category: '생활',
});

interface UserHomeScreenProps {
  user: { id: number; nickname: string; };
  onBack: () => void;
  
}

export function UserHomeScreen({ user, onBack }: UserHomeScreenProps) {
  console.log('1. [UserHomeScreen 시작] props로 받은 user:', user);

  const today = new Date();
  const todayString = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

  const [userProfile, setUserProfile] = useState<PublicUserProfile | null>(null);
  const [userRoutines, setUserRoutines] = useState<Routine[]>([]);
  const [completedActivities, setCompletedActivities] = useState({
    personal: new Map<number, number>(),
    group: new Map<number, number>(),
  });
  const [totalAttendance, setTotalAttendance] = useState(0);
  const streakInfo = getStreakInfo(totalAttendance);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [verificationPhotos, setVerificationPhotos] = useState<AuthPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  
  useEffect(() => {
    if (!user?.id) {
      setError("사용자 ID가 제공되지 않았습니다.");
      setIsLoading(false);
      return;
    }
      const fetchAllUserData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [
          profileData,
          personalRoutinesData,
          joinedGroupsData,
          activitiesData,
          totalAttendanceData,
          photosData
        ] = await Promise.all([
          getUserProfile(user.id),
          getPersonalRoutinesByUser(user.id),
          getJoinedGroups(user.id),
          getUserActivitiesByDay(today, user.id),
          getTotalAttendanceDays({ targetUserId: user.id }),
          getUserAuthPhotos(user.id)
        ]);

        const personalMap = new Map<number, number>();
        const groupMap = new Map<number, number>();
        if (Array.isArray(activitiesData)) {
          activitiesData.forEach((activity: any) => {
            if (activity.activityType === 'PERSONAL_ROUTINE_COMPLETE' && activity.personalRoutineId) {
              personalMap.set(activity.personalRoutineId, activity.activityId);
            } else if (activity.activityType === 'GROUP_AUTH_COMPLETE' && activity.groupId) {
              groupMap.set(activity.groupId, activity.activityId);
            }
          });
        }
        setCompletedActivities({ personal: personalMap, group: groupMap });

        const publicPersonalRoutines = (personalRoutinesData || [])
          .filter(routine => routine.isPublic)
          .map(transformUserRoutine);
        const groupRoutines = (joinedGroupsData || []).map(transformGroupToRoutine);

        const allRoutines = [...publicPersonalRoutines, ...groupRoutines];
        const routinesWithCompletion = allRoutines.map(routine => ({
          ...routine,
          completed: routine.isGroupRoutine
            ? groupMap.has(routine.id)
            : personalMap.has(routine.id),
        }));

        setUserRoutines(routinesWithCompletion);
        setUserProfile(profileData);
        setJoinedGroups(joinedGroupsData || []);
        setTotalAttendance(totalAttendanceData);
        setVerificationPhotos(photosData || []);

      } catch (err) {
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllUserData();
  }, [user.id]);
 
  const publicVerificationPhotos = verificationPhotos.filter(photo => !photo.isPublic);

  const openGallery = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeGallery = () => {
    setSelectedPhotoIndex(null);
  };

  const showNextPhoto = () => {
  if (selectedPhotoIndex !== null) {
    const newIndex = (selectedPhotoIndex + 1) % publicVerificationPhotos.length;
    setSelectedPhotoIndex(newIndex);
  }
};

  const showPrevPhoto = () => {
  if (selectedPhotoIndex !== null) {
    const newIndex = (selectedPhotoIndex - 1 + publicVerificationPhotos.length) % publicVerificationPhotos.length;
    setSelectedPhotoIndex(newIndex);
  }
};


  if (isLoading) {
    return <div>프로필을 불러오는 중...</div>;
  }

  if (error) {
    return <div>오류가 발생했습니다: {error}</div>;
  }

  if (!userProfile) {
    return <div>사용자 정보를 찾을 수 없습니다.</div>;
  }
  const todayDay = getTodayDayOfWeek();
  const todaysRoutines = userRoutines.filter(routine => 
    routine.frequency && routine.frequency.includes(todayDay)
  );
  const totalPhotos = verificationPhotos.length;
  const publicPhotosCount = publicVerificationPhotos.length;
  const totalRoutines = todaysRoutines.length;
  const completedRoutines = todaysRoutines.filter(routine => routine.completed).length;
  const completionRate = totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0;
  const publicRoutines = userRoutines.filter(routine => routine.isPublic);
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
    <div className="h-full flex flex-col p-6">
      {/* 콘텐츠 */}
      <div className="flex-1 px-4 pb-6 space-y-4">
        {/* 사용자 정보 및 현황 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            
            <div className="flex flex-col flex-1 ml-1">
              <div className="flex items-center justify-between ">
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-xl bg-font-semibold text-foreground">{userProfile.nickname}님의 홈</h2>
                  
                </div>
              </div>
              <div className="text-sm text-left text-muted-foreground font-semibold">
                "{userProfile.profileMessage}"
              </div>
            </div>
            <Avatar className="w-14 h-14 mr-2">
              <AvatarImage src={userProfile.profileImageUrl} alt={userProfile.nickname} className='object-cover'/>
              <AvatarFallback className="text-lg">{userProfile.nickname?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </div>

          {/* 완료 현황 및 연속 출석 카드 */}
          <div className="grid grid-cols-3 gap-3">
            {/* 완료일수 */}
            <Card className="bg-card-yellow-bg border border-card-yellow-border dark:border-none dark:card-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 dark:bg-orange-700">
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
            <Card className="bg-card-lavender-bg border border-card-lavender-border dark:border-none dark:card-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 dark:bg-purple-800">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{(userProfile.totalScore ?? 0).toLocaleString()}</div>
                    <div className="text-xs">누적점수</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 동적 연속 출석 */}
            <Card className={`${streakInfo.containBgColor} border ${streakInfo.borderColor} dark:border-none dark:card-shadow`}>
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${streakInfo.bgColor}`}>
                    <div className="text-xl mb-0 bg">{streakInfo.icon}</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl font-bold ${streakInfo.textColor}`}>{totalAttendance}</div>
                    <div className={`text-xs ${streakInfo.subTextColor}`}>{streakInfo.stage}</div>
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
                {getStreakMessage(totalAttendance)}
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
              {todaysRoutines.length > 0 ? (
                todaysRoutines.map((routine, index) => (
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
                          <div className={`text-sm text-left font-medium ${
                            routine.completed 
                              ? 'text-green-700 dark:text-green-400 line-through' 
                              : 'text-foreground'
                          }`}>
                            {routine.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {routine.time} • {routine.streak}일 연속
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">오늘은 예정된 루틴이 없습니다.</p>
              )}
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
              {joinedGroups.length > 0 ? (
                joinedGroups.map((group, index) => (
                  <div key={group.groupId}>
                    <div className={`flex items-center justify-between p-3 hover:bg-accent/50 transition-colors ${
                      index < joinedGroups.length - 1 ? 'border-b border-border/30' : ''
                    }`}>
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="flex w-14">                          
                            <Avatar className="w-12 h-12">
                              <AvatarImage className='object-cover' src={group.groupImageUrl} alt={group.groupName} />
                              <AvatarFallback>{group.groupName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                          <div className="text-sm text-left font-medium text-foreground">{group.groupName}</div>
                          <div className="text-xs text-left text-muted-foreground">{group.currentMemberCount}명 참여</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
              <p className="text-center text-sm text-muted-foreground py-4">참여중인 그룹이 없습니다.</p>
            )}
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
                        src={photo.imageUrl}
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
                      <span className="text-xs text-muted-foreground">{new Date(photo.activityDate).toLocaleDateString('ko-KR')}</span>
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
      {selectedPhotoIndex !== null && publicVerificationPhotos[selectedPhotoIndex] && (
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