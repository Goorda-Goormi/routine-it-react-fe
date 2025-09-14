import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Trophy, Users, Medal, Crown, Star, Target } from 'lucide-react';
import type { Group, IPersonalRankingResponse, IPersonalRankingData } from '../../interfaces';

// 그룹 랭킹 인터페이스 정의
export interface IGroupRankingItem {
  rank: number;
  groupId: number;
  groupName: string;
  groupImageUrl: string;
  category: string;
  groupType: string;
  totalScore: number;
  memberCount: number;
  activeMembers: number;
  participationRate: number;
  totalAuthCount: number;
  averageAuthPerMember: number;
}

export interface GlobalGroupRankingData {
  success: boolean;
  message: string;
  data: {
    content: IGroupRankingItem[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: any; 
    size: number;
    sort: any; 
    totalElements: number;
    totalPages: number;
  };
}

interface RankingScreenProps {
  groups: Group[];
  personalRankingData: IPersonalRankingResponse | null;
  groupRankingData: GlobalGroupRankingData | null;
  userTotalScore: number | null;
  loadingGroupRanking: boolean;
  loadingUserTotalScore: boolean;
  myid: string; 
}

export function RankingScreen({
  groups,
  personalRankingData,
  groupRankingData,
  userTotalScore,
  loadingGroupRanking,
  loadingUserTotalScore,
  myid,
}: RankingScreenProps) {
  const currentMonth = new Date().getMonth() + 1;

  // 원본 개인 랭킹 데이터
  const rawPersonalRankings: IPersonalRankingData[] = personalRankingData?.data?.content || [];

  // ✅ 유저별 점수 합산 + 정렬 + rank 재계산
  const mergedPersonalRankings = useMemo(() => {
    const map = new Map<number, IPersonalRankingData>();

    rawPersonalRankings.forEach((item) => {
      if (map.has(item.userId)) {
        const existing = map.get(item.userId)!;
        map.set(item.userId, {
          ...existing,
          totalScore: existing.totalScore + item.totalScore,
        });
      } else {
        map.set(item.userId, { ...item });
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((user, index) => ({
        ...user,
        currentRank: index + 1,
      }));
  }, [rawPersonalRankings]);

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

  const groupRankings = groupRankingData?.data?.content || [];

  // 내가 속한 그룹 ID를 가져오는 유틸리티
  const myGroupIds = groups.map(group => group.groupId);

   const categoryMap: { [key: string]: string } = {
    'health': '건강',
    'exercise': '운동',
    'study': '학습',
    'lifestyle': '생활',
    'hobby': '취미',
  };

  // ✅ 카테고리 번역 함수
   const getCategoryInKorean = (category: string) => {
    return categoryMap[category] || category; // 매핑된 값이 없으면 원본값 반환
  };

  return (
    <div className="h-full p-4">
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="w-full h-[40px] grid-cols-2">
          <TabsTrigger value="personal">개인별</TabsTrigger>
          <TabsTrigger value="group">그룹별</TabsTrigger>
        </TabsList>

        {/* 개인별 탭 */}
        <TabsContent value="personal" className="space-y-4">
          <Card className="dark:card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-br bg-card-yellow-bg dark:bg-card-yellow-bg dark:border-none">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 dark:bg-orange-700">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-amber-800 dark:text-white">
                    {currentMonth}월 월간 랭킹
                  </div>
                  <div className="text-xs text-amber-700 dark:text-white dark:opacity-90">
                    {currentMonth + 1}월 1일 자정에 랭킹이 리셋됩니다
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground flex items-center space-x-2">
                <Trophy className="h-4 w-4 icon-accent" />
                <span>개인별 전체 랭킹</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {mergedPersonalRankings.length > 0 ? (
                  mergedPersonalRankings.map((user) => (
                    <div
                      key={user.userId}
                      // 내 ID와 일치하면 하이라이트 클래스 적용
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        user.userId === parseInt(myid)
                          ? 'border-yellow-200 bg-orange-50 dark:bg-blue-950'
                          : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 flex justify-center">{getRankIcon(user.currentRank)}</div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={user.profileImageUrl || undefined}
                            alt={user.nickname}
                          />
                          <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{user.nickname}</div>
                          <div className="text-xs">연속 {user.consecutiveDays ?? 0}일</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${getScoreColor(user.currentRank)}`}
                        >
                          {user.totalScore.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">총점</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-gray-500 py-8">
                    데이터가 없습니다.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 그룹별 탭 */}
        <TabsContent value="group" className="space-y-4">
          <Card className="dark:card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-br bg-card-peach-bg dark:bg-card-peach-bg dark:border-none">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 dark:bg-red-700">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-orange-800 dark:text-white">
                    {currentMonth}월 그룹 랭킹
                  </div>
                  <div className="text-xs text-orange-700 dark:text-white dark:opacity-90">
                    전체 그룹 중 순위를 확인하세요
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground flex items-center space-x-2">
                <Target className="h-4 w-4 icon-accent" />
                <span>그룹별 전체 랭킹</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {loadingGroupRanking ? (
                  <div className="text-center text-sm text-gray-500 py-8">
                    그룹 랭킹을 불러오는 중입니다...
                  </div>
                ) : groupRankings.length > 0 ? (
                  groupRankings.map((group) => (
                    <div
                      key={group.groupId}
                      // 내가 속한 그룹 ID와 일치하면 하이라이트 클래스 적용
                      className={`p-3 rounded-lg border border-border dark:border-border ${
                        myGroupIds.includes(group.groupId)
                          ? 'border-yellow-200 bg-orange-50 dark:bg-blue-950'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(group.rank)}
                          </div>
                          <Avatar className="w-10 h-10 rounded-full">
                            <AvatarImage
                              src={group.groupImageUrl || undefined}
                              alt={group.groupName}
                            />
                            <AvatarFallback>{group.groupName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-foreground">
                                {group.groupName}
                              </span>
                              <Badge
                                variant={
                                  group.groupType === 'REQUIRED' ? 'destructive' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {group.groupType === 'REQUIRED' ? '의무참여' : '자유참여'}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-foreground dark:opacity-75 mt-1">
                               <span>{getCategoryInKorean(group.category)}</span>
                              <span>•</span>
                              <span>{group.memberCount}명</span>
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
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-gray-500 py-8">
                    그룹 랭킹 데이터가 없습니다.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
