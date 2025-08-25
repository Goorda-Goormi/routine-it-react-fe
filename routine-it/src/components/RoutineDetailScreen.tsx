import React, { useState } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, Target, Calendar, Clock, Edit, Save, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';

interface RoutineDetailScreenProps {
  routine: any;
  onBack: () => void;
  onUpdateRoutine: (updatedRoutine: any) => void;
}

export function RoutineDetailScreen({ routine, onBack, onUpdateRoutine }: RoutineDetailScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRoutine, setEditedRoutine] = useState(routine);

  const [isCompleted, setIsCompleted] = useState(routine.completed);

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
      case '기타': return '📋';
      default: return '📋';
    }
  };

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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // App.tsx로 수정된 데이터를 전달하고 화면을 돌아갑니다.
    onUpdateRoutine(editedRoutine);
    setIsEditing(false);
    onBack();
  };

  const handleCancel = () => {
    setEditedRoutine(routine); // 변경사항 되돌리기
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    // TODO: 여기에 App.tsx로 루틴 삭제를 요청하는 로직 추가
    console.log(`루틴 삭제 요청: ${routine.name}`);
    onBack();
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-b-[var(--color-border-bottom-custom)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-1">
              <ArrowLeft className="h-5 w-5 text-icon-secondary dark:text-white" />
            </Button>
            <h1 className="font-bold text-primary">루틴 상세</h1>
          </div>
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground">
                <Save className="h-4 w-4 mr-1" />
                저장
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="p-1" onClick={handleEdit}>
                <Edit className="h-5 w-5 text-icon-secondary dark:text-white" />
              </Button>
              <Button variant="ghost" size="sm" className="p-1 text-red-500" onClick={handleDelete}>
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {!isEditing ? (
          // Read-only Mode
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground flex items-center space-x-2">
                <span className="text-xl">{getCategoryEmoji(routine.category)}</span>
                <span className="font-semibold text-xl">{routine.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <div className="flex items-center space-x-2 text-foreground">
                  <Badge 
                    variant="outline" 
                    className={`text-sm ${getDifficultyColor(routine.difficulty)}`}
                  >
                    {editedRoutine.difficulty}
                  </Badge>
                  <p>{routine.description}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <Clock className="h-4 w-4 text-icon-secondary" />
                  <span>시간: {routine.time || '설정되지 않음'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <Calendar className="h-4 w-4 text-icon-secondary" />
                  <span>반복 주기: {routine.frequency || '설정되지 않음'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <Target className="h-4 w-4 text-icon-secondary" />
                  <span>목표: {routine.goal || '설정되지 않음'}일 연속</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (// Editing Mode
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">루틴 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-name">루틴 이름</Label>
                <Input
                  id="edit-name"
                  value={editedRoutine.name}
                  onChange={(e) => setEditedRoutine({...editedRoutine, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-category">카테고리</Label>
                <Select 
                  value={editedRoutine.category} 
                  onValueChange={(value) => setEditedRoutine({...editedRoutine, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="운동">💪 운동</SelectItem>
                    <SelectItem value="건강">🏥 건강</SelectItem>
                    <SelectItem value="학습">📚 학습</SelectItem>
                    <SelectItem value="생활">🏠 생활</SelectItem>
                    <SelectItem value="기타">📋 기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-difficulty">난이도</Label>
                <Select 
                  value={editedRoutine.difficulty} 
                  onValueChange={(value) => setEditedRoutine({...editedRoutine, difficulty: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="쉬움">쉬움</SelectItem>
                    <SelectItem value="보통">보통</SelectItem>
                    <SelectItem value="어려움">어려움</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-description">설명</Label>
                <Textarea
                  id="edit-description"
                  value={editedRoutine.description}
                  onChange={(e) => setEditedRoutine({...editedRoutine, description: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="edit-time">시간</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={editedRoutine.time}
                  onChange={(e) => setEditedRoutine({...editedRoutine, time: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-frequency">반복 주기</Label>
                <Select 
                  value={editedRoutine.frequency} 
                  onValueChange={(value) => setEditedRoutine({...editedRoutine, frequency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="매일">매일</SelectItem>
                    <SelectItem value="주 3회">주 3회</SelectItem>
                    <SelectItem value="주 5회">주 5회</SelectItem>
                    <SelectItem value="주말">주말</SelectItem>
                    <SelectItem value="평일">평일</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-goal">목표 연속일</Label>
                <Select 
                  value={editedRoutine.goal} 
                  onValueChange={(value) => setEditedRoutine({...editedRoutine, goal: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">1주일 (7일)</SelectItem>
                    <SelectItem value="14">2주일 (14일)</SelectItem>
                    <SelectItem value="21">3주일 (21일)</SelectItem>
                    <SelectItem value="30">1개월 (30일)</SelectItem>
                    <SelectItem value="60">60일 (습관 형성)</SelectItem>
                    <SelectItem value="100">100일 도전</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="edit-reminder">알림 켜기</Label>
                <Switch
                  id="edit-reminder"
                  checked={editedRoutine.reminder}
                  onCheckedChange={(checked) => setEditedRoutine({...editedRoutine, reminder: checked})}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
          {/* 루틴 정보 */}
          /*<Card className="dark:card-shadow">
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

        {/* 이번 주 진행률 *//*}
        /*<Card className="dark:card-shadow">
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

        {/* 월간 통계 *//*}/*
        <Card className="dark:card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base text-primary">
              <TrendingUp className="h-4 w-4 icon-accent" />
              <span>12월 통계</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4">
              {/* 완료일 - 라이트모드: 옅은 노랑, 다크모드: 짙은 배경 *//*}
              <div className="text-center p-3 rounded-lg bg-yellow-100 border border-yellow-200/60 dark:bg-gray-800 dark:border-yellow-500/30 dark:card-shadow">
                <div className="text-lg font-bold text-yellow-800 dark:text-yellow-300">{monthlyStats.completedDays}</div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">완료일</div>
              </div>
              
              {/* 달성률 - 라이트모드: 옅은 초록, 다크모드: 짙은 배경 *//*}
              <div className="text-center p-3 rounded-lg bg-green-100 border border-green-200/60 dark:bg-gray-800 dark:border-green-500/30 dark:card-shadow">
                <div className="text-lg font-bold text-green-800 dark:text-green-300">
                  {Math.round((monthlyStats.completedDays / monthlyStats.totalDays) * 100)}%
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">달성률</div>
              </div>
              
              {/* 최장 연속 - 라이트모드: 옅은 아이보리, 다크모드: 짙은 배경 *//*}
              <div className="text-center p-3 rounded-lg bg-orange-100 border border-orange-200/60 dark:bg-gray-800 dark:border-orange-500/30 dark:card-shadow">
                <div className="text-lg font-bold text-orange-800 dark:text-orange-300">{monthlyStats.longestStreak}</div>
                <div className="text-xs text-orange-600 dark:text-orange-400">최장 연속</div>
              </div>
              
              {/* 현재 연속 - 라이트모드: 옅은 라벤더, 다크모드: 짙은 배경 *//*}
              <div className="text-center p-3 rounded-lg bg-purple-100 border border-purple-200/60 dark:bg-gray-800 dark:border-purple-500/30 dark:card-shadow">
                <div className="text-lg font-bold text-purple-800 dark:text-purple-300">{monthlyStats.currentStreak}</div>
                <div className="text-xs text-purple-600 dark:text-purple-400">현재 연속</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 목표 설정 *//*}
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
}*/