// RankingScreen.tsx
import React, { useMemo,useState,useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Trophy, Users, Medal, Crown, Star, Target } from 'lucide-react';
import type { Group, IPersonalRankingResponse, IPersonalRankingData } from '../../interfaces';
import { getUserProfile } from '../../api/user';
import { getPersonalRankings } from '../../api/ranking';
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
    rankings: IGroupRankingItem[];
    monthYear: string;
    totalGroups: number;
    updatedAt: string;
  };
}

interface RankingScreenProps {
  groups: Group[];
  groupRankingData: GlobalGroupRankingData | null;
  userTotalScore: number | null;
  loadingGroupRanking: boolean;
  loadingUserTotalScore: boolean;
  myid: number;
}

const CATEGORY_MAP: Record<string, string> = {
  LIFESTYLE: '생활', 
  HEALTH: '건강',   
  STUDY: '학습',   
  HOBBY: '취미',    
  EXERCISE: '운동',   
};

export function RankingScreen({
  groups,
  groupRankingData,
  userTotalScore,
  loadingGroupRanking,
  loadingUserTotalScore,
  myid,
}: RankingScreenProps) {

  const [personalRankingData, setPersonalRankingData] = useState<IPersonalRankingResponse | null>(null);
  const [loadingPersonalRanking, setLoadingPersonalRanking] = useState(true);

  const [userProfiles, setUserProfiles] = useState<Record<number, string>>({});
  
  // 💡 API로부터 모든 페이지의 개인 랭킹 데이터를 불러오는 함수
  const fetchAllPersonalRankings = async () => {
    setLoadingPersonalRanking(true);
    let allRankings: IPersonalRankingData[] = [];
    let page = 0;
    let hasMore = true;
    const pageSize = 50; 

    try {
      while (hasMore) {
        const response = await getPersonalRankings(undefined, undefined, page, pageSize);
        
        if (response && response.data && response.data.content) {
          allRankings = [...allRankings, ...response.data.content];
          
          if (response.data.last) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }
    } catch (error) {
      console.error("전체 개인 랭킹 불러오기 실패:", error);
    } finally {
      // 모든 데이터를 합친 최종 랭킹 데이터로 상태 업데이트
      setPersonalRankingData({ 
        success: true,
        message: '전체 랭킹 조회 성공',
        data: {
          content: allRankings,
          totalElements: allRankings.length,
          totalPages: 1, 
          number: 0,
          size: allRankings.length,
          first: true,
          last: true,
          empty: allRankings.length === 0,
          numberOfElements: allRankings.length,
          pageable: null,
          sort: null
        }
      });
      setLoadingPersonalRanking(false);
    }
  };

  const currentMonth = new Date().getMonth() + 1;

  // 💡 컴포넌트가 처음 마운트될 때 전체 랭킹 데이터를 불러옵니다.
  useEffect(() => {
    fetchAllPersonalRankings();
  }, []);

  const rawPersonalRankings: IPersonalRankingData[] = personalRankingData?.data?.content || [];

  useEffect(() => {
    if (rawPersonalRankings.length > 0) {
      const uniqueUserIds = [...new Set(rawPersonalRankings.map(item => item.userId))];
      
      const fetchProfiles = async () => {
        const profiles: Record<number, string> = {};
        await Promise.all(
          uniqueUserIds.map(async (userId) => {
            try {
              const profile = await getUserProfile(userId);
              if (profile.profileImageUrl) {
                profiles[userId] = profile.profileImageUrl;
              }
            } catch (error) {
              console.error(`Failed to fetch profile for user ID ${userId}:`, error);
            }
          })
        );
        setUserProfiles(profiles);
      };
      
      fetchProfiles();
    }
  }, [rawPersonalRankings]);

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
        profileImageUrl: userProfiles[user.userId] || user.profileImageUrl || undefined,
      }));
  }, [rawPersonalRankings, userProfiles]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-rank-1-color" />;
      case 2:
        return <Medal className="h-5 w-5 text-rank-2-color" />;
      case 3:
        return <Medal className="h-5 w-5 text-rank-3-color" />;
      default:
        return <span className="text-sm font-bold text-foreground w-5 text-center">{rank}</span>;
    }
  };

  const getScoreColor = (rank: number) => {
    if (rank <= 3) return 'text-top-3-score-color';
    if (rank <= 5) return 'text-top-5-score-color';
    return 'text-foreground';
  };

  const translateCategory = (category: string): string => {
  const upperCaseCategory = category.toUpperCase();
  return CATEGORY_MAP[upperCaseCategory] || category;
};
  
  const groupRankings = groupRankingData?.data?.rankings || [];
  const myGroupIds = groups.map(group => group.groupId);

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
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-ranking-accent-bg">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-card-yellow-text">
                    {currentMonth}월 월간 랭킹
                  </div>
                  <div className="text-xs text-card-yellow-text/90">
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
                {/* 💡 로딩 상태에 따라 다른 UI를 보여줍니다. */}
                {loadingPersonalRanking ? (
                  <div className="text-center text-sm text-gray-500 py-8">
                    개인 랭킹을 불러오는 중입니다...
                  </div>
                ) : mergedPersonalRankings.length > 0 ? (
                  mergedPersonalRankings.map((user) => (
                    <div
                      key={user.userId}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        myid === user.userId && ' bg-my-highlight-bg'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 flex justify-center">{getRankIcon(user.currentRank)}</div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={user.profileImageUrl || undefined}
                            alt={user.nickname}
                            className='object-cover'
                          />
                          <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{user.nickname}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${getScoreColor(user.currentRank)} ${
                            myid === user.userId && 'text-white dark:text-white'
                          }`}
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
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-br bg-card-yellow-bg dark:bg-card-yellow-bg dark:border-none">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-ranking-accent-bg">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-card-yellow-text">
                    {currentMonth}월 월간 랭킹
                  </div>
                  <div className="text-xs text-card-yellow-text/90">
                    {currentMonth + 1}월 1일 자정에 랭킹이 리셋됩니다
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground flex items-center space-x-2">
                <Users className="h-4 w-4 icon-accent" />
                <span>그룹 전체 랭킹</span>
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
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        myGroupIds.includes(group.groupId) && 'bg-my-highlight-bg'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 flex justify-center">{getRankIcon(group.rank)}</div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={group.groupImageUrl || undefined}
                            alt={group.groupName}
                            className='object-cover'
                          />
                          <AvatarFallback>{group.groupName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{group.groupName}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant='outline'
                              className={`text-xs ${
                                group.groupType === 'REQUIRED' 
                                    ? 'bg-notice-required-bg border-notice-required-border text-notice-required-text'
                                    : 'bg-notice-optional-bg border-notice-optional-border text-notice-optional-text'
                            }`}
                              
                            >
                              {group.groupType === 'REQUIRED' ? '의무참여' : '자율참여'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-foreground dark:opacity-75 mt-1">
                            <span>{translateCategory(group.category)}</span>
                            <span>•</span>
                            <span>{group.memberCount}명</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(group.rank)} ${
                          myGroupIds.includes(group.groupId) && ''
                        }`}>
                          {group.totalScore.toLocaleString()}
                        </div>
                        <div className="text-xs text-foreground dark:opacity-75">총점</div>
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
