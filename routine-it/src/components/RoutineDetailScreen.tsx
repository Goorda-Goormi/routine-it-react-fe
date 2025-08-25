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

interface Routine {
  id: number;
  name: string;
  description?: string;
  time: string;
  frequency: string[]; // `string[]` 타입으로 수정
  reminder: boolean;
  goal: string;
  category: string;
  completed: boolean;
  streak: number;
  difficulty: string;
  isGroupRoutine?: boolean;
}

interface RoutineDetailScreenProps {
  routine: Routine;
  onBack: () => void;
  onUpdateRoutine: (updatedRoutine: Routine) => void;
}

export function RoutineDetailScreen({ routine, onBack, onUpdateRoutine }: RoutineDetailScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRoutine, setEditedRoutine] = useState(routine);
  
  // 선택된 요일들을 상태로 관리합니다.
  const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];
  const [selectedDays, setSelectedDays] = useState<string[]>(routine.frequency || []);

  const getFrequencyText = (frequencyArr: string[]) => {
    if (!Array.isArray(frequencyArr)) {
      return '설정되지 않음';
    }
    if (frequencyArr.length === 7) {
      return '매일';
    }
    if (frequencyArr.length === 2 && frequencyArr.includes('토') && frequencyArr.includes('일')) {
      return '주말';
    }
    if (frequencyArr.length === 5 && frequencyArr.every(day => ['월', '화', '수', '목', '금'].includes(day))) {
      return '평일';
    }
    return frequencyArr.join(', ') || '설정되지 않음';
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) => 
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b))
    );
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
      case '기타': return '📋';
      default: return '📋';
    }
  };

  // 가상의 통계 데이터
  const weeklyData = selectedDays.map(day => ({
    day,
    completed: true, // 임시로 true로 설정
  })) || [];

  const monthlyStats = {
    completedDays: 23,
    totalDays: 31,
    longestStreak: 12,
    currentStreak: editedRoutine.streak
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // App.tsx로 수정된 데이터를 전달하고 화면을 돌아갑니다.
    const updatedRoutine = { ...editedRoutine, frequency: selectedDays };
    onUpdateRoutine(updatedRoutine);
    setIsEditing(false);
    onBack();
  };

  const handleCancel = () => {
    setEditedRoutine(routine); // 변경사항 되돌리기
    setSelectedDays(routine.frequency || []); // 요일 선택도 되돌리기
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
                  <span>반복 주기: {getFrequencyText(routine.frequency)}</span>
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
                <Label className='pl-3' htmlFor="frequency">
                  반복 주기 <span className="text-sm text-gray-500">{getFrequencyText(selectedDays)}</span>
                </Label>
                <div className="flex justify-center gap-5 pt-2">
                  {daysOfWeek.map((day) => (
                    <Button
                      key={day}
                      variant={selectedDays.includes(day) ? 'default' : 'outline'}
                      onClick={() => handleDayToggle(day)}
                      className={`w-10 h-10 rounded-full ${
                        selectedDays.includes(day) ? 'bg-primary text-white' : ''
                      }`}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
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
         