import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { ArrowLeft, Save } from 'lucide-react';

interface CreateRoutineScreenProps {
  onBack: () => void;
}

export function CreateRoutineScreen({ onBack }: CreateRoutineScreenProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    time: '',
    frequency: '매일',
    reminder: true,
    goal: '30'
  });

  const handleSave = () => {
    // 루틴 저장 로직
    console.log('루틴 저장:', formData);
    onBack();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <Label htmlFor="name">루틴 이름</Label>
              <Input
                id="name"
                placeholder="예: 아침 운동, 독서, 물 마시기"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="description">설명 (선택)</Label>
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base">시간 설정</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <Label htmlFor="time">시간</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="frequency">반복 주기</Label>
              <Select 
                value={formData.frequency} 
                onValueChange={(value) => setFormData({...formData, frequency: value})}
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
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">알림 설정</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <Label>알림 켜기</Label>
                <p className="text-sm text-muted-foreground">설정한 시간에 알림을 받습니다</p>
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base">목표 설정</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div>
              <Label htmlFor="goal">목표 연속일</Label>
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
                  <SelectItem value="66">66일 (습관 형성)</SelectItem>
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