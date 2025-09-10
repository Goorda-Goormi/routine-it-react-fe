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
import type { Group } from '../../interfaces';

interface CreateGroupScreenProps {
  onBack: () => void;
  onCreateGroup: (groupData: any) => void;
}

const categories = [
  {
    id: 'health',
    name: '건강',
    emoji: '🏥',
    description: '건강 관련 습관들',
    hoverColor: 'hover:bg-red-100/70 hover:text-red-800 hover:border-red-300/50',
  },
  {
    id: 'exercise',
    name: '운동',
    emoji: '💪',
    description: '운동과 피트니스',
    hoverColor: 'hover:bg-orange-100/70 hover:text-orange-800 hover:border-orange-300/50',
  },
  {
    id: 'study',
    name: '학습',
    emoji: '📚',
    description: '공부와 자기계발',
    hoverColor: 'hover:bg-blue-100/70 hover:text-blue-800 hover:border-blue-300/50',
  },
  {
    id: 'lifestyle',
    name: '생활',
    emoji: '🏠',
    description: '일상 생활 습관',
    hoverColor: 'hover:bg-green-100/70 hover:text-green-800 hover:border-green-300/50',
  },
  {
    id: 'hobby',
    name: '취미',
    emoji: '🎨',
    description: '취미와 여가 활동',
    hoverColor: 'hover:bg-purple-100/70 hover:text-purple-800 hover:border-purple-300/50',
  },
];

