import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
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
  Shield
} from 'lucide-react';

interface MyPageScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function MyPageScreen({ onNavigate, isDarkMode, onToggleDarkMode }: MyPageScreenProps) {
  const [user] = useState({
    name: '김민수',
    email: 'minsu@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    joinDate: '2024년 1월',
    level: 15,
    exp: 2450,
    maxExp: 3000,
    streakDays: 28
  });

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
              onClick={() => onNavigate('profile-edit')}
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
          <CardTitle className="text-base text-card-foreground flex items-center space-x-2">
            <Calendar className="h-4 w-4 icon-accent" />
            <span>11월 출석 현황</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* 달력 헤더 */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
              <div>일</div>
              <div>월</div>
              <div>화</div>
              <div>수</div>
              <div>목</div>
              <div>금</div>
              <div>토</div>
            </div>
            
            {/* 달력 본체 */}
            <div className="grid grid-cols-7 gap-1">
              {/* 11월 1일이 금요일이라고 가정 */}
              {[...Array(5)].map((_, i) => (
                <div key={`empty-${i}`} className="h-8"></div>
              ))}
              
              {/* 11월 날짜들 */}
              {[...Array(30)].map((_, i) => {
                const day = i + 1;
                const today = 15; // 오늘을 15일로 가정
                const isToday = day === today;
                const isPast = day < today;
                const isFuture = day > today;
                const hasAttendance = isPast && Math.random() > 0.2; // 80% 확률로 출석
                
                return (
                  <div
                    key={day}
                    className={`h-8 w-8 flex items-center justify-center text-xs rounded-full ${
                      isToday
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