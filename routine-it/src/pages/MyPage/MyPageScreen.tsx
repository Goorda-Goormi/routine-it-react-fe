import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Switch } from '../../components/ui/switch';
import { Progress } from '../../components/ui/progress';
import { 
 User, 
  Edit3, 
  Calendar, 
  Trophy, 
  Target, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut,
  TrendingUp,
  CheckCircle,
  Award,
  Clock,
  Flame,
  Star,
  Zap,
  Heart,
  Shield,
  ChevronLeft,
  ChevronRight,
  Bell,
  Moon 
} from 'lucide-react';
import { getMonthlyAttendanceDashboard, type MonthlyAttendanceDashboardResponse } from '../../api/activity';

type BadgeType = '첫걸음' | '7일 연속' | '루틴 마스터' | '월간 챔피언';

interface MyPageScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleAlarm: () => void;
  user: {
    nickname: string;
    email?: string;
    profileImageUrl: string;
    joinDate?: string;
    exp?: number;
    maxExp?: number;
    streakDays: number;
    maxStreakDays?: number;
    profileMessage?: string;
    isAlarmOn: boolean;
  }
  onLogout: () => void;
  attendanceDates: string[];
  earnedBadges: BadgeType[];
  routineCompletionCount: number; 
  userTotalScore: number | null;
}

