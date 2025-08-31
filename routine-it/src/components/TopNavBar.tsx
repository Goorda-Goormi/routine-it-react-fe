import React, { useState } from 'react';
import { Search, Plus, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface TopNavBarProps {
  onSearch: (query: string) => void;
  onNewProject: () => void;
  onProfileMenuClick: (action: string) => void;
  userInfo: {
    avatar: string;
    name: string;
    nickname?: string;
  };
}

export function TopNavBar({ onSearch, onNewProject, onProfileMenuClick, userInfo }: TopNavBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  // 아바타의 첫 글자를 가져오는 함수
  const getInitial = (nickname?: string) => {
    return nickname ? nickname.charAt(0) : '';
  };

  return (
    <header className="bg-background border-b border-b-[var(--color-border-bottom-custom)] px-4 py-3">
      <div className="flex items-center justify-between">
        {/* 로고 및 앱 이름 */}
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <div className="h-5 w-5 bg-primary-foreground rounded-full flex items-center justify-center">
              <div className="h-2.5 w-2.5 bg-primary rounded-full"></div>
            </div>
          </div>
          <h1 className="text-lg font-semibold text-card-foreground">루틴잇</h1>
        </div>

        {/* 우측 버튼들 */}
        <div className="flex items-center space-x-2">
          {/* 새 프로젝트 버튼 */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNewProject}
            className="text-card-foreground hover:text-card-foreground hover:bg-accent/50"
          >
            <Plus className="h-4 w-4 icon-secondary" />
          </Button>

          {/* 프로필 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full p-1">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={userInfo.avatar} alt="프로필" />
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