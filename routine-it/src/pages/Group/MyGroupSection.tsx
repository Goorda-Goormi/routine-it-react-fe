import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Plus, Users, Crown, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { Group,AlarmTime } from '../../interfaces';

interface MyGroupsSectionProps {
  myGroups: Group[];
  onNavigate: (screen: string, params?: any) => void;
  onNewGroup: () => void;
}

const categories = [
  { id: 'all', name: '전체' },
  { id: 'health', name: '건강' },
  { id: 'exercise', name: '운동' },
  { id: 'study', name: '학습' },
  { id: 'lifestyle', name: '생활' },
  { id: 'hobby', name: '취미' },
];
const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || categoryId;
const getCategoryEmoji = (categoryId: string) => {
  switch (categoryId) {
    case 'health': return '🏥';
    case 'exercise': return '💪';
    case 'study': return '📚';
    case 'lifestyle': return '🏠';
    case 'hobby': return '🎨';
    default: return '📋';
  }
};

export function MyGroupsSection({ myGroups, onNavigate, onNewGroup }: MyGroupsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  
 // const hasMore = myGroups.length > 2 && !showAll;
   const sortedGroups = [...myGroups].sort((a, b) => b.groupId - a.groupId);
  const groupsToShow = showAll ? sortedGroups : sortedGroups.slice(0, 2); // 2개씩 표시
   return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-card-foreground">참여 중인 그룹</CardTitle>
          <Button variant="outline" size="sm" onClick={onNewGroup} className="text-card-foreground border-border hover:bg-accent hover:text-card-foreground">
            <Plus className="h-4 w-4 mr-1 icon-secondary" />
            그룹 생성
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {myGroups.length > 0 ? (
          <div className="max-h-64 overflow-y-auto scrollbar-hide">
            <div className="space-y-0">
              {groupsToShow.map((group, index) => (
                <div key={group.groupId} className={`${index < groupsToShow.length - 1 ? 'border-b border-border/30' : ''}`}>
                  <div className="p-5 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => onNavigate('group-detail', group)}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2 flex-1">
                         {group.groupImageUrl && (
                            <div className="w-8 h-8 rounded-full overflow-hidden mr-2 border border-[var(--color-border-bottom-custom)] dark:border-white">
                              <img
                                src={group.groupImageUrl}
                                alt={group.groupName}
                                className="w-full h-full object-contain p-1"
                              />
                            </div>
                          )}  
                        <span className="text-sm font-medium text-card-foreground">{group.groupName}</span>
                        {group.isOwner && <Crown className="h-3 w-3 text-yellow-400 icon-accent" />}
                        <Badge variant={group.groupType === 'REQUIRED' ? 'destructive' : 'secondary'} className="text-xs">
                          {group.groupType === 'REQUIRED' ? '의무참여' : '자유참여'}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="p-1 h-auto text-card-foreground hover:text-card-foreground" onClick={(e) => { e.stopPropagation(); onNavigate('group-chat', group); }}>
                        <MessageCircle className="h-4 w-4 icon-secondary" />
                      </Button>
                    </div>
                    <p className="text-xs text-left text-muted-foreground mb-2">{group.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{getCategoryEmoji(group.category)} {getCategoryName(group.category)}</span>
                      <span>👥 {group.currentMemberCount}명</span>
                      <span>⏰ {group.alarmTime.slice(0, 5)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 icon-muted mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">참여 중인 그룹이 없습니다</p>
            <Button onClick={onNewGroup} size="sm">
              <Plus className="h-4 w-4  icon-primary" />
              첫 그룹 만들기
            </Button>
          </div>
        )}
        {myGroups.length > 2 && (
          <div className="flex justify-center mt-4">
            <Button variant="ghost" className="text-sm text-muted-foreground" onClick={() => setShowAll(!showAll)}>
              {showAll ? '간략히 보기' : '더보기'}
              {showAll ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}