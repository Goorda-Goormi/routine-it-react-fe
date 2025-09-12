import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Clock, Users, Target, AlertCircle, Loader2 } from 'lucide-react';
import { updateGroup, type GroupRequest } from '../../../api/group';
import type { Group } from '../../../interfaces';

interface GroupEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (group: Group) => void;
  group: Group;
}

const categories = [
  { id: 'health', name: '건강', emoji: '🏥', description: '건강 관련 습관들', hoverColor: 'hover:bg-red-100/70 hover:text-red-800 hover:border-red-300/50' },
  { id: 'exercise', name: '운동', emoji: '💪', description: '운동과 피트니스', hoverColor: 'hover:bg-orange-100/70 hover:text-orange-800 hover:border-orange-300/50' },
  { id: 'study', name: '학습', emoji: '📚', description: '공부와 자기계발', hoverColor: 'hover:bg-blue-100/70 hover:text-blue-800 hover:border-blue-300/50' },
  { id: 'lifestyle', name: '생활', emoji: '🧺', description: '일상 생활 습관', hoverColor: 'hover:bg-green-100/70 hover:text-green-800 hover:border-green-300/50' },
  { id: 'hobby', name: '취미', emoji: '🎨', description: '취미와 여가 활동', hoverColor: 'hover:bg-purple-100/70 hover:text-purple-800 hover:border-purple-300/50' }
];

const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];

