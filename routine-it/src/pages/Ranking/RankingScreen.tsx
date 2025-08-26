// RankingScreen.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Trophy, Users, Medal, Crown, Star, Target } from 'lucide-react';

interface Group {
  id: number;
  name: string;
  description?: string;
  members: number;
  type: string;
  time: string;
  category: string;
  owner?: string;
  progress?: number;
  isOwner?: boolean;
  recentMembers?: { id: number; name: string; avatar: string }[];
}

export function RankingScreen({ groups }: { groups: Group[] }) {
  // 개인별 랭킹 데이터는 그대로 둡니다
  const personalRanking = [
    { id: 1, rank: 1, name: '김민수', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', totalScore: 2840, streakDays: 45 },
    { id: 2, rank: 2, name: '이지영', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b95fcebf?w=40&h=40&fit=crop&crop=face', totalScore: 2650, streakDays: 38 },
    { id: 3, rank: 3, name: '박철수', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', totalScore: 2520, streakDays: 42 },
    { id: 4, rank: 4, name: '정수현', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face', totalScore: 2380, streakDays: 35 },
    { id: 5, rank: 5, name: '최영호', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face', totalScore: 2290, streakDays: 29 },
    { id: 6, rank: 6, name: '조민아', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face', totalScore: 2150, streakDays: 31 },
    { id: 7, rank: 7, name: '윤태준', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face', totalScore: 2080, streakDays: 26 }
  ];

// groups 기반 더미 점수 계산
const groupRanking = groups
  .map((group) => ({
    ...group,
    totalScore: 5000 + Math.floor(Math.random() * 5000), // 더미 점수
    avgScore: (5000 + Math.floor(Math.random() * 5000)) / (group.members || 1),
  }))
  .sort((a, b) => b.totalScore - a.totalScore) // 점수 내림차순 정렬
  .map((group, index) => ({ ...group, rank: index + 1 })); // 순위 부여


  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-foreground w-5 text-center">{rank}</span>;
    }
  };

  const getScoreColor = (rank: number) => {
    if (rank <= 3) return 'text-yellow-600 dark:text-white';
    if (rank <= 5) return 'text-green-600 dark:text-white';
    return 'text-foreground';
  };

  return (
    <div className="h-full p-4">
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="w-full h-[40px] grid-cols-2">
          <TabsTrigger value="personal">개인별</TabsTrigger>
          <TabsTrigger value="group">그룹별</TabsTrigger>
        </TabsList>

        {/* 개인별 */}
        <TabsContent value="personal" className="space-y-4">
          {/* 안내 카드 */}
          <Card className="dark:card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-br bg-card-yellow-bg dark:bg-card-yellow-bg dark:border-none">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 dark:bg-orange-700">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-amber-800 dark:text-white">11월 월간 랭킹</div>
                  <div className="text-xs text-amber-700 dark:text-white dark:opacity-90">12월 1일 자정에 랭킹이 리셋됩니다</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 개인 랭킹 리스트 */}
          <Card className="dark:card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground flex items-center space-x-2">
                <Trophy className="h-4 w-4 icon-accent" />
                <span>개인별 전체 랭킹</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {personalRanking.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-border dark:border-border">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(user.rank)}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col items-start'>
                        <div className="text-sm font-medium text-foreground">{user.name}</div>
                        <div className="text-xs text-foreground dark:opacity-75">연속 {user.streakDays}일</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(user.rank)}`}>
                        {user.totalScore.toLocaleString()}
                      </div>
                      <div className="text-xs text-foreground dark:opacity-75">총점</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 그룹별 */}
        <TabsContent value="group" className="space-y-4">
          {/* 안내 카드 */}
          <Card className="dark:card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-br bg-card-peach-bg dark:bg-card-peach-bg dark:border-none">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 dark:bg-red-700">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-orange-800 dark:text-white">11월 그룹 랭킹</div>
                  <div className="text-xs text-orange-700 dark:text-white dark:opacity-90">전체 그룹 중 순위를 확인하세요</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 그룹 랭킹 리스트 */}
          <Card className="dark:card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground flex items-center space-x-2">
                <Target className="h-4 w-4 icon-accent" />
                <span>그룹별 전체 랭킹</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {groupRanking.map((group) => (
                  <div key={group.id} className="p-3 rounded-lg border border-border dark:border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(group.rank)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-foreground">{group.name}</span>
                            <Badge variant={group.type === '의무참여' ? 'destructive' : 'secondary'} className="text-xs">
                              {group.type}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-foreground dark:opacity-75 mt-1">
                            <span>{group.category}</span>
                            <span>•</span>
                            <span>{group.members}명</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(group.rank)}`}>
                          {group.totalScore.toLocaleString()}
                        </div>
                        <div className="text-xs text-foreground dark:opacity-75">총점</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-foreground dark:opacity-75">
                      <span>평균 점수: {group.avgScore.toFixed(1)}점</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
