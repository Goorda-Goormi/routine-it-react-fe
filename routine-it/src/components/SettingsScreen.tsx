import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { ArrowLeft, Moon, Sun, Bell, Shield, Download, Trash2 } from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function SettingsScreen({ onBack, isDarkMode, onToggleDarkMode }: SettingsScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-1">
              <ArrowLeft className="h-8 w-8 text-icon-secondary dark:text-white" strokeWidth={3} />
            </Button>
            <h1 className="font-bold text-lg">설정</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* 테마 설정 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">테마</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isDarkMode ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <div className="font-medium">다크 모드</div>
                  <div className="text-sm text-muted-foreground">
                    {isDarkMode ? '어두운 테마가 적용됩니다' : '밝은 테마가 적용됩니다'}
                  </div>
                </div>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={onToggleDarkMode} />
            </div>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">알림</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">루틴 리마인더</div>
                  <div className="text-sm text-muted-foreground">설정한 시간에 알림을 받습니다</div>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">그룹 활동 알림</div>
                  <div className="text-sm text-muted-foreground">그룹 채팅 및 인증 알림</div>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* 개인정보 및 보안 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">개인정보 및 보안</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <Button variant="ghost" className="w-full justify-start p-3 h-auto">
              <Shield className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="text-left">
                <div className="font-medium">개인정보 처리방침</div>
                <div className="text-sm text-muted-foreground">개인정보 수집 및 이용 안내</div>
              </div>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start p-3 h-auto">
              <Download className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="text-left">
                <div className="font-medium">내 데이터 다운로드</div>
                <div className="text-sm text-muted-foreground">루틴 기록을 내보냅니다</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* 계정 관리 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">계정 관리</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="ghost" className="w-full justify-start p-3 h-auto text-destructive">
              <Trash2 className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">계정 삭제</div>
                <div className="text-sm text-muted-foreground">모든 데이터가 영구적으로 삭제됩니다</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* 앱 정보 */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="font-medium">루틴잇 v1.0.0</div>
              <div className="text-sm text-muted-foreground">
                더 나은 습관 형성을 위한 앱
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}