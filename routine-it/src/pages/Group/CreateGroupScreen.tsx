import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Clock, Users, Target, AlertCircle, CheckSquare } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { createGroup, type GroupRequest } from '../../api/group';

interface CreateGroupScreenProps {
  onBack: () => void;
  onCreateGroup: (groupData: any) => void;
}

export function CreateGroupScreen({ onBack, onCreateGroup }: CreateGroupScreenProps) {
  // 루틴 관련 필드 추가
  const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category: string;
    difficulty: string;
    time: string;
    selectedDays: string[]; 
    type: string;
    hasAlarm: boolean;
    alarmTime: string;
    maxMembers: string;
  }>({
    name: '',
    description: '',
    category: '',
    difficulty: '쉬움', // 난이도 기본값
    time: '09:00', // 시간 기본값
    selectedDays: [], // 선택된 요일
    type: 'optional',
    hasAlarm: false,
    alarmTime: '09:00',
    maxMembers: '30'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const categories = [
    {
      id: 'health',
      name: '건강',
      emoji: '🏥',
      description: '건강 관련 습관들',
      hoverColor: 'hover:bg-red-100/70 hover:text-red-800 hover:border-red-300/50'
    },
    {
      id: 'exercise',
      name: '운동',
      emoji: '💪',
      description: '운동과 피트니스',
      hoverColor: 'hover:bg-orange-100/70 hover:text-orange-800 hover:border-orange-300/50'
    },
    {
      id: 'study',
      name: '학습',
      emoji: '📚',
      description: '공부와 자기계발',
      hoverColor: 'hover:bg-blue-100/70 hover:text-blue-800 hover:border-blue-300/50'
    },
    {
      id: 'lifestyle',
      name: '생활',
      emoji: '🏠',
      description: '일상 생활 습관',
      hoverColor: 'hover:bg-green-100/70 hover:text-green-800 hover:border-green-300/50'
    },
    {
      id: 'hobby',
      name: '취미',
      emoji: '🎨',
      description: '취미와 여가 활동',
      hoverColor: 'hover:bg-purple-100/70 hover:text-purple-800 hover:border-purple-300/50'
    }
  ];

  const handleDayToggle = (day: string) => {
    setFormData(prevData => {
      const isSelected = prevData.selectedDays.includes(day);
      const newSelectedDays = isSelected
        ? prevData.selectedDays.filter(d => d !== day)
        : [...prevData.selectedDays, day].sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));
      return { ...prevData, selectedDays: newSelectedDays };
    });
  };

  const getFrequencyText = () => {
    if (formData.selectedDays.length === 0) return '요일 선택';
    if (formData.selectedDays.length === 7) return '매일';
    if (['토', '일'].every(day => formData.selectedDays.includes(day)) && formData.selectedDays.length === 2) {
      return '주말';
    }
    if (['월', '화', '수', '목', '금'].every(day => formData.selectedDays.includes(day)) && formData.selectedDays.length === 5) {
      return '평일';
    }
    return formData.selectedDays.join(', ');
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = '그룹 이름을 입력해주세요';
    } else if (formData.name.length > 30) {
      newErrors.name = '그룹 이름은 30자 이내로 입력해주세요';
    }

    if (!formData.description.trim()) {
      newErrors.description = '그룹 설명을 입력해주세요';
    } else if (formData.description.length > 100) {
      newErrors.description = '그룹 설명은 100자 이내로 입력해주세요';
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요';
    }

    if (!formData.difficulty) {
        newErrors.difficulty = '난이도를 선택해주세요';
    }
    
    if (formData.selectedDays.length === 0) {
        newErrors.selectedDays = '반복 주기를 1개 이상 선택해주세요';
    }

    const maxMembers = parseInt(formData.maxMembers);
    if (isNaN(maxMembers) || maxMembers < 2 || maxMembers > 50) {
      newErrors.maxMembers = '최대 인원은 2명~50명 사이로 설정해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async () => {
  if (!validateForm()) return;

  const [hour, minute] = formData.time.split(":").map(Number);

  //  리터럴 유니온 타입으로 확정
  const groupType: GroupRequest["groupType"] =
    formData.type === "mandatory" ? "REQUIRED" : "FREE";

  // ^[01]{7}$: 월(0)~일(6) 기준. 필요시 일요일 먼저로 바꿔도 됩니다.
  const authDays = convertDaysToBinary(formData.selectedDays);

  // API 요청 페이로드 구성
  const payload: GroupRequest = {
    groupName: formData.name,
    groupDescription: formData.description,
    groupType, 
    alarmTime: formData.hasAlarm
      ? { hour, minute, second: 0, nano: 0 }
      : { hour: 0, minute: 0, second: 0, nano: 0 },
    authDays,
    category: formData.category,
    imageUrl: "/default.png",
    maxMembers: parseInt(formData.maxMembers, 10),
  };

  try {
    const created = await createGroup(payload);
    onCreateGroup(created);
    onBack();
  } catch (e) {
    console.error(e);
    alert("그룹 생성에 실패했습니다.");
  }
};

