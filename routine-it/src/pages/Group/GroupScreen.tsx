import React from 'react';
import { Input } from '../../components/ui/input';
import { Search } from 'lucide-react';
import { MyGroupsSection } from './MyGroupSection';
import { AllGroupsSection } from './AllGroupSection';
import type { Group } from '../../interfaces'; // Group 인터페이스를 별도로 관리하는 것이 좋습니다.

interface GroupScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  groups: Group[]; // 전체 그룹 데이터
  myGroups: Group[]; // 내가 참여 중인 그룹 데이터
  onNewGroup: () => void;
  //onJoinGroup: (groupId: number) => void;
}

export function GroupScreen({ onNavigate, groups, myGroups, onNewGroup, onJoinGroup }: GroupScreenProps) {
  return (
    <div className="space-y-4 h-full p-4 overflow-y-auto scrollbar-hide">
      {/* 검색 바 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 icon-muted" />
        <Input
          placeholder="그룹 검색..."
          className="pl-10 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* 참여 중인 그룹 섹션 */}
      <MyGroupsSection
        myGroups={myGroups}
        onNavigate={onNavigate}
        onNewGroup={onNewGroup}
      />

      {/* 전체 그룹 섹션 */}
      <AllGroupsSection
        groups={groups}
        onNavigate={onNavigate}
        onJoinGroup={onJoinGroup}
      />
    </div>
  );
}