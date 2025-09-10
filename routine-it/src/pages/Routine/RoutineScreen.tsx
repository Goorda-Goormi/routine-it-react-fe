import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Plus, Target, CheckCircle, Clock, Calendar, TrendingUp, Filter, Camera, Users } from 'lucide-react';
import type { Routine, Group } from '../../interfaces';
import type { AuthMessage } from '../../interfaces';
import { GroupRoutineDialog } from '../../pages/Group/GroupChat/GroupRoutineDialog';
import { getGroupMembers, requestAuthApproval } from '../../api/group'; 

const getTodayDayOfWeek = () => {
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date();
  return dayOfWeek[today.getDay()];
};

export interface RecommendedRoutine {
  id: number;
  name: string;
  description: string;
  time: string;
  frequency: string[];
  reminder: boolean;
  goal: string;
  category: string;
  completed: boolean;
  streak: number;
  difficulty: string;
  isGroupRoutine: boolean;
  isPublic: boolean;
}

interface RoutineScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  allRoutines: Routine[];
  recommendedRoutines: RecommendedRoutine[]; 
  onCompletePersonalRoutine: (routineId: number) => void;
  onAddRecommendedRoutine: (routine: RecommendedRoutine) => void;
  onOpenAttendanceModal: () => void;
  onOpenStreakModal: (streakDays: number) => void;
  onOpenBadgeModal: (badgeName: string, badgeImage: string) => void;
  //onAddAuthMessage: (groupId: number, data: any, nickname: string, userId: string | number, routineId: number) => void;
  initialUserInfo: { nickname: string; id: number | string; };
  participatingGroups: Group[];
  allGroups: Group[];
  //pendingAuthMessages: { [groupId: number]: AuthMessage[] };
}

export function RoutineScreen({ onNavigate, allRoutines, recommendedRoutines, onCompletePersonalRoutine, onAddRecommendedRoutine, onOpenAttendanceModal, onOpenStreakModal, onOpenBadgeModal, initialUserInfo, participatingGroups, allGroups }: RoutineScreenProps) {
  const [activeFilter, setActiveFilter] = useState('today');
  const todayDay = getTodayDayOfWeek();
  
  const todayRoutines = allRoutines.filter(routine => {
    if (routine.frequency && Array.isArray(routine.frequency)) {
      return routine.frequency.includes(todayDay);
    }
    return false;
  });
   
  const getCompletedCount = (routines: Routine[]) => {
    return routines.filter(routine => routine.completed).length;
  };

  const getCompletionRate = (routines: Routine[]) => {
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
      case 'health': return '💪';
      case 'exercise': return '🏥';
      case 'study': return '📚';
      case 'lifestyle': return '🏠';
      case 'hobby': return '🎨'
      default: return '📋';
    }
  };

  const handleRoutineClick = (routine: any) => {
    onNavigate('routine-detail', routine);
  };

  const handleAddRoutine = () => {
    onNavigate('create-routine');
  };

  const getButtonOrCheckbox = (routine: Routine) => {
    const groupId = (participatingGroups || []).find(group => 
      group.routines?.some(r => r.id === routine.id)
    )?.groupId;

    if (routine.isGroupRoutine) {
      if (routine.completed) {
        return (
                <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors p-0 m-0 border-0 bg-green-500">
                    <CheckCircle className="h-5 w-5 text-white" />
                </div>
            );
        } else {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const group = participatingGroups.find(g => g.groupId === routine.id);
                if (group) {
                  onNavigate('group-chat', group);
                }
              }}
              className="w-auto h-8 rounded-full flex items-center justify-center ... px-3 py-1 text-xs ..."
            >
              <span className="flex items-center">
                {routine.type === '의무참여' && <Camera className="h-3 w-3 mr-1 text-foreground/70" />}
                인증
              </span>
            </button>
          );
        }
    } else {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCompletePersonalRoutine(routine.id);
            onOpenAttendanceModal(); 
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors m-0 border-0 ${
            routine.completed ? 'bg-green-500 hover:bg-green-600' : 'border-2 border-muted-foreground/60 hover:border-green-500'
          } !p-0`}
        >
          {routine.completed && <CheckCircle className="h-5 w-5 text-white" />}
        </button>
      );
    }
  };

  const renderRoutineCard = (routine: Routine, index: number, isLast: boolean, isRecommended: boolean = false) => (
    <div key={routine.id}>
      <div
        className={`p-3 transition-colors rounded-lg ${
          (routine as Routine).completed ? 'bg-green-50/50 dark:bg-green-900/20' : 'hover:bg-accent/50'
        } ${!isLast && 'border-b border-border/30'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start cursor-pointer ml-2" onClick={() => handleRoutineClick(routine)}>
            <div className="flex items-start space-x-2 mb-1">
              <span className={`text-sm font-medium ${
                (routine as Routine).completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-foreground'
              }`}>
                {getCategoryEmoji(routine.category)} {routine.name}
              </span>
              {(routine as Routine).isGroupRoutine && (
                <Users className="h-3 w-3 ml-1 text-primary icon-accent" />
              )}
            </div>
            <div className="text-xs text-foreground dark:opacity-75">
              <div className="h-3 w-3 inline mr-1 icon-muted" />
              {(routine as Routine).time} • {(routine as Routine).streak}일 연속
            </div>
          </div>
          <div className="flex items-center space-x-2 h-[30px]">
            {getButtonOrCheckbox(routine)}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecommendedCard = (routine: RecommendedRoutine, index: number, isLast: boolean) => (
    <div key={routine.id}>
      <div 
        className={`p-3 hover:bg-accent/50 transition-colors rounded-lg cursor-pointer ${
          !isLast && 'border-b border-border/30'
        }`}
        onClick={() => {onAddRecommendedRoutine(routine)
          setActiveFilter('all'); 
        }}
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
          </div>
          <Button 
            size="sm" 
            variant="outline"
            className="text-foreground border-border hover:bg-accent hover:text-foreground ml-3"
            onClick={() => {
              setActiveFilter('all'); 
            }}
          >
            <Plus className="h-4 w-4 mr-1 icon-secondary" />
            추가
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 h-full p-4">
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
        <Card className="m-5 bg-gradient-to-br bg-card-yellow-bg dark:bg-card-yellow-bg dark:border-none dark:card-shadow">
          <CardContent className="p-4">
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
      <Tabs value={activeFilter} onValueChange={setActiveFilter} className="space-y-4 flex flex-col items-center">
        <TabsList className="w-[413px] h-[40px] flex">
          <TabsTrigger className="flex-1" value="today" >
            오늘
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="all">
            전체
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="recommended">
            추천
          </TabsTrigger>
        </TabsList>
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
                {todayRoutines.map((routine, index) => renderRoutineCard(routine, index, index === todayRoutines.length - 1))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
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
                {allRoutines.map((routine, index) => renderRoutineCard(routine, index, index === allRoutines.length - 1))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
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
                {recommendedRoutines.map((routine, index) => renderRecommendedCard(routine, index, index === recommendedRoutines.length - 1))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}