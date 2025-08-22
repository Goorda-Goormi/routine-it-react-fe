import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { ArrowLeft, Clock, Users, Target, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface CreateGroupScreenProps {
  onBack: () => void;
  group?: any; // 편집 모드일 때 기존 그룹 데이터
}

export function CreateGroupScreen({ onBack, group }: CreateGroupScreenProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    type: 'optional', // 'optional' 또는 'mandatory'
    hasAlarm: false,
    alarmTime: '09:00',
    maxMembers: '30'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

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

  // 편집 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        category: group.category || '',
        type: group.type === '의무참여' ? 'mandatory' : 'optional',
        hasAlarm: group.alarmTime ? true : false,
        alarmTime: group.alarmTime || '09:00',
        maxMembers: group.maxMembers?.toString() || '30'
      });
    }
  }, [group]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

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

    const maxMembers = parseInt(formData.maxMembers);
    if (isNaN(maxMembers) || maxMembers < 2 || maxMembers > 50) {
      newErrors.maxMembers = '최대 인원은 2명~50명 사이로 설정해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const groupData = {
      ...formData,
      type: formData.type === 'mandatory' ? '의무참여' : '자유참여',
      alarmTime: formData.hasAlarm ? formData.alarmTime : null,
      maxMembers: parseInt(formData.maxMembers)
    };

    console.log(group ? '그룹 수정:' : '그룹 생성:', groupData);
    
    // 실제로는 API 호출
    onBack();
  };

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
            {group ? '그룹 편집' : '새 그룹 만들기'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {group ? '그룹 정보를 수정하세요' : '함께할 그룹을 만들어보세요'}
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
                onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                onChange={(e) => setFormData({...formData, description: e.target.value})}
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
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
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
                onValueChange={(value) => setFormData({...formData, type: value})}
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
              <Select value={formData.maxMembers} onValueChange={(value) => setFormData({...formData, maxMembers: value})}>
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
                onCheckedChange={(checked) => setFormData({...formData, hasAlarm: checked})}
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
                  onChange={(e) => setFormData({...formData, alarmTime: e.target.value})}
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
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{getCategoryEmoji(formData.category)} {getCategoryName(formData.category)}</span>
                  <span>👥 최대 {formData.maxMembers}명</span>
                  {formData.hasAlarm && <span>⏰ {formData.alarmTime}</span>}
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
            {group ? '수정하기' : '그룹 만들기'}
          </Button>
        </div>
      </div>
    </div>
  );
}