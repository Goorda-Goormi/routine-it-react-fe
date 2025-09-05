import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Search as SearchIcon, ChevronDown, ChevronUp } from 'lucide-react';
import type { Group } from '../../interfaces';

interface AllGroupsSectionProps {
  groups: Group[];
  onNavigate: (screen: string, params?: any) => void;
  onJoinGroup: (groupId: number) => void;
}

const categories = [
  { id: 'all', name: '전체', hoverColor: 'hover:bg-gray-100/70 hover:text-gray-800' },
  { id: 'health', name: '건강', hoverColor: 'hover:bg-red-100/70 hover:text-red-800' },
  { id: 'exercise', name: '운동', hoverColor: 'hover:bg-orange-100/70 hover:text-orange-800' },
  { id: 'study', name: '학습', hoverColor: 'hover:bg-blue-100/70 hover:text-blue-800' },
  { id: 'lifestyle', name: '생활', hoverColor: 'hover:bg-green-100/70 hover:text-green-800' },
  { id: 'hobby', name: '취미', hoverColor: 'hover:bg-purple-100/70 hover:text-purple-800' },
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

const GroupCard = ({ group, onNavigate, onJoinGroup }: { group: Group, onNavigate: any, onJoinGroup: any }) => (
  <div className="p-5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => onNavigate('group-detail', group)}>
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center space-x-2 flex-1">
         {group.groupImageUrl && (
          <img 
            src={group.groupImageUrl} 
            alt={group.groupName} 
            className="w-8 h-8 rounded-full object-cover mr-2 " 
          />
        )}
        
        <span className="text-sm font-medium text-card-foreground">{group.groupName}</span>
        <Badge variant={group.groupType === 'REQUIRED' ? 'destructive' : 'secondary'} className="text-xs">
          {group.groupType === 'REQUIRED' ? '의무참여' : '자유참여'}
        </Badge>
      </div>
      <Button size="sm" variant="outline" 
        onClick={(e) => {e.stopPropagation(); onJoinGroup(group.groupId);}} 
        className="text-card-foreground border-border hover:bg-accent hover:text-card-foreground text-xs px-2 py-1"
        >
        참여하기
      </Button>
    </div>
    <p className="text-xs text-left text-muted-foreground mb-2">{group.groupDescription}</p>
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>{getCategoryEmoji(group.category)} {getCategoryName(group.category)}</span>
      <span>👥 {group.currentMemberCount}명</span>
      <span>⏰ {group.alarmTime.slice(0, 5)}</span>
    </div>
  </div>
);

export function AllGroupsSection({ groups, onNavigate, onJoinGroup }: AllGroupsSectionProps) {
  const [visibleCount, setVisibleCount] = useState(2); // 초기값 2로 변경
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const sortedGroups = [...groups].sort((a, b) => b.groupId - a.groupId);
  /*const filteredGroups = sortedGroups.filter(group => {
    const matchesType = selectedType === 'all' || group.groupType  === 'REQUIRED' ? '의무참여' : '자유참여';
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    return matchesType && matchesCategory;
  });*/
  const filteredGroups = sortedGroups.filter(group => {
  // 카테고리 필터링
  const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;

  // 타입 필터링
  const matchesType = 
    selectedType === 'all' || 
    (selectedType === 'mandatory' && group.groupType === 'REQUIRED') || 
    (selectedType === 'optional' && group.groupType === 'FREE');

  return matchesCategory && matchesType;
  });

  const hasMore = visibleCount < filteredGroups.length;

  const handleShowMore = () => {
    setVisibleCount(prevCount => prevCount + 2); // 2개씩 추가로 보이게 변경
  };

  const handleShowLess = () => {
    setVisibleCount(2); // 간략히 보기 시 다시 2개로 변경
  };

  

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-card-foreground">전체 그룹</CardTitle>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-24 h-8 text-xs bg-input-background border-border text-foreground">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id} className={`text-xs transition-colors ${category.hoverColor}`}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <div className="px-4">
            <TabsList className="w-full h-[40px] flex">
              <TabsTrigger value="all" className="flex-1">전체</TabsTrigger>
              <TabsTrigger value="optional" className="flex-1">자유참여</TabsTrigger>
              <TabsTrigger value="mandatory" className="flex-1">의무참여</TabsTrigger>
            </TabsList>
          </div>
          {filteredGroups.length > 0 ? (
            <>
              <div className="px-4 pb-4 mt-4 space-y-0 max-h-64 overflow-y-auto scrollbar-hide">
                {filteredGroups.slice(0, visibleCount).map((group) => (
                  <div key={group.groupId} className="...">
                    <GroupCard group={group} onNavigate={onNavigate} onJoinGroup={onJoinGroup} />
                  </div>
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-4">
                  <Button variant="ghost" className="text-sm text-muted-foreground" onClick={handleShowMore}>
                    더보기
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
              {!hasMore && visibleCount > 2 && (
                <div className="flex justify-center mt-4">
                  <Button variant="ghost" className="text-sm text-muted-foreground" onClick={handleShowLess}>
                    간략히 보기
                    <ChevronUp className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <SearchIcon className="h-12 w-12 icon-muted mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">조건에 맞는 그룹이 없습니다</p>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}