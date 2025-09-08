import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { ArrowLeft, Save } from 'lucide-react';

interface NewRoutine {
  id: number;
  name: string;
  description: string;
  time: string;
  frequency: string[];
  reminder: boolean;
  goal: string;
  category: string;
  difficulty: string;
  completed: boolean;
  streak: number;
}

interface CreateRoutineScreenProps {
  onBack: () => void;
  onCreateRoutine: (newRoutineData: NewRoutine) => void;
}

export function CreateRoutineScreen({ onBack, onCreateRoutine }: CreateRoutineScreenProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    time: '08:00',
    frequency: '',
    reminder: true,
    goal: '30',
    category: '',
    difficulty: ''
  });

  const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];

// 선택된 요일들을 상태로 관리합니다.
const [selectedDays, setSelectedDays] = useState<string[]>([]);
const [errors, setErrors] = useState<{ [key: string]: string }>({});
const [isTimeEnabled, setIsTimeEnabled] = useState(false);

// 선택된 요일들을 기반으로 표시할 텍스트를 생성하는 함수입니다.
const getFrequencyText = () => {
  if (selectedDays.length === 7) {
    return '매일';
  }
  if (selectedDays.length === 2 && selectedDays.includes('토') && selectedDays.includes('일')) {
    return '주말';
  }
  if (selectedDays.length === 5 && selectedDays.every(day => ['월', '화', '수', '목', '금'].includes(day))) {
    return '평일';
  }
  return selectedDays.join(', ') || '요일 선택';
};

const handleDayToggle = (day: string) => {
  setSelectedDays((prev) => 
    prev.includes(day)
      ? prev.filter((d) => d !== day)
      : [...prev, day].sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b))
  );
};


  const handleSave = () => {
    // 유효성 검사 로직을 추가합니다.
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) {
      newErrors.name = '루틴 이름을 입력해주세요.';
    }
    if (selectedDays.length === 0) {
      newErrors.frequency = '하나 이상의 요일을 선택해주세요.';
    }
    if (!formData.time) {
      newErrors.time = '시간을 설정해주세요.';
    }
    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }
    if (!formData.difficulty) {
      newErrors.difficulty = '난이도를 선택해주세요.';
    }

    setErrors(newErrors);

    // 오류가 있으면 저장 로직을 중단합니다.
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const newRoutineData: NewRoutine = {
      id: Math.random(), // 임시 ID
      name: formData.name,
      description: formData.description,
      time: formData.time,
      frequency: selectedDays, // 선택된 요일 배열을 사용합니다.
      reminder: formData.reminder,
      goal: formData.goal,
      category: formData.category,
      difficulty: formData.difficulty,
      completed: false, // 새로운 루틴은 완료되지 않은 상태로 시작
      streak: 0, // 새로운 루틴은 연속일이 0으로 시작
    };

    onCreateRoutine(newRoutineData);
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
            <h1 className="font-bold">새 루틴 만들기</h1>
          </div>
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 기본 정보 */}
        <Card>
          <CardHeader className="pb-3 pl-3">
            <CardTitle className="text-base">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <Label className="pb-3 pl-3" htmlFor="name">루틴 이름</Label>
              <Input
                id="name"
                placeholder="루틴 이름을 입력하세요"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
            </div>
            
            {/* 카테고리 선택 추가 */}
            <div>
              <Label className="pb-3 pl-3" htmlFor="category">카테고리</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택하세요"  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="운동">💪 운동</SelectItem>
                  <SelectItem value="건강">🏥 건강</SelectItem>
                  <SelectItem value="학습">📚 학습</SelectItem>
                  <SelectItem value="생활">🏠 생활</SelectItem>
                  <SelectItem value="취미">🎨 취미</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-destructive text-sm mt-1">{errors.category}</p>}
            </div>

            {/* 난이도 선택 추가 */}
            <div>
              <Label className="pb-3 pl-3" htmlFor="difficulty">난이도</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value) => setFormData({...formData, difficulty: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="난이도를 선택하세요"  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="쉬움">쉬움</SelectItem>
                  <SelectItem value="보통">보통</SelectItem>
                  <SelectItem value="어려움">어려움</SelectItem>
                </SelectContent>
              </Select>
              {errors.difficulty && <p className="text-destructive text-sm mt-1">{errors.difficulty}</p>}
            </div>


            <div>
              <Label className="pb-3 pl-3" htmlFor="description">설명 (선택)</Label>
              <Textarea
                id="description"
                placeholder="루틴에 대한 간단한 설명을 적어주세요"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* 시간 설정 */}
        <Card>
          <CardHeader className="pb-3 pl-3">
            <CardTitle className="text-base">시간 설정</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <Label className="pb-3 pl-3" htmlFor="time">시간</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
              {errors.time && <p className="text-destructive text-sm mt-1">{errors.time}</p>}
            </div>
            
            <div>
              <Label className='pl-3' htmlFor="frequency">
                반복 주기 <span className="text-sm text-gray-500">{getFrequencyText()}</span>
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
              {errors.frequency && <p className="text-destructive text-sm mt-1 text-center">{errors.frequency}</p>}
            </div>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card>
          <CardHeader className="pb-3 pl-3">
            <CardTitle className="text-base">톡캘린더 설정</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <Label className="pb-3 pl-3">톡캘린더에 연결하기</Label>
                <p className="text-sm text-muted-foreground pl-3">설정한 루틴을 카카오로 확인해보세요</p>
              </div>
              <Switch
                checked={formData.reminder}
                onCheckedChange={(checked) => setFormData({...formData, reminder: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* 목표 설정 */}
        <Card>
          <CardHeader className="pb-3 pl-3">
            <CardTitle className="text-base">목표 설정</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div>
              <Label className="pb-3 pl-3" htmlFor="goal">목표 연속일</Label>
              <Select 
                value={formData.goal} 
                onValueChange={(value) => setFormData({...formData, goal: value})}
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
          </CardContent>
        </Card>

        {/* 하단 버튼 */}
        <div className="pt-4">
          <Button onClick={handleSave} className="w-full" size="lg">
            루틴 만들기
          </Button>
        </div>
      </div>
    </div>
  );
}