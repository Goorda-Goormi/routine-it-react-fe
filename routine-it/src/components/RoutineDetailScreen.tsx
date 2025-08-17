import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, Edit, Trash2, CheckCircle2, Calendar, Target, TrendingUp } from 'lucide-react';

interface RoutineDetailScreenProps {
  routine: any;
  onBack: () => void;
}

export function RoutineDetailScreen({ routine, onBack }: RoutineDetailScreenProps) {
  const [isCompleted, setIsCompleted] = useState(routine.completed);

  const weeklyData = [
    { day: '월', completed: true },
    { day: '화', completed: true },
    { day: '수', completed: false },
    { day: '목', completed: true },
    { day: '금', completed: true },
    { day: '토', completed: false },
    { day: '일', completed: false }
  ];

  const monthlyStats = {
    completedDays: 23,
    totalDays: 31,
    longestStreak: 12,
    currentStreak: routine.streak
  };

  const toggleComplete = () => {
    setIsCompleted(!isCompleted);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-1">
              <ArrowLeft className="h-5 w-5 icon-secondary" />
            </Button>
            <h1 className="font-bold text-primary">루틴 상세</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
              <Edit className="h-4 w-4 icon-secondary" />
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 루틴 정보 */}
        <Card className="dark:card-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="font-bold text-lg mb-2 text-primary">{routine.name}</h2>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{routine.time}</span>
                  <span>•</span>
                  <span>{routine.frequency}</span>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <Badge variant="secondary">{routine.streak}일 연속</Badge>
                  {isCompleted && (
                    <Badge variant="secondary" className="text-green-600 dark:text-green-400">완료</Badge>
                  )}
                </div>
              </div>
              <Button
                onClick={toggleComplete}
                variant={isCompleted ? "default" : "outline"}
                className={isCompleted ? "bg-green-600 hover:bg-green-700" : "text-primary border-border hover:bg-accent hover:text-primary"}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isCompleted ? '완료됨' : '완료하기'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 이번 주 진행률 */}
        <Card className="dark:card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base text-primary">
              <Calendar className="h-4 w-4 icon-accent" />
              <span>이번 주 진행률</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weeklyData.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-muted-foreground mb-2">{day.day}</div>
                  <div
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                      day.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {day.completed && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                </div>
              ))}
            </div>
            <Progress 
              value={(weeklyData.filter(d => d.completed).length / 7) * 100} 
              className="h-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {weeklyData.filter(d => d.completed).length}/7일 완료
            </p>
          </CardContent>
        </Card>

        {/* 월간 통계 */}
        <Card className="dark:card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base text-primary">
              <TrendingUp className="h-4 w-4 icon-accent" />
              <span>12월 통계</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4">
              {/* 완료일 - 라이트모드: 옅은 노랑, 다크모드: 짙은 배경 */}
              <div className="text-center p-3 rounded-lg bg-yellow-100 border border-yellow-200/60 dark:bg-gray-800 dark:border-yellow-500/30 dark:card-shadow">
                <div className="text-lg font-bold text-yellow-800 dark:text-yellow-300">{monthlyStats.completedDays}</div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">완료일</div>
              </div>
              
              {/* 달성률 - 라이트모드: 옅은 초록, 다크모드: 짙은 배경 */}
              <div className="text-center p-3 rounded-lg bg-green-100 border border-green-200/60 dark:bg-gray-800 dark:border-green-500/30 dark:card-shadow">
                <div className="text-lg font-bold text-green-800 dark:text-green-300">
                  {Math.round((monthlyStats.completedDays / monthlyStats.totalDays) * 100)}%
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">달성률</div>
              </div>
              
              {/* 최장 연속 - 라이트모드: 옅은 아이보리, 다크모드: 짙은 배경 */}
              <div className="text-center p-3 rounded-lg bg-orange-100 border border-orange-200/60 dark:bg-gray-800 dark:border-orange-500/30 dark:card-shadow">
                <div className="text-lg font-bold text-orange-800 dark:text-orange-300">{monthlyStats.longestStreak}</div>
                <div className="text-xs text-orange-600 dark:text-orange-400">최장 연속</div>
              </div>
              
              {/* 현재 연속 - 라이트모드: 옅은 라벤더, 다크모드: 짙은 배경 */}
              <div className="text-center p-3 rounded-lg bg-purple-100 border border-purple-200/60 dark:bg-gray-800 dark:border-purple-500/30 dark:card-shadow">
                <div className="text-lg font-bold text-purple-800 dark:text-purple-300">{monthlyStats.currentStreak}</div>
                <div className="text-xs text-purple-600 dark:text-purple-400">현재 연속</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 목표 설정 */}
        <Card className="dark:card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base text-primary">
              <Target className="h-4 w-4 icon-accent" />
              <span>목표 설정</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-content">알림 설정</span>
                <Button variant="outline" size="sm" className="text-primary border-border hover:bg-accent hover:text-primary">수정</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-content">반복 주기</span>
                <span className="text-sm text-muted-foreground">{routine.frequency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-content">목표 연속일</span>
                <span className="text-sm text-muted-foreground">30일</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}