export function CreateGroupScreen({ onBack, onCreateGroup }: CreateGroupScreenProps) {
  const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];
  const [formData, setFormData] = useState({
    groupName: '',
    groupDescription: '',
    category: '',
    groupType: 'FREE' as 'FREE' | 'REQUIRED',
    alarmTime: '09:00',
    maxMembers: 30,
    authDays: [] as string[],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleDayToggle = (day: string) => {
    setFormData((prevData) => {
      const isSelected = prevData.authDays.includes(day);
      const newSelectedDays = isSelected
        ? prevData.authDays.filter((d) => d !== day)
        : [...prevData.authDays, day].sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));
      return { ...prevData, authDays: newSelectedDays };
    });
  };

  const getFrequencyText = () => {
    if (formData.authDays.length === 0) return '요일 선택';
    if (formData.authDays.length === 7) return '매일';
    if (['토', '일'].every((day) => formData.authDays.includes(day)) && formData.authDays.length === 2) {
      return '주말';
    }
    if (['월', '화', '수', '목', '금'].every((day) => formData.authDays.includes(day)) && formData.authDays.length === 5) {
      return '평일';
    }
    return formData.authDays.join(', ');
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.groupName.trim()) {
      newErrors.groupName = '그룹 이름을 입력해주세요';
    } else if (formData.groupName.length > 30) {
      newErrors.groupName = '그룹 이름은 30자 이내로 입력해주세요';
    }

    if (!formData.groupDescription.trim()) {
      newErrors.groupDescription = '그룹 설명을 입력해주세요';
    } else if (formData.groupDescription.length > 100) {
      newErrors.groupDescription = '그룹 설명은 100자 이내로 입력해주세요';
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요';
    }

    if (formData.authDays.length === 0) {
      newErrors.authDays = '반복 주기를 1개 이상 선택해주세요';
    }

    const maxMembers = parseInt(formData.maxMembers.toString(), 10);
    if (isNaN(maxMembers) || maxMembers < 2 || maxMembers > 50) {
      newErrors.maxMembers = '최대 인원은 2명~50명 사이로 설정해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('그룹 생성을 위해서는 로그인이 필요합니다.');
      return;
    }

    const authDays = convertDaysToBinary(formData.authDays);

    const payload: GroupRequest = {
      groupName: formData.groupName,
      groupDescription: formData.groupDescription,
      groupType: formData.groupType,
      alarmTime: formData.alarmTime,
      authDays,
      category: formData.category,
      imageUrl: './default.png',
      maxMembers: parseInt(formData.maxMembers.toString(), 10),
    };

    console.log('API로 전송되는 Payload:', payload);
    console.log('사용할 토큰:', token);

    try {
      const createdGroup = await createGroup(payload);
      onCreateGroup(createdGroup);
    } catch (e) {
      console.error('그룹 생성 실패 오류:', e);
      alert('그룹 생성에 실패했습니다.');
    }
  };

  function convertDaysToBinary(days: string[]) {
    const order = ['월', '화', '수', '목', '금', '토', '일'];
    return order.map((d) => (days.includes(d) ? '1' : '0')).join('');
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : '';
  };

  const getCategoryEmoji = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
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
          <h1 className="text-lg font-medium text-card-foreground">새 그룹 만들기</h1>
          <p className="text-sm text-muted-foreground">함께할 그룹을 만들어보세요</p>
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
              <Label htmlFor="groupName" className="text-card-foreground">
                그룹 이름
              </Label>
              <Input
                id="groupName"
                placeholder="그룹 이름을 입력하세요"
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                className={`bg-input-background border-border text-foreground ${
                  errors.groupName ? 'border-destructive' : ''
                }`}
                maxLength={30}
              />
              {errors.groupName && <p className="text-xs text-destructive">{errors.groupName}</p>}
              <div className="text-xs text-muted-foreground text-right">{formData.groupName.length}/30</div>
            </div>

            {/* 그룹 설명 */}
            <div className="space-y-2">
              <Label htmlFor="groupDescription" className="text-card-foreground">
                그룹 설명
              </Label>
              <Textarea
                id="groupDescription"
                placeholder="그룹에 대한 설명을 입력하세요"
                value={formData.groupDescription}
                onChange={(e) => setFormData({ ...formData, groupDescription: e.target.value })}
                className={`bg-input-background border-border text-foreground resize-none h-20 ${
                  errors.groupDescription ? 'border-destructive' : ''
                }`}
                maxLength={100}
              />
              {errors.groupDescription && <p className="text-xs text-destructive">{errors.groupDescription}</p>}
              <div className="text-xs text-muted-foreground text-right">{formData.groupDescription.length}/100</div>
            </div>

            {/* 카테고리 */}
            <div className="space-y-2">
              <Label className="text-card-foreground">카테고리</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger
                  className={`bg-input-background border-border text-foreground ${
                    errors.category ? 'border-destructive' : ''
                  }`}
                >
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
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>
          </CardContent>
        </Card>

        {/* 루틴 정보 */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-card-foreground flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 icon-accent" />
              <span>루틴 정보</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 알림 시간 */}
            <div className="space-y-2">
              <Label htmlFor="alarmTime" className="text-card-foreground">
                알림 시간
              </Label>
              <Input
                id="alarmTime"
                type="time"
                value={formData.alarmTime}
                onChange={(e) => setFormData({ ...formData, alarmTime: e.target.value })}
                className="bg-input-background border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">매일 알림을 받을 시간을 설정해주세요.</p>
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
                    variant={formData.authDays.includes(day) ? 'default' : 'outline'}
                    onClick={() => handleDayToggle(day)}
                    className={`w-10 h-10 rounded-full text-card-foreground ${
                      formData.authDays.includes(day)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border-border'
                    } hover:bg-accent hover:text-card-foreground`}
                  >
                    {day}
                  </Button>
                ))}
              </div>
              {errors.authDays && <p className="text-xs text-destructive">{errors.authDays}</p>}
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
                value={formData.groupType}
                onValueChange={(value) => setFormData({ ...formData, groupType: value })}
                className="space-y-3"
              >
                <Label
                  htmlFor="optional"
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-green-100/70 hover:text-green-800 hover:border-green-300/50 cursor-pointer transition-colors"
                >
                  <RadioGroupItem value="FREE" id="optional" className="mt-1" />
                  <div className="flex flex-1 items-start justify-between">
                    <div className="flex flex-col items-start">
                      <div className="text-card-foreground font-medium">자유참여</div>
                      <p className="text-xs text-muted-foreground mt-1">언제든 자유롭게 참여할 수 있습니다</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      추천
                    </Badge>
                  </div>
                </Label>

                <Label
                  htmlFor="mandatory"
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-red-100/70 hover:text-red-800 hover:border-red-300/50 cursor-pointer transition-colors"
                >
                  <RadioGroupItem value="REQUIRED" id="mandatory" className="mt-1" />
                  <div className="flex flex-1 items-start justify-between">
                    <div className="flex flex-col items-start">
                      <div className="text-card-foreground font-medium">의무참여</div>
                      <p className="text-xs text-muted-foreground mt-1">정해진 시간에 반드시 참여해야 합니다</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      엄격
                    </Badge>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {/* 최대 인원 */}
            <div className="space-y-2">
              <Label htmlFor="maxMembers" className="text-card-foreground">
                최대 인원
              </Label>
              <Select
                value={String(formData.maxMembers)}
                onValueChange={(value) => setFormData({ ...formData, maxMembers: parseInt(value, 10) })}
              >
                <SelectTrigger
                  className={`bg-input-background border-border text-foreground ${
                    errors.maxMembers ? 'border-destructive' : ''
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10명</SelectItem>
                  <SelectItem value="20">20명</SelectItem>
                  <SelectItem value="30">30명</SelectItem>
                  <SelectItem value="50">50명</SelectItem>
                </SelectContent>
              </Select>
              {errors.maxMembers && <p className="text-xs text-destructive">{errors.maxMembers}</p>}
            </div>
          </CardContent>
        </Card>

        {/* 미리보기 */}
        {formData.groupName && formData.category && (
          <Card className="shadow-none border-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-card-foreground font-semibold">미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl border-2 border-primary/20 bg-background/50 shadow-sm transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-card-foreground">{formData.groupName}</span>
                    <Badge
                      variant={formData.groupType === 'REQUIRED' ? 'destructive' : 'secondary'}
                      className="text-xs px-2 py-0.5 rounded-full font-normal"
                    >
                      {formData.groupType === 'REQUIRED' ? '의무참여' : '자유참여'}
                    </Badge>
                  </div>
                </div>
                {formData.groupDescription && (
                  <p className="text-sm text-muted-foreground mb-2">{formData.groupDescription}</p>
                )}
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <span>{getCategoryEmoji(formData.category)}</span>
                    <span className="font-medium">{getCategoryName(formData.category)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>최대 {formData.maxMembers}명</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formData.alarmTime}</span>
                  </span>
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
            {formData.groupType === 'REQUIRED' && ' 의무참여 그룹은 멤버들이 정해진 시간에 참여해야 합니다.'}
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