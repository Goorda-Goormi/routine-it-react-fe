import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Search, Users, Crown, MessageCircle } from 'lucide-react';

export interface Member {
  id: number;
  name: string;
  avatar: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  members: number;
  type: string;
  progress?: number;
  isOwner?: boolean;
  time: string;
  category: string;
  recentMembers?: Member[];
  owner?: string;
}

interface GroupScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  groups: Group[]; // 모든 그룹 데이터
  myGroups: Group[]; // 내가 참여 중인 그룹 데이터
  onNewGroup: (newGroup: Group) => void; // 새로운 그룹 생성 시 호출될 함수
}

export function GroupScreen({ onNavigate, groups, myGroups, onNewGroup }: GroupScreenProps) {
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

  // 필터링 로직
  const getFilteredGroups = (filter: string, groupList: Group[]) => {
    let filtered = groupList;

    if (filter === 'mandatory') {
      filtered = groupList.filter(group => group.type === '의무참여');
    } else if (filter === 'optional') {
      filtered = groupList.filter(group => group.type === '자유참여');
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(group => group.category === selectedCategory);
    }

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
    const groupToNavigate = groups.find(group => group.id === groupId);
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
                    className={`p-5 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors ${
                      index < myGroups.length - 1 ? 'border-b border-border/30' : ''
                    }`}
                    onClick={() => onNavigate('group-detail', group)}
                  >
                    <div className="flex items-center justify-between mb-1">
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

                    <p className="text-xs text-left text-muted-foreground mb-2">{group.description}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
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
              <TabsList className="w-full h-[40px] flex">
                <TabsTrigger value="all" className="flex-1">전체</TabsTrigger>
                <TabsTrigger value="optional" className="flex-1">자유참여</TabsTrigger>
                <TabsTrigger value="mandatory" className="flex-1">의무참여</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="px-4 pb-4 mt-4">
              <div className="space-y-0">
                {getFilteredGroups('all', groups).map((group, index) => (
                  <div key={group.id}>
                    <div className={`p-5 rounded-lg hover:bg-accent/50 transition-colors ${
                      index < getFilteredGroups('all', groups).length - 1 ? 'border-b border-border/30' : ''
                      }`}>
                      <div className="flex items-center justify-between mb-1">
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

                      <p className="text-xs text-left text-muted-foreground mb-2">{group.description}</p>

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
                {getFilteredGroups('optional', groups).map((group, index) => (
                  <div key={group.id}>
                    <div className={`p-5 rounded-lg hover:bg-accent/50 transition-colors ${
                      index < getFilteredGroups('optional', groups).length - 1 ? 'border-b border-border/30' : ''
                      }`}>
                      <div className="flex items-center justify-between mb-1">
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

                      <p className="text-xs text-left text-muted-foreground mb-2">{group.description}</p>

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
                {getFilteredGroups('mandatory', groups).map((group, index) => (
                  <div key={group.id}>
                    <div className={`p-5 rounded-lg hover:bg-accent/50 transition-colors ${
                      index < getFilteredGroups('mandatory', groups).length - 1 ? 'border-b border-border/30' : ''
                      }`}>
                      <div className="flex items-center justify-between mb-1">
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
                      <p className="text-xs text-left text-muted-foreground mb-2">{group.description}</p>

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