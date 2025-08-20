import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Target, CheckCircle, Clock, Calendar, TrendingUp, Filter, Camera } from 'lucide-react';

interface RoutineScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export function RoutineScreen({ onNavigate }: RoutineScreenProps) {
  const [activeFilter, setActiveFilter] = useState('today');

  // 오늘의 루틴 (상태 관리를 위해 useState 사용)
  const [todayRoutines, setTodayRoutines] = useState([
    {
      id: 1,
      name: '아침 운동',
      category: '운동',
      time: '07:00',
      completed: true,
      streak: 5,
      difficulty: '보통'
    },
    {
      id: 2,
      name: '물 2L 마시기',
      category: '건강',
      time: '언제든',
      completed: false,
      streak: 12,
      difficulty: '쉬움'
    },
    {
      id: 3,
      name: '독서 30분',
      category: '학습',
      time: '21:00',
      completed: true,
      streak: 8,
      difficulty: '보통'
    },
    {
      id: 4,
      name: '명상 10분',
      category: '건강',
      time: '06:30',
      completed: false,
      streak: 3,
      difficulty: '쉬움'
    }
  ]);

  // 전체 루틴
  const allRoutines = [
    ...todayRoutines,
    {
      id: 5,
      name: '영어 공부',
      category: '학습',
      time: '19:00',
      completed: false,
      streak: 15,
      difficulty: '어려움'
    },
    {
      id: 6,
      name: '일기 쓰기',
      category: '생활',
      time: '22:00',
      completed: true,
      streak: 20,
      difficulty: '쉬움'
    }
  ];

  // 추천 루틴
  const recommendedRoutines = [
    {
      id: 7,
      name: '스트레칭',
      category: '운동',
      description: '매일 10분 스트레칭으로 몸의 긴장을 풀어보세요',
      difficulty: '쉬움',
      popularity: 4.8,
      participants: 1240
    },
    {
      id: 8,
      name: '감사 일기',
      category: '생활',
      description: '하루에 감사한 일 3가지를 적어보세요',
      difficulty: '쉬움',
      popularity: 4.7,
      participants: 980
    },
    {
      id: 9,
      name: '단어 암기',
      category: '학습',
      description: '매일 새로운 영어 단어 10개를 학습하세요',
      difficulty: '보통',
      popularity: 4.6,
      participants: 750
    }
  ];

  const getCompletedCount = (routines: any[]) => {
    return routines.filter(routine => routine.completed).length;
  };

  const getCompletionRate = (routines: any[]) => {
    if (routines.length === 0) return 0;
    return Math.round((getCompletedCount(routines) / routines.length) * 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '쉬움': return 'text-green-600 bg-green-50 border-green-200 dark:text-white dark:bg-green-900/30 dark:border-green-700/30';
      case '보통': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-white dark:bg-yellow-900/30 dark:border-yellow-700/30';
      case '어려움': return 'text-red-600 bg-red-50 border-red-200 dark:text-white dark:bg-red-900/30 dark:border-red-700/30';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-white dark:bg-gray-900/30 dark:border-gray-700/30';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case '운동': return '💪';
      case '건강': return '🏥';
      case '학습': return '📚';
      case '생활': return '🏠';
      default: return '📋';
    }
  };

  const handleRoutineClick = (routine: any) => {
    onNavigate('routine-detail', routine);
  };

  const handleAddRoutine = () => {
    onNavigate('create-routine');
  };

  // 루틴 완료 상태 토글
  const toggleRoutineCompletion = (routineId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 본문 클릭 이벤트 방지
    setTodayRoutines(prev => 
      prev.map(routine => 
        routine.id === routineId 
          ? { ...routine, completed: !routine.completed }
          : routine
      )
    );
  };

  return (
    <div className="space-y-6 h-full">
      {/* 헤더 및 진행률 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className='flex flex-col items-start ml-6'>
            <h2 className="text-lg font-semibold text-foreground">나의 루틴</h2>
            <p className="text-sm text-foreground dark:opacity-75">꾸준한 습관으로 더 나은 내일을 만들어보세요</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleAddRoutine}
            className="text-foreground border-border hover:bg-accent hover:text-foreground mr-6"
          >
            <Plus className="h-4 w-4 mr-1 icon-secondary" />
            루틴 추가
          </Button>
        </div>

        {/* 오늘의 진행률 카드 - 다크모드에서 찐한 주황색 배경 */}
        <Card className="m-5 bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-200/60 dark:bg-card-yellow-bg dark:border-none dark:card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 dark:bg-orange-700">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-800 dark:text-white">오늘의 진행률</span>
                  <span className="text-sm text-amber-700 dark:text-white dark:opacity-90">
                    {getCompletedCount(todayRoutines)}/{todayRoutines.length} 완료
                  </span>
                </div>
                <Progress value={getCompletionRate(todayRoutines)} className="h-2 mt-2" />
              </div>
            </div>
            <div className="text-xs text-amber-700 dark:text-white dark:opacity-90">
              {getCompletionRate(todayRoutines)}% 달성 • 조금만 더 힘내세요!
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 탭 메뉴 */}
      <Tabs value={activeFilter} onValueChange={setActiveFilter} className="space-y-4 flex flex-col items-center">
        <TabsList className="grid w-[413px] h-[40px] grid-cols-3">
          <TabsTrigger value="today">
            오늘
          </TabsTrigger>
          <TabsTrigger value="all">
            전체
          </TabsTrigger>
          <TabsTrigger value="recommended">
            추천
          </TabsTrigger>
        </TabsList>

