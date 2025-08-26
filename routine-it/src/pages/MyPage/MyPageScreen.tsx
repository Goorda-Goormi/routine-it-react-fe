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

interface MyPageScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  user: {
    name: string;
    email: string;
    avatar: string;
    joinDate: string;
    level: number;
    exp: number;
    maxExp: number;
    streakDays: number;
    bio: string;
  }
}

export function MyPageScreen({ onNavigate, isDarkMode, onToggleDarkMode, user }: MyPageScreenProps) {
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
      bgColor: 'bg-purple-500/70',
      borderColor: 'border-purple-200/50',
      iconBgColor: 'bg-purple-500',
      textColor: 'text-purple-800',
      subTextColor: 'text-purple-700'
    },
    { 
      label: '완료한 루틴', 
      value: '1,245', 
      unit: '개',
      icon: CheckCircle,
      bgColor: 'bg-emerald-500/70',
      borderColor: 'border-emerald-200/50',
      iconBgColor: 'bg-emerald-500',
      textColor: 'text-emerald-800',
      subTextColor: 'text-emerald-700'
    },
    { 
      label: '누적 점수', 
      value: '2,450', 
      unit: '점',
      icon: TrendingUp,
      bgColor: 'bg-blue-500/70',
      borderColor: 'border-blue-200/50',
      iconBgColor: 'bg-blue-500',
      textColor: 'text-blue-800',
      subTextColor: 'text-blue-700'
    },
    { 
      label: '최대 연속', 
      value: '28', 
      unit: '일',
      icon: Flame,
      bgColor: 'bg-orange-500/70',
      borderColor: 'border-orange-200/50',
      iconBgColor: 'bg-orange-500',
      textColor: 'text-orange-800',
      subTextColor: 'text-orange-700'
    }
  ];

  const achievements = [
    { 
      id: 1, 
      name: '첫 걸음', 
      description: '첫 루틴 완료', 
      earned: true, 
      date: '2024.01.15',
      icon: Zap,
      bgColor: 'bg-amber-500/70',
      borderColor: 'border-amber-200/50',
      textColor: 'text-amber-800',
      subTextColor: 'text-amber-700'
    },
    { 
      id: 2, 
      name: '꾸준함', 
      description: '7일 연속 완료', 
      earned: true, 
      date: '2024.01.22',
      icon: Heart,
      bgColor: 'bg-green-500/70',
      borderColor: 'border-green-200/50',
      textColor: 'text-green-800',
      subTextColor: 'text-green-700'
    },
    { 
      id: 3, 
      name: '루틴 마스터', 
      description: '100개 루틴 완료', 
      earned: true, 
      date: '2024.03.10',
      icon: Shield,
      bgColor: 'bg-blue-500/70',
      borderColor: 'border-blue-200/50',
      textColor: 'text-blue-800',
      subTextColor: 'text-blue-700'
    },
    { 
      id: 4, 
      name: '월간 챔피언', 
      description: '한 달 완주', 
      earned: false, 
      date: null,
      icon: Trophy,
      bgColor: 'bg-gray-300/70',
      borderColor: 'border-gray-300/50',
      textColor: 'text-gray-700',
      subTextColor: 'text-gray-600'
    }
  ];

  const expProgress = Math.round((user.exp / user.maxExp) * 100);

  return (
    <div className="space-y-6 h-full p-4">
      {/* 프로필 헤더 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-lg font-semibold text-card-foreground">{user.name}</h2>
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
                const isToday = day !== null && new Date().getFullYear() === calendarData.year && new Date().getMonth() + 1 === calendarData.month && day === calendarData.today;
                const isPast = day !== null && (currentDate.getFullYear() < new Date().getFullYear() || (currentDate.getFullYear() === new Date().getFullYear() && currentDate.getMonth() < new Date().getMonth()) || (currentDate.getFullYear() === new Date().getFullYear() && currentDate.getMonth() === new Date().getMonth() && day < new Date().getDate()));
                const hasAttendance = isPast && Math.random() > 0.2; // 80% 확률로 출석
                
                return (
                  <div
                    key={i}
                    className={`h-8 w-8 flex items-center justify-center text-xs rounded-full ${
                      day === null
                        ? '' // 빈 칸
                        : isToday
                        ? 'bg-primary text-primary-foreground font-medium'
                        : hasAttendance
                        ? 'bg-green-500 text-white'
                        : isPast
                        ? 'bg-gray-200 text-gray-400'
                        : 'text-muted-foreground'
                    }`}
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
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              return (
                <Card key={achievement.id} className={`${achievement.bgColor} ${achievement.borderColor}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        achievement.earned ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${achievement.textColor} truncate`}>
                          {achievement.name}
                        </div>
                        <div className={`text-xs ${achievement.subTextColor} mb-1`}>
                          {achievement.description}
                        </div>
                        {achievement.earned && achievement.date && (
                          <div className={`text-xs ${achievement.subTextColor}`}>
                            {achievement.date}
                          </div>
                        )}
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
          className="w-full bg-red-500/80 hover:bg-red-600/80 text-white border-red-400/50 hover:border-red-500/50 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          로그아웃
        </Button>
      </div>
    </div>
  );
}