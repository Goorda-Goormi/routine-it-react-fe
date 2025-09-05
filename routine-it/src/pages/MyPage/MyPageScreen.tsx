import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

type BadgeType = '첫걸음' | '7일 연속' | '루틴 마스터' | '월간 챔피언';

interface MyPageScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  user: {
    nickname: string;
    email?: string;
    profileImageUrl: string;
    joinDate?: string;
    level?: number;
    exp?: number;
    maxExp?: number;
    streakDays: number;
    profileMessage?: string;
  }
  onLogout: () => void;
  attendanceDates: string[];
  earnedBadges: BadgeType[];
}

export function MyPageScreen({ onNavigate, isDarkMode, onToggleDarkMode, user, onLogout, attendanceDates = [], earnedBadges = [] }: MyPageScreenProps) {
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

  const getCalendarData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // 해당 월의 첫 날
    const firstDayOfMonth = new Date(year, month, 1);
    // 해당 월의 마지막 날
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // 첫 날의 요일 (0: 일요일, 1: 월요일, ...)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    // 해당 월의 총 날짜 수
    const numDays = lastDayOfMonth.getDate();
    
    const daysArray = [];
    
    // 요일 시작을 맞추기 위해 빈 칸 추가
    for (let i = 0; i < firstDayOfWeek; i++) {
      daysArray.push(null);
    }
    
    // 해당 월의 날짜 추가
    for (let i = 1; i <= numDays; i++) {
      daysArray.push(i);
    }
    
    return {
      year,
      month: month + 1,
      days: daysArray,
      today: new Date().getDate(),
    };
  };

  const calendarData = getCalendarData(currentDate);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // onNavigate 함수 호출 시 onSave 함수를 props로 전달
  const handleEditProfile = () => {
    onNavigate('profile-edit', { initialUserInfo: user, isDarkMode, onToggleDarkMode });
  };

  const stats = [
    { 
      label: '총 활동일', 
      value: '127', 
      unit: '일',
      icon: Calendar,
      bgColor: 'bg-purple-500/40',
      borderColor: 'border-purple-200/50',
      iconBgColor: 'bg-purple-500/70',
      textColor: 'text-purple-800',
      subTextColor: 'text-purple-700'
    },
    { 
      label: '완료한 루틴', 
      value: '1,245', 
      unit: '개',
      icon: CheckCircle,
      bgColor: 'bg-pink-500/20',
      borderColor: 'border-pink-200/50',
      iconBgColor: 'bg-pink-500/50',
      textColor: 'text-pink-800',
      subTextColor: 'text-pink-700'
    },
    { 
      label: '누적 점수', 
      value: '2,450', 
      unit: '점',
      icon: TrendingUp,
      bgColor: 'bg-orange-500/40',
      borderColor: 'border-orange-200/50',
      iconBgColor: 'bg-orange-500/70',
      textColor: 'text-orange-800',
      subTextColor: 'text-orange-700'
    },
    { 
      label: '최대 연속', 
      value: '28', 
      unit: '일',
      icon: Flame,
      bgColor: 'bg-yellow-500/40',
      borderColor: 'border-yellow-200/50',
      iconBgColor: 'bg-yellow-500',
      textColor: 'text-yellow-800',
      subTextColor: 'text-yellow-700'
    }
  ];


  const expProgress = user.maxExp ? Math.round(((user.exp ?? 0) / user.maxExp) * 100) : 0;;

  return (
    <div className="space-y-6 h-full p-4">
      {/* 프로필 헤더 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.profileImageUrl} alt={user.nickname} />
              <AvatarFallback className="text-lg">{user.nickname.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-lg font-semibold text-card-foreground">{user.nickname}</h2>
                <Badge variant="secondary" className="text-xs">Lv.{user.level}</Badge>
              </div>
              <p className="text-sm text-left text-muted-foreground mb-2">{user.email}</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">경험치</span>
                  <span className="text-card-foreground">{user.exp}/{user.maxExp}</span>
                </div>
                <Progress value={expProgress} className="h-2" />
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

                const today = new Date();
                today.setHours(0, 0, 0, 0); // 시간, 분, 초, 밀리초를 0으로 설정
                const dateInLoop = new Date(calendarData.year, calendarData.month - 1, day);
                
                const isToday = dateInLoop.getTime() === today.getTime();
                const isPast = dateInLoop < today;

                const dayString = `${calendarData.year}-${String(calendarData.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasAttended = attendanceDates.includes(dayString);

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
      <Card>
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

      {/* 설정 메뉴 */}
      <Card>
        <CardHeader className="pb-4 ">
          <CardTitle className="text-base text-card-foreground flex items-center space-x-2 ">
            <Settings className="h-4 w-4 icon-accent " />
            <span>설정</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            {/* 다크모드 토글 */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
                  <Settings className="h-4 w-4 icon-secondary" />
                </div>
                <span className="text-sm font-medium text-card-foreground">다크 모드</span>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={onToggleDarkMode}
              />
            </div>

            {/* 설정 버튼 */}
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto text-card-foreground hover:text-card-foreground hover:bg-accent/50"
              onClick={() => onNavigate('settings')}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
                  <Settings className="h-4 w-4 icon-secondary" />
                </div>
                <span className="text-sm font-medium">앱 설정</span>
              </div>
            </Button>

            {/* 도움말 버튼 */}
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto text-card-foreground hover:text-card-foreground hover:bg-accent/50"
              onClick={() => onNavigate('help')}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
                  <HelpCircle className="h-4 w-4 icon-secondary" />
                </div>
                <span className="text-sm font-medium">도움말</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 가입 정보 및 로그아웃 */}
      <div className="space-y-3">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {user.joinDate}에 가입 • 루틴잇과 함께한 지 {Math.floor(Math.random() * 300 + 100)}일
          </p>
        </div>
        
        <Button
          variant="outline"
          className="w-full bg-red-500/80 hover:bg-red-600/80 text-white border-red-400/50 hover:border-red-500/50 transition-colors"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          로그아웃
        </Button>
      </div>
    </div>
  );
}