export default function GroupEdit({ open, onOpenChange, group, onSave }: GroupEditProps) {
  const [formData, setFormData] = useState({
    groupName: '',
    groupDescription: '',
    category: '',
    groupType: 'FREE',
    alarmTime: '09:00',
    maxMembers: 30,
    authDays: [] as string[],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (group) {
      const authDaysArray = group.authDays
        .split('')
        .map((val, index) => val === '1' ? daysOfWeek[index] : '')
        .filter(day => day !== '');

      setFormData({
        groupName: group.groupName || '',
        groupDescription: group.description || '',
        category: group.category || '',
        groupType: group.groupType || 'FREE',
        alarmTime: group.alarmTime ? group.alarmTime.slice(0, 5) : '09:00',
        maxMembers: group.maxMembers || 30,
        authDays: authDaysArray,
      });
      setErrors({});
      setSaveError(null);
    }
  }, [group, open]);

  const handleDayToggle = (day: string) => {
    setFormData(prev => {
      const isSelected = prev.authDays.includes(day);
      const newDays = isSelected
        ? prev.authDays.filter(d => d !== day)
        : [...prev.authDays, day].sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));
      return { ...prev, authDays: newDays };
    });
  };

  const getFrequencyText = () => {
    if (formData.authDays.length === 0) return '요일 선택';
    if (formData.authDays.length === 7) return '매일';
    if (['토', '일'].every(d => formData.authDays.includes(d)) && formData.authDays.length === 2) return '주말';
    if (['월', '화', '수', '목', '금'].every(d => formData.authDays.includes(d)) && formData.authDays.length === 5) return '평일';
    return formData.authDays.join(', ');
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.groupName.trim()) {
      newErrors.name = '그룹 이름을 입력해주세요';
    } else if (formData.groupName.length > 30) {
      newErrors.name = '그룹 이름은 30자 이내로 입력해주세요';
    }

    if (!formData.groupDescription.trim()) {
      newErrors.description = '그룹 설명을 입력해주세요';
    } else if (formData.groupDescription.length > 100) {
      newErrors.description = '그룹 설명은 100자 이내로 입력해주세요';
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요';
    }

    const maxMembers = Number(formData.maxMembers);
    if (isNaN(maxMembers) || maxMembers < 2 || maxMembers > 50) {
      newErrors.maxMembers = '최대 인원은 2명~50명 사이로 설정해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const authDaysString = daysOfWeek.map(day =>
      formData.authDays.includes(day) ? '1' : '0'
    ).join('');

    const payload: GroupRequest = {
      groupName: formData.groupName,
      groupDescription: formData.groupDescription,
      category: formData.category,
      groupType: formData.groupType as "FREE" | "REQUIRED",
      maxMembers: Number(formData.maxMembers),
      authDays: authDaysString,
      alarmTime: formData.alarmTime,
      imageUrl: group.groupImageUrl || ''
    };

    setIsSaving(true);
    setSaveError(null);

    try {
      if (!group.groupId) {
        throw new Error("그룹 ID가 없습니다.");
      }

      const updatedGroup = await updateGroup(group.groupId, payload);
      console.log("그룹 정보 수정 성공:", updatedGroup);
      onSave(updatedGroup);
      onOpenChange(false);
    } catch (error) {
      console.error("그룹 정보 수정 실패:", error);
      setSaveError("그룹 정보를 저장하는 데 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w max-w-lg h-[90vh] flex flex-col p-4 text-icon-secondary dark:text-white rounded-xl shadow-lg border">
        <DialogHeader className="p-4">
          <DialogTitle className="text-2xl font-bold">그룹 편집</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">그룹 정보를 수정하고 저장하세요</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-6">
          {saveError && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>오류 발생</AlertTitle>
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}
          <Card className="shadow-none border-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-card-foreground flex items-center space-x-2 font-semibold">
                <Target className="h-4 w-4 text-primary" />
                <span>기본 정보</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName" className="text-card-foreground">그룹 이름</Label>
                <Input
                  id="groupName"
                  placeholder="그룹 이름을 입력하세요"
                  value={formData.groupName}
                  onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                  className={`bg-input-background border-border text-foreground ${errors.name ? 'border-destructive' : ''}`}
                  maxLength={30}
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name}</p>
                )}
                <div className="text-xs text-muted-foreground text-right">
                  {formData.groupName.length}/30
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupDescription" className="text-card-foreground">그룹 설명</Label>
                <Textarea
                  id="groupDescription"
                  placeholder="그룹에 대한 설명을 입력하세요"
                  value={formData.groupDescription}
                  onChange={(e) => setFormData({ ...formData, groupDescription: e.target.value })}
                  className={`bg-input-background border-border text-foreground resize-none h-20 ${errors.description ? 'border-destructive' : ''}`}
                  maxLength={100}
                />
                {errors.description && (
                  <p className="text-xs text-destructive mt-1">{errors.description}</p>
                )}
                <div className="text-xs text-muted-foreground text-right">
                  {formData.groupDescription.length}/100
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">카테고리</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className={`bg-input-background border-border text-foreground ${errors.category ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg">
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className={`transition-colors rounded-md ${category.hoverColor}`}
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
                  <p className="text-xs text-destructive mt-1">{errors.category}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-card-foreground flex items-center space-x-2 font-semibold">
                <Clock className="h-4 w-4 text-primary" />
                <span>루틴 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 transition-opacity duration-300">
                <Label htmlFor="alarmTime" className="text-card-foreground">알림 시간</Label>
                <Input
                  id="alarmTime"
                  type="time"
                  value={formData.alarmTime}
                  onChange={(e) => setFormData({ ...formData, alarmTime: e.target.value })}
                  className={`bg-input-background border-border text-foreground ${errors.alarmTime ? 'border-destructive' : ''}`}
                />
                <p className="text-xs text-muted-foreground">매일 알림을 받을 시간을 설정해주세요.</p>
                {errors.alarmTime && (
                  <p className="text-xs text-destructive mt-1">{errors.alarmTime}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">반복 주기 <span className="ml-2 text-xs text-muted-foreground">{getFrequencyText()}</span></Label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {daysOfWeek.map(day => (
                    <Button
                      key={day}
                      variant={formData.authDays.includes(day) ? 'default' : 'outline'}
                      onClick={() => handleDayToggle(day)}
                      className="w-10 h-10 rounded-full font-bold"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-card-foreground flex items-center space-x-2 font-semibold">
                <Users className="h-4 w-4 text-primary" />
                <span>그룹 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-card-foreground font-medium">참여 유형</Label>
                <RadioGroup
                  value={formData.groupType}
                  onValueChange={(value) => setFormData({ ...formData, groupType: value as 'FREE' | 'REQUIRED' })}
                  className="space-y-3"
                >
                  <Label htmlFor="FREE" className="flex items-start space-x-3 p-3 rounded-xl border-2 hover:border-green-400 cursor-pointer transition-colors has-[input[data-state=checked]]:border-green-500">
                    <RadioGroupItem value="FREE" id="FREE" className="mt-1" />
                    <div className="flex flex-1 items-start justify-between">
                      <div className="flex flex-col items-start">
                        <div className="text-card-foreground font-medium">자유참여</div>
                        <p className="text-xs text-muted-foreground mt-1">언제든 자유롭게 참여할 수 있습니다</p>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-green-500 text-white rounded-full">추천</Badge>
                    </div>
                  </Label>
                  <Label htmlFor="REQUIRED" className="flex items-start space-x-3 p-3 rounded-xl border-2 hover:border-red-400 cursor-pointer transition-colors has-[input[data-state=checked]]:border-red-500">
                    <RadioGroupItem value="REQUIRED" id="REQUIRED" className="mt-1" />
                    <div className="flex flex-1 items-start justify-between">
                      <div className="flex flex-col items-start">
                        <div className="text-card-foreground font-medium">의무참여</div>
                        <p className="text-xs text-muted-foreground mt-1">정해진 시간에 반드시 참여해야 합니다</p>
                      </div>
                      <Badge variant="destructive" className="text-xs rounded-full">엄격</Badge>
                    </div>
                  </Label>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxMembers" className="text-card-foreground font-medium">최대 인원</Label>
                <Select value={formData.maxMembers.toString()} onValueChange={(value) => setFormData({ ...formData, maxMembers: parseInt(value) })}>
                  <SelectTrigger className={`bg-input-background border-border text-foreground ${errors.maxMembers ? 'border-destructive' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg">
                    <SelectItem value="10">10명</SelectItem>
                    <SelectItem value="20">20명</SelectItem>
                    <SelectItem value="30">30명</SelectItem>
                    <SelectItem value="50">50명</SelectItem>
                  </SelectContent>
                </Select>
                {errors.maxMembers && (
                  <p className="text-xs text-destructive mt-1">{errors.maxMembers}</p>
                )}
              </div>
            </CardContent>
          </Card>

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
                      <Badge variant={formData.groupType === 'REQUIRED' ? 'destructive' : 'secondary'} className="text-xs px-2 py-0.5 rounded-full font-normal">
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

          <Alert className="rounded-xl border-l-4 border-primary">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs text-muted-foreground">
              그룹을 편집한 후에도 언제든지 설정을 다시 변경할 수 있습니다.
              {formData.groupType === 'REQUIRED' && ' 의무참여 그룹은 멤버들이 정해진 시간에 참여해야 합니다.'}
            </AlertDescription>
          </Alert>
        </div>

        <div className="p-4 border-t border-border bg-background">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 text-card-foreground border-border hover:bg-accent hover:text-card-foreground"
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? '저장 중...' : '수정하기'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}