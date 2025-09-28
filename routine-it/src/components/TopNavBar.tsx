import React, { useState } from 'react';
import { Search, ArrowLeft, Bell, Camera, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import type { PendingAuthMap, AuthMessage } from '../interfaces';

interface TopNavBarProps {
  onSearch: (query: string) => void;
  onNotificationClick: (notification: Notification) => void; 
  notifications: Notification[];
  onProfileMenuClick: (action: string) => void;
  userInfo: {
    profileImageUrl: string;
    nickname?: string;
  };
  showBackButton?: boolean;
  onBackClick?: () => void;  
}

// 알림 카테고리
type NotificationCategory = '홈' | '그룹' | '회고';

// 새 알림 타입 정의
export interface Notification {
  id: number;
  message: string;
  category: NotificationCategory;
  date: string;
  icon?: React.ReactNode; 
  read: boolean;
  relatedId?: number; // 그룹 ID 등 관련 정보
  fullContent?: string; 
  monthYear?: string;
  isLocal?: boolean;
}

export function TopNavBar({ onSearch, onNotificationClick, notifications, onProfileMenuClick, userInfo, showBackButton, onBackClick }: TopNavBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('홈');
  const [justReadId, setJustReadId] = useState<number | null>(null);
  const filteredNotifications = notifications.filter(
    (n) => {
      if (n.category !== activeCategory) return false;

      if (n.category === '회고') return true;
      
      return !n.read || n.id === justReadId;
    }
  );

  // 아바타의 첫 글자를 가져오는 함수
  const getInitial = (nickname?: string) => {
    return nickname ? nickname.charAt(0) : '';
  };

  return (
    <header className="bg-background border-b border-b-[var(--color-border-bottom-custom)] px-4 py-3">
      <div className="flex items-center justify-between">
        {/* 로고 및 앱 이름 */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBackClick}
              className="flex h-8 w-8 text-primary hover:text-primary p-1 mr-2"
            >
              <ArrowLeft className="h-5 w-5 icon-secondary" />
            </Button>
          )}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <div className="h-5 w-5 bg-primary-foreground rounded-full flex items-center justify-center">
              <div className="h-2.5 w-2.5 bg-primary rounded-full"></div>
            </div>
          </div>
          <h1 className="text-lg font-semibold text-card-foreground">루틴잇</h1>
        </div>
        </div>

        {/* 우측 버튼들 */}
        <div className="flex items-center space-x-2">
          {/* 알림 버튼 */}
          <DropdownMenu onOpenChange={(isOpen) => {
            // 메뉴가 닫힐 때(isOpen이 false일 때) 임시 ID를 초기화
            if (!isOpen) {
              setJustReadId(null);
            }
          }}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-card-foreground hover:text-card-foreground hover:bg-accent/50 relative"
              >
                <Bell className="h-5 w-5 icon-secondary" />
                 {/* 읽지 않은 알림이 있을 경우 빨간 점 표시 */}
                {notifications.some(n => !n.read) && (
                  <div className="absolute top-1 right-2 w-[4px] h-[4px] rounded-full bg-red-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[350px] h-[450px] p-0 flex">
              {/* 알림 카테고리 (좌측) */}
              <div className="w-1/4 h-full border-r border-border/60 bg-accent/30 flex flex-col items-center py-2">
                {['홈', '그룹', '회고'].map(category => (
                  <Button
                    key={category}
                    variant="ghost"
                    className={`w-full justify-start rounded-none px-4 py-3 text-sm font-medium ${
                      activeCategory === category ? 'bg-background' : 'hover:bg-accent'
                    }`}
                    onClick={() => setActiveCategory(category as NotificationCategory)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* 알림 목록 (우측) */}
              <div className="flex-1 overflow-y-auto p-4">
                <DropdownMenuLabel className="mb-2 text-base font-semibold">
                  {activeCategory} 알림
                </DropdownMenuLabel>
                <Separator className="mb-4" />
                {filteredNotifications.length > 0 ? (
                  <div className="space-y-3">
                    {filteredNotifications.map((note) => (
                      <DropdownMenuItem 
                        key={note.id} 
                        className={`p-3 h-auto items-start space-x-3 cursor-pointer transition-opacity ${
                          note.read ? 'opacity-50' : ''
                        }`}
                        
                        onSelect={(event) => {
                          event.preventDefault();
                          onNotificationClick(note);
                          if (!note.read) {
                            setJustReadId(note.id);
                          }
                        }}
                      >
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary-foreground/80">
                           {note.icon ? note.icon : <Bell className="h-4 w-4 icon-secondary" />}
                        </div>
                        <div className="flex-1 flex flex-col">
                           <p className="text-sm font-medium text-foreground leading-tight">{note.message}</p>
                           <p className="text-xs text-muted-foreground mt-1">{note.date}</p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground p-4">
                    새로운 알림이 없습니다.
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 프로필 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full p-1">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={userInfo.profileImageUrl} alt="프로필" />
                  <AvatarFallback className="text-xs">{getInitial(userInfo.nickname)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onProfileMenuClick('settings')}>
                <Settings className="mr-2 h-4 w-4 icon-muted" />
                설정
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onProfileMenuClick('help')}>
                <HelpCircle className="mr-2 h-4 w-4 icon-muted" />
                도움말
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onProfileMenuClick('logout')}>
                <LogOut className="mr-2 h-4 w-4 icon-muted" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}