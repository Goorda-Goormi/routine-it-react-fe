import React from 'react';
import { Home, Target, Users, Trophy, User } from 'lucide-react';

interface BottomTabNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomTabNav({ activeTab, onTabChange }: BottomTabNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: '홈' },
    { id: 'routine', icon: Target, label: '루틴' },
    { id: 'group', icon: Users, label: '그룹' },
    { id: 'ranking', icon: Trophy, label: '랭킹' },
    { id: 'mypage', icon: User, label: '마이페이지' }
  ];

  return (
    <nav className="w-full bg-background px-2 py-2 border-t border-t-[var(--color-border-bottom-custom)]">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1 ${
                activeTab === tab.id
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-accent/50'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${activeTab === tab.id ? 'icon-accent' : 'icon-muted'}`} />
              <span className="text-xs font-medium truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}