        {/* 오늘의 루틴 */}
        <TabsContent value="today" className="space-y-4 w-[413px]">
          <Card className="dark:card-shadow">
            <CardHeader>
              <CardTitle className="text-base text-foreground flex items-center space-x-2 mt-1 mb-3">
                <Calendar className="h-4 w-4 icon-accent" />
                <span>오늘의 루틴</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayRoutines.map((routine, index) => (
                  <div key={routine.id}>
                    <div 
                      className={`p-3 transition-colors rounded-lg ${
                        routine.completed 
                          ? 'bg-green-50/50 dark:bg-green-900/20' 
                          : 'hover:bg-accent/50'
                      } ${index < todayRoutines.length - 1 ? 'border-b border-border/30' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        {/* 왼쪽: 루틴 정보 (2줄 레이아웃) */}
                        <div className="flex flex-col items-start cursor-pointer ml-2" onClick={() => handleRoutineClick(routine)}>
                          <div className="flex items-start space-x-2 mb-1">
                            <span className={`text-sm font-medium ${
                              routine.completed 
                                ? 'text-green-700 dark:text-green-400 line-through' 
                                : 'text-foreground'
                            }`}>
                              {getCategoryEmoji(routine.category)} {routine.name}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getDifficultyColor(routine.difficulty)}`}
                            >
                              {routine.difficulty}
                            </Badge>
                          </div>
                          <div className="text-xs text-foreground dark:opacity-75">
                            <Clock className="h-3 w-3 inline mr-1 icon-muted" />
                            {routine.time} • {routine.streak}일 연속
                          </div>
                        </div>
                        
                        {/* 오른쪽: 액션 버튼들 */}
                        <div className="flex items-center space-x-2">
                          {/* 완료 체크박스 */}
                          <button
                            onClick={(e) => toggleRoutineCompletion(routine.id, e)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                              routine.completed 
                                ? 'bg-green-500 hover:bg-green-600' 
                                : 'border-2 border-muted-foreground hover:border-green-500'
                            }`}
                          >
                            {routine.completed && <CheckCircle className="h-4 w-4 text-white" />}
                          </button>
                          
                          {!routine.completed && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-foreground border-border hover:bg-accent hover:text-foreground"
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 전체 루틴 */}
        <TabsContent value="all" className="space-y-4 w-[413px]">
          <Card className="dark:card-shadow">
            <CardHeader>
              <CardTitle className="text-base text-foreground flex items-center space-x-2 mt-1">
                <Target className="h-4 w-4 icon-accent" />
                <span>전체 루틴</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {allRoutines.map((routine, index) => (
                  <div key={routine.id}>
                    <div 
                      className={`flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50 transition-colors rounded-lg ${
                        index < allRoutines.length - 1 ? 'border-b border-border/30' : ''
                      }`}
                      onClick={() => handleRoutineClick(routine)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          routine.completed 
                            ? 'bg-green-500' 
                            : 'border-2 border-muted-foreground'
                        }`}>
                          {routine.completed && <CheckCircle className="h-4 w-4 text-white" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-foreground">
                              {getCategoryEmoji(routine.category)} {routine.name}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getDifficultyColor(routine.difficulty)}`}
                            >
                              {routine.difficulty}
                            </Badge>
                          </div>
                          <div className="text-xs text-left text-foreground dark:opacity-75 ml-1">
                            <Clock className="h-3 w-3 inline mr-1 icon-muted" />
                            {routine.time} • {routine.streak}일 연속
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          <TrendingUp className="h-4 w-4 inline mr-1 icon-accent" />
                          {routine.streak}일
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 추천 루틴 */}
        <TabsContent value="recommended" className="space-y-4 w-[413px]">
          <Card className="dark:card-shadow">
            <CardHeader>
              <CardTitle className="text-base text-foreground flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 icon-accent" />
                <span>추천 루틴</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-0">
                {recommendedRoutines.map((routine, index) => (
                  <div key={routine.id}>
                    <div 
                      className={`p-3 hover:bg-accent/50 transition-colors rounded-lg cursor-pointer ${
                        index < recommendedRoutines.length - 1 ? 'border-b border-border/30' : ''
                      }`}
                      onClick={() => handleRoutineClick(routine)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex flex-col items-start">
                          <div className="flex items-center space-x-2 mb-2.5">
                            <span className="text-sm font-medium text-foreground">
                              {getCategoryEmoji(routine.category)} {routine.name}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getDifficultyColor(routine.difficulty)}`}
                            >
                              {routine.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-foreground dark:opacity-75 mb-2 ml-1">
                            {routine.description}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-foreground dark:opacity-75">
                            <span>⭐ {routine.popularity}</span>
                            <span>👥 {routine.participants.toLocaleString()}명 참여</span>
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-foreground border-border hover:bg-accent hover:text-foreground ml-3"
                        >
                          <Plus className="h-4 w-4 mr-1 icon-secondary" />
                          추가
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}