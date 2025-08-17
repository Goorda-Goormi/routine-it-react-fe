import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Flame, Calendar } from 'lucide-react';

interface AttendanceLevel {
  emoji: string;
  name: string;
  minDays: number;
  maxDays: number;
  color: string;
  bgColor: string;
}

const attendanceLevels: AttendanceLevel[] = [
  {
    emoji: '🌱',
    name: '새싹',
    minDays: 1,
    maxDays: 7,
    color: 'text-green-300',
    bgColor: 'bg-green-100/20 border border-green-200/30'
  },
  {
    emoji: '🌿',
    name: '성장',
    minDays: 8,
    maxDays: 21,
    color: 'text-green-200',
    bgColor: 'bg-green-100/30 border border-green-200/40'
  },
  {
    emoji: '🌸',
    name: '개화',
    minDays: 22,
    maxDays: 50,
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-100/20 border border-emerald-200/30'
  },
  {
    emoji: '🌳',
    name: '나무',
    minDays: 51,
    maxDays: 100,
    color: 'text-emerald-200',
    bgColor: 'bg-emerald-100/30 border border-emerald-200/40'
  },
  {
    emoji: '🍎',
    name: '열매',
    minDays: 101,
    maxDays: 200,
    color: 'text-teal-300',
    bgColor: 'bg-teal-100/20 border border-teal-200/30'
  },
  {
    emoji: '🌟',
    name: '전설',
    minDays: 201,
    maxDays: Infinity,
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-100/20 border border-yellow-200/30'
  }
];

export function getAttendanceLevel(streakDays: number): AttendanceLevel & { progress: number; nextLevel?: AttendanceLevel } {
  const currentLevel = attendanceLevels.find(level => 
    streakDays >= level.minDays && streakDays <= level.maxDays
  ) || attendanceLevels[0];

  const currentLevelIndex = attendanceLevels.indexOf(currentLevel);
  const nextLevel = currentLevelIndex < attendanceLevels.length - 1 
    ? attendanceLevels[currentLevelIndex + 1] 
    : undefined;

  let progress = 0;
  if (nextLevel) {
    const levelRange = currentLevel.maxDays - currentLevel.minDays + 1;
    const currentProgress = streakDays - currentLevel.minDays + 1;
    progress = (currentProgress / levelRange) * 100;
  } else {
    progress = 100; // 최고 레벨인 경우
  }

  return {
    ...currentLevel,
    progress,
    nextLevel
  };
}

interface AttendanceStreakProps {
  streakDays: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

export function AttendanceStreak({ 
  streakDays, 
  showProgress = true, 
  size = 'md',
  compact = false 
}: AttendanceStreakProps) {
  const levelInfo = getAttendanceLevel(streakDays);
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <span className={sizeClasses[size]}>{levelInfo.emoji}</span>
        <div className="flex items-center space-x-1">
          <Flame className="h-3 w-3 text-orange-400" />
          <span className="text-sm font-medium">{streakDays}일</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base">
          <Calendar className="h-4 w-4" />
          <span>연속 출석</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 현재 레벨 */}
          <div className={`${levelInfo.bgColor} rounded-lg p-4 text-center`}>
            <div className="flex flex-col items-center space-y-2">
              <span className={sizeClasses[size]}>{levelInfo.emoji}</span>
              <div>
                <Badge variant="secondary" className={`${levelInfo.color} mb-1`}>
                  {levelInfo.name}
                </Badge>
                <div className="flex items-center justify-center space-x-1">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span className="font-bold text-lg">{streakDays}일</span>
                </div>
              </div>
            </div>
          </div>

          {/* 진행률 */}
          {showProgress && levelInfo.nextLevel && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  다음 단계: {levelInfo.nextLevel.emoji} {levelInfo.nextLevel.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {levelInfo.nextLevel.minDays - streakDays}일 남음
                </span>
              </div>
              <Progress value={levelInfo.progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{levelInfo.minDays}일</span>
                <span>{levelInfo.maxDays === Infinity ? '∞' : levelInfo.maxDays}일</span>
              </div>
            </div>
          )}

          {/* 최고 레벨 달성 메시지 */}
          {!levelInfo.nextLevel && (
            <div className="text-center p-3 bg-gradient-to-r from-yellow-100/20 to-orange-100/20 border border-yellow-200/30 rounded-lg">
              <p className="text-sm font-medium text-yellow-300">
                🎉 최고 레벨 달성! 🎉
              </p>
              <p className="text-xs text-yellow-200 mt-1">
                당신은 진정한 루틴 마스터입니다!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AttendanceStreakMini({ streakDays }: { streakDays: number }) {
  const levelInfo = getAttendanceLevel(streakDays);
  
  return (
    <div className="flex items-center space-x-2 p-2 rounded-lg bg-accent/50 border border-accent">
      <span className="text-lg">{levelInfo.emoji}</span>
      <div className="flex items-center space-x-1">
        <Flame className="h-3 w-3 text-orange-400" />
        <span className="text-sm font-medium">{streakDays}일</span>
      </div>
      <Badge variant="secondary" className="text-xs">
        {levelInfo.name}
      </Badge>
    </div>
  );
}