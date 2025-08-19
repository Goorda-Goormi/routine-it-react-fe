import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Search, Users, Calendar, Target, Crown, MessageCircle, Filter } from 'lucide-react';

interface GroupScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export function GroupScreen({ onNavigate }: GroupScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: '전체', hoverColor: 'hover:bg-gray-100/70 hover:text-gray-800' },
    { id: 'health', name: '건강', hoverColor: 'hover:bg-red-100/70 hover:text-red-800' },
    { id: 'exercise', name: '운동', hoverColor: 'hover:bg-orange-100/70 hover:text-orange-800' },
    { id: 'study', name: '학습', hoverColor: 'hover:bg-blue-100/70 hover:text-blue-800' },
    { id: 'lifestyle', name: '생활', hoverColor: 'hover:bg-green-100/70 hover:text-green-800' },
    { id: 'hobby', name: '취미', hoverColor: 'hover:bg-purple-100/70 hover:text-purple-800' }
  ];

  // 참여 중인 그룹
  const myGroups = [
    { 
      id: 1, 
      name: '아침 운동 챌린지', 
      description: '매일 아침 운동하고 인증하기',
      members: 12, 
      type: '의무참여', 
      progress: 80,
      isOwner: true,
      time: '06:00-09:00',
      category: 'exercise',
      recentMembers: [
        { id: 1, name: '김민수', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
        { id: 2, name: '이지영', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b95fcebf?w=40&h=40&fit=crop&crop=face' },
        { id: 3, name: '박철수', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' }
      ]
    },
    { 
      id: 2, 
      name: '독서 모임', 
      description: '책 읽고 후기 공유하기',
      members: 8, 
      type: '자유참여', 
      progress: 65,
      isOwner: false,
      time: '언제든',
      category: 'study',
      recentMembers: [
        { id: 4, name: '정수현', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
        { id: 5, name: '최영호', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face' }
      ]
    }
  ];

  // 전체 그룹 목록
  const allGroups = [
    { 
      id: 3, 
      name: '물 마시기 챌린지', 
      description: '하루 2L 물 마시기 습관',
      members: 25, 
      type: '자유참여', 
      category: 'health',
      time: '언제든',
      owner: '김도현'
    },
    { 
      id: 4, 
      name: '새벽 6시 기상', 
      description: '새벽 6시에 일어나는 습관 만들기',
      members: 15, 
      type: '의무참여', 
      category: 'lifestyle',
      time: '06:00-06:30',
      owner: '이소영'
    },
    { 
      id: 5, 
      name: '영어 공부', 
      description: '매일 영어 학습하기',
      members: 18, 
      type: '자유참여', 
      category: 'study',
      time: '언제든',
      owner: '박재민'
    },
    { 
      id: 6, 
      name: '홈트레이닝', 
      description: '집에서 운동하는 습관',
      members: 32, 
      type: '자유참여', 
      category: 'exercise',
      time: '18:00-21:00',
      owner: '최강민'
    },
    { 
      id: 7, 
      name: '명상하기', 
      description: '매일 10분 명상으로 마음 다스리기',
      members: 14, 
      type: '자유참여', 
      category: 'health',
      time: '21:00-22:00',
      owner: '조은별'
    },
    { 
      id: 8, 
      name: '그림 그리기', 
      description: '하루 한 번 그림 그리는 시간',
      members: 9, 
      type: '자유참여', 
      category: 'hobby',
      time: '언제든',
      owner: '김예나'
    }
  ];

  // 필터링 로직
  const getFilteredGroups = (filter: string) => {
    let filtered = allGroups;
    
    // 유형 필터
    if (filter === 'mandatory') {
      filtered = allGroups.filter(group => group.type === '의무참여');
    } else if (filter === 'optional') {
      filtered = allGroups.filter(group => group.type === '자유참여');
    }
    
    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(group => group.category === selectedCategory);
    }
    
    // 검색 필터
    if (searchQuery) {
      filtered = filtered.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

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

  const handleJoinGroup = (groupId: number) => {
    // 그룹 참여 로직
    console.log(`${groupId} 그룹에 참여합니다.`);
    const groupToNavigate = allGroups.find(group => group.id === groupId);
    if (groupToNavigate) {
      onNavigate('group-detail', groupToNavigate);
    }
  };

  const createNewGroup = () => {
    onNavigate('create-group');
  };

return (
    <div className="space-y-4 h-full p-4">
      {/* 검색 바 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 icon-muted" />
        <Input
          placeholder="그룹 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* 참여 중인 그룹 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-card-foreground">참여 중인 그룹</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={createNewGroup}
              className="text-card-foreground border-border hover:bg-accent hover:text-card-foreground"
            >
              <Plus className="h-4 w-4 mr-1 icon-secondary" />
              그룹 생성
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {myGroups.length > 0 ? (
            <div className="space-y-0">
              {myGroups.map((group, index) => (
                <div key={group.id}>
                  <div 
                    className={`p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                      index < myGroups.length - 1 ? 'border-b border-border/30' : ''
                    }`}
                    onClick={() => onNavigate('group-detail', group)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="text-sm font-medium text-card-foreground">{group.name}</span>
                        {group.isOwner && <Crown className="h-3 w-3 text-yellow-400 icon-accent" />}
                        <Badge variant={group.type === '의무참여' ? 'destructive' : 'secondary'} className="text-xs">
                          {group.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto text-card-foreground hover:text-card-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('group-chat', group);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 icon-secondary" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">{group.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{getCategoryEmoji(group.category)} {getCategoryName(group.category)}</span>
                      <span>👥 {group.members}명</span>
                      <span>⏰ {group.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 icon-muted mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">참여 중인 그룹이 없습니다</p>
              <Button onClick={createNewGroup} size="sm">
                <Plus className="h-4 w-4 mr-2 icon-secondary" />
                첫 그룹 만들기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 전체 그룹 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-card-foreground">전체 그룹</CardTitle>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-24 h-8 text-xs bg-input-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem 
                    key={category.id} 
                    value={category.id} 
                    className={`text-xs transition-colors ${category.hoverColor}`}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all">
            <div className="px-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="optional">자유참여</TabsTrigger>
                <TabsTrigger value="mandatory">의무참여</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="px-4 pb-4 mt-4">
              <div className="space-y-0">
                {getFilteredGroups('all').map((group, index) => (
                  <div key={group.id}>
                    <div className={`p-3 hover:bg-accent/50 transition-colors ${
                      index < getFilteredGroups('all').length - 1 ? 'border-b border-border/30' : ''
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-sm font-medium text-card-foreground">{group.name}</span>
                          <Badge variant={group.type === '의무참여' ? 'destructive' : 'secondary'} className="text-xs">
                            {group.type}
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinGroup(group.id);
                          }}
                          className="text-card-foreground border-border hover:bg-accent hover:text-card-foreground text-xs px-2 py-1"
                        >
                          참여하기
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">{group.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{getCategoryEmoji(group.category)} {getCategoryName(group.category)}</span>
                        <span>👥 {group.members}명</span>
                        <span>⏰ {group.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="optional" className="px-4 pb-4 mt-4">
              <div className="space-y-0">
                {getFilteredGroups('optional').map((group, index) => (
                  <div key={group.id}>
                    <div className={`p-3 hover:bg-accent/50 transition-colors ${
                      index < getFilteredGroups('optional').length - 1 ? 'border-b border-border/30' : ''
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-sm font-medium text-card-foreground">{group.name}</span>
                          <Badge variant="secondary" className="text-xs">자유참여</Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinGroup(group.id);
                          }}
                          className="text-card-foreground border-border hover:bg-accent hover:text-card-foreground text-xs px-2 py-1"
                        >
                          참여하기
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">{group.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{getCategoryEmoji(group.category)} {getCategoryName(group.category)}</span>
                        <span>👥 {group.members}명</span>
                        <span>⏰ {group.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mandatory" className="px-4 pb-4 mt-4">
              <div className="space-y-0">
                {getFilteredGroups('mandatory').map((group, index) => (
                  <div key={group.id}>
                    <div className={`p-3 hover:bg-accent/50 transition-colors ${
                      index < getFilteredGroups('mandatory').length - 1 ? 'border-b border-border/30' : ''
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-sm font-medium text-card-foreground">{group.name}</span>
                          <Badge variant="destructive" className="text-xs">의무참여</Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinGroup(group.id);
                          }}
                          className="text-card-foreground border-border hover:bg-accent hover:text-card-foreground text-xs px-2 py-1"
                        >
                          참여하기
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">{group.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{getCategoryEmoji(group.category)} {getCategoryName(group.category)}</span>
                        <span>👥 {group.members}명</span>
                        <span>⏰ {group.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}