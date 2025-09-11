import React, { useState } from 'react';
import { Input } from '../../components/ui/input';
import { Search } from 'lucide-react';
import { MyGroupsSection } from './MyGroupSection';
import { AllGroupsSection } from './AllGroupSection';
import type { Group } from '../../interfaces';

interface GroupScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  groups: Group[];
  myGroups: Group[];
  onNewGroup: () => void;
  onJoinGroup: (groupId: number) => void;
}

export function GroupScreen({ onNavigate, groups, myGroups, onNewGroup, onJoinGroup }: GroupScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // group.name이 유효한 값인지 확인
  const filteredGroups = groups.filter(group =>
    (group.groupName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 h-full p-4 overflow-y-auto scrollbar-hide">
      {/* 검색 바 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 icon-muted" />
        <Input
          placeholder="그룹 검색..."
          className="pl-10 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
        groups={filteredGroups}
        onNavigate={onNavigate}
        onJoinGroup={onJoinGroup}
      />
    </div>
  );
}