export function MyPageScreen({ onNavigate, isDarkMode, onToggleDarkMode, onToggleAlarm, user, onLogout, attendanceDates = [], earnedBadges = [], routineCompletionCount, userTotalScore }: MyPageScreenProps) {
  const allBadgesInfo = [
    { 
      id: 1, 
      name: '첫걸음' as BadgeType, 
      description: '첫 루틴 완료', 
      date: '2024.01.15', // 획득 날짜는 예시로 남겨두거나, 실제 데이터를 저장해야 함
      icon: Zap,
      bgColor: 'bg-amber-200/70',
      borderColor: 'border-amber-200/50',
      textColor: 'text-amber-800',
      subTextColor: 'text-amber-700'
    },
    { 
      id: 2, 
      name: '7일 연속' as BadgeType,
      description: '7일 연속 완료', 
      date: '2024.01.22',
      icon: Heart,
      bgColor: 'bg-lime-600/30',
      borderColor: 'border-green-200/50',
      textColor: 'text-green-800',
      subTextColor: 'text-green-700'
    },
    { 
      id: 3, 
      name: '루틴 마스터' as BadgeType, 
      description: '100개 루틴 완료', 
      date: '2024.03.10',
      icon: Shield,
      bgColor: 'bg-blue-300/60',
      borderColor: 'border-blue-200/50',
      textColor: 'text-blue-800',
      subTextColor: 'text-blue-700'
    },
    { 
      id: 4, 
      name: '월간 챔피언' as BadgeType, 
      description: '한 달 출석', 
      date: '2024.05.30',
      icon: Trophy,
      bgColor: 'bg-red-300/60',
      borderColor: 'border-red-300/50',
      textColor: 'text-red-800',
      subTextColor: 'text-red-600'
    }
  ];
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<MonthlyAttendanceDashboardResponse | null>(null);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);

  const [animatedProgress, setAnimatedProgress] = useState(0);

  const targetProgress = user.maxExp ? Math.round(((userTotalScore ?? 0) / user.maxExp) * 100) : 0;

  useEffect(() => {
    const fetchMonthlyAttendance = async () => {
      setIsLoadingCalendar(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      try {
        const data = await getMonthlyAttendanceDashboard(year, month);
        setAttendanceData(data);
      } catch (error) {
        console.error("월별 출석 데이터 로딩 실패:", error);
        setAttendanceData(null); // 에러 발생 시 초기화
      } finally {
        setIsLoadingCalendar(false);
      }
    };

    fetchMonthlyAttendance();
  }, [currentDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(targetProgress);
    }, 100);

    return () => clearTimeout(timer); 
  }, [targetProgress]);

  const getCalendarData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const numDays = lastDayOfMonth.getDate();
    const daysArray = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      daysArray.push(null);
    }
    for (let i = 1; i <= numDays; i++) {
      daysArray.push(i);
    }
    return { year, month: month + 1, days: daysArray, today: new Date().getDate() };
  };

  const calendarData = getCalendarData(currentDate);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const handleEditProfile = () => {
    onNavigate('profile-edit', { initialUserInfo: user, isDarkMode, onToggleDarkMode });
  };

  const stats = [
    { 
      label: '총 활동일', 
      value: (user.streakDays ?? 0).toLocaleString(), 
      unit: '일',
      icon: Calendar,
      bgColor: 'bg-purple-500/40 dark: bg-purple-500/20',
      borderColor: 'border-purple-200/50 dark: border-purple-300/60',
      iconBgColor: 'bg-purple-500/70',
      textColor: 'text-purple-800',
      subTextColor: 'text-purple-700'
    },
    { 
      label: '완료한 루틴', 
      value: (routineCompletionCount ?? 0).toLocaleString(), 
      unit: '개',
      icon: CheckCircle,
      bgColor: 'bg-pink-500/20',
      borderColor: 'border-pink-200/50',
      iconBgColor: 'bg-pink-500/50',
      textColor: 'text-pink-800',
      subTextColor: 'text-pink-700'
    },
    { 
      label: '개인 점수', 
      value: userTotalScore ? userTotalScore.toLocaleString() : '0', 
      unit: '점',
      icon: TrendingUp,
      bgColor: 'bg-orange-500/40 dark: bg-orange-400/20',
      borderColor: 'border-orange-200/50 dark: border-orange-200/40',
      iconBgColor: 'bg-orange-500/70',
      textColor: 'text-orange-800',
      subTextColor: 'text-orange-700'
    },
    { 
      label: '최대 연속', 
      value: (attendanceData?.summary.longestStreak ?? 0).toLocaleString(),
      unit: '일',
      icon: Flame,
      bgColor: 'bg-yellow-500/40 dark: bg-yellow-500/20',
      borderColor: 'border-yellow-200/50 dark: border-yellow-400/50',
      iconBgColor: 'bg-yellow-500',
      textColor: 'text-yellow-800',
      subTextColor: 'text-yellow-700'
    }
  ];

  const formatJoinDate = (joinDateStr?: string): string => {
    if (!joinDateStr) return '가입일 정보 없음';
    const date = new Date(joinDateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  /**
   * 가입일로부터 오늘까지 며칠이 지났는지 계산합니다. (가입일을 1일차로 계산)
   */
  const getDaysSinceJoining = (joinDateStr?: string): number => {
    if (!joinDateStr) return 0;
    const joinDate = new Date(joinDateStr);
    const today = new Date();
    
    // 시간 정보를 무시하고 날짜만 비교하기 위해 자정으로 설정
    joinDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - joinDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="space-y-6 h-full p-4">
      {/* 프로필 헤더 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.profileImageUrl} alt={user.nickname} className='object-cover'/>
              <AvatarFallback className="text-lg">{user.nickname.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-lg font-semibold text-card-foreground">{user.nickname}</h2>
              </div>
              <p className="text-sm text-left text-muted-foreground mb-2">{user.email}</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">경험치</span>
                  <span className="text-card-foreground">{userTotalScore}/{user.maxExp}</span>
                </div>
                <Progress value={animatedProgress} className="h-2" />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEditProfile}
              className="text-card-foreground border-border hover:bg-accent hover:text-card-foreground"
            >
              <Edit3 className="h-4 w-4 mr-1 icon-secondary" />
              편집
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 이번 달 출석 달력 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center w-full">
            <Button onClick={handlePrevMonth} variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-base text-card-foreground flex items-center space-x-2">
              <Calendar className="h-4 w-4 icon-accent" />
              <span>{calendarData.year}년 {calendarData.month}월 출석 현황</span>
            </CardTitle>
            <Button onClick={handleNextMonth} variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 ml-5">
            {/* 달력 헤더 */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
              <div className="w-8 h-8 flex items-center justify-center">일</div>
              <div className="w-8 h-8 flex items-center justify-center">월</div>
              <div className="w-8 h-8 flex items-center justify-center">화</div>
              <div className="w-8 h-8 flex items-center justify-center">수</div>
              <div className="w-8 h-8 flex items-center justify-center">목</div>
              <div className="w-8 h-8 flex items-center justify-center">금</div>
              <div className="w-8 h-8 flex items-center justify-center">토</div>
            </div>
            
            {/* 달력 본체 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarData.days.map((day, i) => {
                if (day === null) {
                  return <div key={i} className="h-8 w-8"></div>;
                }

                const dayString = `${calendarData.year}-${String(calendarData.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayData = attendanceData?.calendar.find(d => d.date === dayString);
                const hasAttended = dayData ? dayData.attended : false;

                const today = new Date();
                today.setHours(0, 0, 0, 0); // 시간, 분, 초, 밀리초를 0으로 설정
                const dateInLoop = new Date(calendarData.year, calendarData.month - 1, day);
                
                const isToday = dateInLoop.getTime() === today.getTime();
                const isPast = dateInLoop < today;

                let dayClassName = 'text-muted-foreground'; // 미래 날짜 기본값
                if (isToday) {
                  dayClassName = 'bg-primary text-primary-foreground font-medium'; // 오늘
                } else if (hasAttended) {
                  dayClassName = 'bg-green-500 text-white'; // 출석한 날
                } else if (isPast) {
                  dayClassName = 'bg-gray-200 text-gray-400'; // 미출석한 과거
                }

                return (
                  <div
                    key={i}
                    className={`h-8 w-8 flex items-center justify-center text-xs rounded-full ${dayClassName}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            
            {/* 범례 */}
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>출석</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span>오늘</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                <span>미출석</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 활동 통계 */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-card-foreground flex items-center space-x-2">
            <Trophy className="h-4 w-4 icon-accent" />
            <span>활동 통계</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className={`${stat.bgColor} ${stat.borderColor}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${stat.iconBgColor}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className={`text-lg font-bold ${stat.textColor}`}>
                          {stat.value}
                        </div>
                        <div className={`text-xs ${stat.subTextColor}`}>
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 성취 배지 */}
      {/* <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-card-foreground flex items-center space-x-2">
            <Award className="h-4 w-4 icon-accent" />
            <span>성취 배지</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            {allBadgesInfo.map((badge) => {
              const isEarned = earnedBadges.includes(badge.name);
              const IconComponent = badge.icon;

              return (
                <Card 
                  key={badge.id} 
                  className={
                    isEarned 
                      ? `${badge.bgColor} ${badge.borderColor}`
                      : 'bg-gray-200/70 border-gray-300/50'
                  }>
                  <CardContent className="p-4 mt-1.5">
                    <div className="flex items-start space-x-4.5">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        isEarned ? 'bg-yellow-400 border-yellow-500/80' : 'bg-gray-300 border-gray-400/40'
                      }`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex flex-col items-start min-w-0">
                        <div className={`text-sm font-medium truncate ${
                          isEarned ? badge.textColor : 'text-gray-700'
                        }`}>
                          {badge.name}
                        </div>
                        <div className={`text-xs mb-1 ${
                          isEarned ? badge.subTextColor : 'text-gray-600'
                        }`}>
                          {badge.description}
                        </div>
                        <div className={`text-xs ${
                          isEarned ? badge.subTextColor : 'text-gray-600'
                        }`}>
                          {isEarned ? '획득 완료' : '미획득'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

       */}

      {/* 가입 정보 및 로그아웃 */}
      <div className="space-y-3">
        {/* <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {formatJoinDate(user.joinDate)}에 가입 • 루틴잇과 함께한 지 {getDaysSinceJoining(user.joinDate)}일
          </p>
        </div> */}
        
        <Button
          variant="outline"
          className="w-full mb-5 bg-red-500/80 dark:bg-red-500 hover:bg-red-600/80 dark:hover:bg-red-700 text-white border-red-400/50 hover:border-red-500/50 transition-colors"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2 " />
          로그아웃
        </Button>
      </div>
    </div>
  );
}