// 월~일을 0~6으로 보고 선택된 요일을 '^[01]{7}$'로 변환
function convertDaysToBinary(days: string[]) {
  const order = ["월", "화", "수", "목", "금", "토", "일"];
  return order.map((d) => (days.includes(d) ? "1" : "0")).join("");
}

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  };

  const getCategoryEmoji = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.emoji : '📋';
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* 헤더 */}
      <div className="flex items-center space-x-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-card-foreground hover:text-card-foreground p-1"
        >
          <ArrowLeft className="h-5 w-5 text-icon-secondary dark:text-white" />
        </Button>
        <div>
          <h1 className="text-lg font-medium text-card-foreground">
            새 그룹 만들기
          </h1>
          <p className="text-sm text-muted-foreground">
            함께할 그룹을 만들어보세요
          </p>
        </div>
      </div>

      {/* 폼 영역 */}
      <div className="flex-1 overflow-auto space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-card-foreground flex items-center space-x-2">
              <Target className="h-4 w-4 icon-accent" />
              <span>기본 정보</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 그룹 이름 */}
            <div className="space-y-2">
              <Label htmlFor="groupName" className="text-card-foreground">그룹 이름</Label>
              <Input
                id="groupName"
                placeholder="그룹 이름을 입력하세요"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`bg-input-background border-border text-foreground ${errors.name ? 'border-destructive' : ''}`}
                maxLength={30}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
              <div className="text-xs text-muted-foreground text-right">
                {formData.name.length}/30
              </div>
            </div>

            {/* 그룹 설명 */}
            <div className="space-y-2">
              <Label htmlFor="groupDescription" className="text-card-foreground">그룹 설명</Label>
              <Textarea
                id="groupDescription"
                placeholder="그룹에 대한 설명을 입력하세요"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`bg-input-background border-border text-foreground resize-none h-20 ${errors.description ? 'border-destructive' : ''}`}
                maxLength={100}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
              <div className="text-xs text-muted-foreground text-right">
                {formData.description.length}/100
              </div>
            </div>

            {/* 카테고리 */}
            <div className="space-y-2">
              <Label className="text-card-foreground">카테고리</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className={`bg-input-background border-border text-foreground ${errors.category ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className={`transition-colors ${category.hoverColor}`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{category.emoji}</span>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-muted-foreground">{category.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category}</p>
              )}
            </div>
            
          </CardContent>
        </Card>

        {/* 루틴 정보 (새로 추가된 부분) */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-card-foreground flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 icon-accent" />
              <span>루틴 정보</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 난이도 선택 */}
            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-card-foreground">난이도</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value) => setFormData({...formData, difficulty: value})}
              >
                <SelectTrigger className={`bg-input-background border-border text-foreground ${errors.difficulty ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="난이도를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="쉬움">쉬움</SelectItem>
                  <SelectItem value="보통">보통</SelectItem>
                  <SelectItem value="어려움">어려움</SelectItem>
                </SelectContent>
              </Select>
              {errors.difficulty && (
                <p className="text-xs text-destructive">{errors.difficulty}</p>
              )}
            </div>

            {/* 시간 선택 */}
            <div className="space-y-2">
              <Label htmlFor="time" className="text-card-foreground">시간</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="bg-input-background border-border text-foreground"
              />
            </div>

            {/* 반복 주기 */}
            <div className="space-y-2">
              <Label className="text-card-foreground">
                반복 주기 <span className="text-sm text-muted-foreground ml-2">{getFrequencyText()}</span>
              </Label>
              <div className="flex flex-wrap gap-2 pt-2">
                {daysOfWeek.map((day) => (
                  <Button
                    key={day}
                    variant={formData.selectedDays.includes(day) ? 'default' : 'outline'}
                    onClick={() => handleDayToggle(day)}
                    className={`w-10 h-10 rounded-full text-card-foreground ${
                      formData.selectedDays.includes(day) ? 'bg-primary text-primary-foreground' : 'bg-background border-border'
                    } hover:bg-accent hover:text-card-foreground`}
                  >
                    {day}
                  </Button>
                ))}
              </div>
              {errors.selectedDays && (
                <p className="text-xs text-destructive">{errors.selectedDays}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 그룹 설정 */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-card-foreground flex items-center space-x-2">
              <Users className="h-4 w-4 icon-accent" />
              <span>그룹 설정</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 참여 유형 */}
            <div className="space-y-3">
              <Label className="text-card-foreground">참여 유형</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                className="space-y-3"
              >
                <Label
                  htmlFor="optional"
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-green-100/70 hover:text-green-800 hover:border-green-300/50 cursor-pointer transition-colors"
                >
                  <RadioGroupItem value="optional" id="optional" className="mt-1" />
                  <div className="flex flex-1 items-start justify-between">
                    <div className="flex flex-col items-start">
                      <div className="text-card-foreground font-medium">
                        자유참여
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        언제든 자유롭게 참여할 수 있습니다
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">추천</Badge>
                  </div>
                </Label>

                <Label
                  htmlFor="mandatory"
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-red-100/70 hover:text-red-800 hover:border-red-300/50 cursor-pointer transition-colors"
                >
                  <RadioGroupItem value="mandatory" id="mandatory" className="mt-1" />
                  <div className="flex flex-1 items-start justify-between">
                    <div className="flex flex-col items-start">
                      <div className="text-card-foreground font-medium">
                        의무참여
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        정해진 시간에 반드시 참여해야 합니다
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">엄격</Badge>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {/* 최대 인원 */}
            <div className="space-y-2">
              <Label htmlFor="maxMembers" className="text-card-foreground">최대 인원</Label>
              <Select value={formData.maxMembers} onValueChange={(value) => setFormData({ ...formData, maxMembers: value })}>
                <SelectTrigger className={`bg-input-background border-border text-foreground ${errors.maxMembers ? 'border-destructive' : ''}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10명</SelectItem>
                  <SelectItem value="20">20명</SelectItem>
                  <SelectItem value="30">30명</SelectItem>
                  <SelectItem value="50">50명</SelectItem>
                </SelectContent>
              </Select>
              {errors.maxMembers && (
                <p className="text-xs text-destructive">{errors.maxMembers}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-card-foreground flex items-center space-x-2">
              <Clock className="h-4 w-4 icon-accent" />
              <span>알림 설정</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 알림 켜기/끄기 */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-card-foreground font-medium">매일 알림</Label>
                <p className="text-xs text-muted-foreground">정해진 시간에 루틴 알림을 받습니다</p>
              </div>
              <Switch
                checked={formData.hasAlarm}
                onCheckedChange={(checked) => setFormData({ ...formData, hasAlarm: checked })}
              />
            </div>

            {/* 알림 시간 */}
            {formData.hasAlarm && (
              <div className="space-y-2">
                <Label htmlFor="alarmTime" className="text-card-foreground">알림 시간</Label>
                <Input
                  id="alarmTime"
                  type="time"
                  value={formData.alarmTime}
                  onChange={(e) => setFormData({ ...formData, alarmTime: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* 미리보기 */}
        {formData.name && formData.category && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-card-foreground">미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-card-foreground">{formData.name}</span>
                    <Badge variant={formData.type === 'mandatory' ? 'destructive' : 'secondary'} className="text-xs">
                      {formData.type === 'mandatory' ? '의무참여' : '자유참여'}
                    </Badge>
                  </div>
                </div>

                {formData.description && (
                  <p className="text-xs text-muted-foreground mb-2">{formData.description}</p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-y-1">
                  <span className="flex items-center gap-1">
                    {getCategoryEmoji(formData.category)} {getCategoryName(formData.category)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> 최대 {formData.maxMembers}명
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" /> {formData.difficulty}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formData.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3 h-3" /> {getFrequencyText()}
                  </span>
                  {formData.hasAlarm && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 알림: {formData.alarmTime}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 안내 메시지 */}
        <Alert>
          <AlertCircle className="h-4 w-4 icon-muted" />
          <AlertDescription className="text-xs">
            그룹을 생성한 후에도 설정을 변경할 수 있습니다.
            {formData.type === 'mandatory' && ' 의무참여 그룹은 멤버들이 정해진 시간에 참여해야 합니다.'}
          </AlertDescription>
        </Alert>
      </div>

      {/* 하단 버튼 */}
      <div className="pt-4 border-t border-border bg-background">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 text-card-foreground border-border hover:bg-accent hover:text-card-foreground"
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            그룹 만들기
          </Button>
        </div>
      </div>
    </div>
  );
}
