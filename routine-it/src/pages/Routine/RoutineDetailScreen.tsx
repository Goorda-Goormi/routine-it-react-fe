import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Target, Calendar, Clock, Edit, Save, Trash2, X, Bell, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import type { Routine } from '../../interfaces';
import { CustomTimePicker } from '../../components/modules/TimePicker';

interface RoutineDetailScreenProps {
  routine: Routine;
  onBack: () => void;
  onUpdateRoutine: (updatedRoutine: Routine) => void;
  onDeleteRoutine: (routineId: number, isGroupRoutine?: boolean) => void;
  onTogglePublic: (routine: Routine) => void; 
  onToggleAlarm: (routine: Routine) => void; 
}

export function RoutineDetailScreen({ routine, onBack, onUpdateRoutine, onDeleteRoutine, onTogglePublic, onToggleAlarm }: RoutineDetailScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRoutine, setEditedRoutine] = useState(routine);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isTimeEnabled, setIsTimeEnabled] = useState(!!routine.time); 
  
  // 선택된 요일들을 상태로 관리합니다.
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const [selectedDays, setSelectedDays] = useState<string[]>(routine.frequency || []);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const timeValue = e.target.value;
  if (timeValue) {
    const [hour, minute] = timeValue.split(':').map(Number);
    const snappedMinute = Math.round(minute / 5) * 5;
    
    const formattedHour = String(hour).padStart(2, '0');
    const formattedMinute = String(snappedMinute % 60).padStart(2, '0');
    
    const newTime = `${formattedHour}:${formattedMinute}`;
    
    // 🔽 formData -> editedRoutine, setFormData -> setEditedRoutine 으로 수정
    setEditedRoutine({ ...editedRoutine, time: newTime });
  } else {
    setEditedRoutine({ ...editedRoutine, time: '' });
  }
};

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

  

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'health': return '🏥';
      case 'exercise': return '💪';
      case 'study': return '📚';
      case 'lifestyle': return '🏠';
      case 'hobby': return '🎨';
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
    const newErrors: { [key: string]: string } = {};

    if (!editedRoutine.name) {
        newErrors.name = '루틴 이름을 입력해주세요.';
    }
    if (selectedDays.length === 0) {
        newErrors.frequency = '하나 이상의 요일을 선택해주세요.';
    }
    if (!editedRoutine.time) {
        newErrors.time = '시간을 설정해주세요.';
    }
    if (!editedRoutine.category) {
        newErrors.category = '카테고리를 선택해주세요.';
    }
    

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
        return;
    }

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
    const isConfirmed = window.confirm("정말로 이 루틴을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.");
    if (isConfirmed) {
      onDeleteRoutine(routine.id, routine.isGroupRoutine);
    }
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
                <Save className="h-4 w-4 mr-1 " />
                저장
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancel} className='border-0'>
                <X className="h-4 w-4 mr-1 text-icon-secondary dark:text-white" />
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
                <span className="text-xl">{getCategoryEmoji(routine.category ?? '')}</span>
                <span className="font-semibold text-xl">{routine.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <div className="flex items-center space-x-2 text-foreground">
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
                  <span>반복 주기: {getFrequencyText(routine.frequency ?? [])}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <Target className="h-4 w-4 text-icon-secondary" />
                  <span>목표: {routine.goal || '설정되지 않음'}일 연속</span>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between text-sm text-foreground">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-icon-secondary" />
                    <span>알림</span>
                  </div>
                  <Switch
                    checked={!!routine.reminder}
                    onCheckedChange={() => onToggleAlarm(routine)}
                    
                  />
                </div>
                {!routine.isGroupRoutine && (
                  <div className="flex items-center justify-between text-sm text-foreground">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-icon-secondary" />
                      <span>루틴 공개</span>
                    </div>
                    <Switch
                      checked={!!routine.isPublic}
                      onCheckedChange={() => onTogglePublic(routine)}
                    />
                  </div>
                )}
                {/* <div className="flex items-center justify-between text-sm text-foreground">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-icon-secondary" />
                    <span>루틴 공개</span>
                  </div>
                  <Switch
                    checked={!!routine.isPublic}
                    onCheckedChange={() => onTogglePublic(routine)}
                   
                  />
                </div> */}
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
                  disabled={editedRoutine.isGroupRoutine}
                  aria-readonly={editedRoutine.isGroupRoutine}
                />
                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <Label htmlFor="edit-category">카테고리</Label>
                <Select 
                  value={editedRoutine.category} 
                  onValueChange={(value) => setEditedRoutine({...editedRoutine, category: value})}
                  disabled={editedRoutine.isGroupRoutine}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exercise">💪 운동</SelectItem>
                    <SelectItem value="health">🏥 건강</SelectItem>
                    <SelectItem value="study">📚 학습</SelectItem>
                    <SelectItem value="lifestyle">🏠 생활</SelectItem>
                    <SelectItem value="hobby">🎨 취미</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-destructive text-sm mt-1">{errors.category}</p>}
              </div>


              <div>
                <Label htmlFor="edit-description">설명</Label>
                <Textarea
                  id="edit-description"
                  value={editedRoutine.description}
                  onChange={(e) => setEditedRoutine({...editedRoutine, description: e.target.value})}
                  disabled={editedRoutine.isGroupRoutine}
                  aria-readonly={editedRoutine.isGroupRoutine}
                />
              </div>

              <div>
                <Label className="pb-3 pl-3" htmlFor="time">시간</Label>
                <CustomTimePicker
                  value={editedRoutine.time}
                  onChange={(newTime) => setEditedRoutine({ ...editedRoutine, time: newTime })}
                />
                {errors.time && <p className="text-destructive text-sm mt-1">{errors.time}</p>}
              </div>
              
              <div>
                <Label  htmlFor="frequency">
                  반복 주기 <span className="text-sm text-gray-500">{getFrequencyText(selectedDays)}</span>
                </Label>
                <div className="flex justify-center gap-5 pt-2">
                  {daysOfWeek.map((day) => (
                    <Button
                      key={day}
                      variant={selectedDays.includes(day) ? 'default' : 'outline'}
                      onClick={() => handleDayToggle(day)}
                      className={`w-10 h-10 rounded-full ${
                        selectedDays.includes(day) 
                        ? 'bg-primary text-primary-foreground' 
                          : 'bg-background border border-border'
                      }`}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
                {errors.frequency && <p className="text-destructive text-sm mt-1 text-center">{errors.frequency}</p>}
              </div>

              <div className='pt-3'>
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

              {/* <div className="flex items-center justify-between pt-1">
                <Label htmlFor="edit-reminder">톡캘린더 연결하기</Label>
                <Switch
                  id="edit-reminder"
                  checked={!!editedRoutine.reminder}
                  onCheckedChange={(checked) => setEditedRoutine({...editedRoutine, reminder: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="pb-3 pt-3">루틴 공개하기</Label>
                  <p className="text-sm text-muted-foreground pl-3">다른 사용자가 내 프로필에서 이 루틴을 볼 수 있도록 허용합니다.</p>
                </div>
                <Switch
                  checked={!!editedRoutine.isPublic}
                  onCheckedChange={(checked) => setEditedRoutine({...editedRoutine, isPublic: checked})}
                  disabled={editedRoutine.isGroupRoutine}
                />
              </div> */}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
         