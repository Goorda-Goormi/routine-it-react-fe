import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Trophy, Calendar, Crown, Users } from 'lucide-react';
import type { GroupMemberResponse } from '../../../interfaces';

interface GroupDetailTabsProps {
    weeklyRanking: any[];
    recentActivities: any[];
    onMemberClick: (member: any) => void;
    groupMembers: GroupMemberResponse[];
    memberProfiles: Record<number, string>;
    currentUserNickname: string; // 현재 사용자 닉네임을 props로 추가
}

export const GroupDetailTabs = ({
    weeklyRanking,
    recentActivities,
    onMemberClick,
    groupMembers,
    memberProfiles,
    currentUserNickname // props로 받음
}: GroupDetailTabsProps) => {
    console.log("GroupDetailTabs로 전달된 멤버 데이터:", groupMembers);
    console.log("최근 활동 데이터:", recentActivities);
    console.log("멤버 프로필 맵:", memberProfiles);

    const renderMembers = () => {
        return groupMembers.map((member, index) => {
            if (!member || !member.memberName) {
                return null;
            }

            const isLeader = member.role === 'LEADER';
            const isUncertified = member.message === '미인증';
            const profileImageUrl = member.userId ? memberProfiles[member.userId] : '';
            return (
                <div key={member.groupMemberId}>
                    <div
                        className="flex items-center justify-between rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => onMemberClick(member)}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <Avatar className="h-8 w-8">
                                    {profileImageUrl ? (
                                        <AvatarImage src={profileImageUrl} alt={`${member.memberName} 프로필 이미지`} />
                                    ) : null}
                                    <AvatarFallback className="text-xs">{member.memberName[0]}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-card-foreground">{member.memberName}</span>
                                    {isLeader && (
                                        <div className="flex items-center space-x-1">
                                            <Crown className="h-3 w-3 text-yellow-500" />
                                            <span className="text-xs text-yellow-600 font-medium">리더</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant={isUncertified ? 'destructive' : 'default'} className="text-xs">
                                {member.message}
                            </Badge>
                        </div>
                    </div>
                    {index < groupMembers.length - 1 && <div className="border-b border-border/50 mx-3"></div>}
                </div>
            );
        });
    };

    return (
        <Tabs defaultValue="members">
            <TabsList className="grid w-full h-auto grid-cols-3">
                <TabsTrigger value="members">멤버</TabsTrigger>
                <TabsTrigger value="ranking">순위</TabsTrigger>
                <TabsTrigger value="activity">활동</TabsTrigger>
            </TabsList>
            <TabsContent value="members" className="mt-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2 text-base text-card-foreground">
                            <Users className="h-4 w-4 icon-accent" />
                            <span>그룹 멤버</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-0">
                            {renderMembers()}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="ranking" className="mt-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2 text-base text-card-foreground">
                            <Trophy className="h-4 w-4 icon-accent" />
                            <span>주간 순위</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-0">
                            {weeklyRanking.length > 0 ? (
                                weeklyRanking.map((item, index) => {
                                    const member = groupMembers.find(m => m.memberName === item.nickname);
                                    const profileImageUrl = member && member.userId ? memberProfiles[member.userId] : '';
                                    
                                    // 현재 사용자인지 확인하는 로직
                                    const isCurrentUser = item.nickname === currentUserNickname;
                                    const highlightClass = isCurrentUser ? 'bg-orange-50 border-yellow-200' : 'border-border/50';

                                    return (
                                        <div key={item.rank}>
                                            <div className={`flex items-center justify-between p-3 border rounded-lg hover:bg-accent/30 transition-colors ${highlightClass}`}>
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <span className="text-xs font-bold text-primary">{item.rank}</span>
                                                        </div>
                                                        <Avatar className="h-8 w-8">
                                                            {profileImageUrl ? (
                                                                <AvatarImage src={profileImageUrl} alt={`${item.nickname} 프로필 이미지`} />
                                                            ) : null}
                                                            <AvatarFallback className="text-xs">{item.nickname[0]}</AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                    <span className="text-sm font-medium text-card-foreground">{item.nickname}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-bold text-card-foreground">{item.score}점</span>
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${
                                                            item.change === 'up' ? 'bg-green-500' : item.change === 'down' ? 'bg-red-500' : 'bg-gray-400'
                                                        }`}
                                                    ></div>
                                                </div>
                                            </div>
                                            {index < weeklyRanking.length - 1 && <div className="h-2"></div>}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-8 text-center text-sm text-muted-foreground">아직 순위 내역이 없습니다.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="activity" className="mt-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2 text-base text-card-foreground">
                            <Calendar className="h-4 w-4 icon-accent" />
                            <span>최근 활동</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-0">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((activity, index) => {
                                    const member = groupMembers.find(m => m.memberName === activity.nickname);
                                    const profileImageUrl = member && member.userId ? memberProfiles[member.userId] : '';
                                    
                                    return (
                                        <div key={`${activity.id}-${index}`}>
                                            <div className="flex items-center space-x-3 p-3 border border-border/50 rounded-lg hover:bg-accent/30 transition-colors">
                                                <Avatar className="h-8 w-8">
                                                    {profileImageUrl ? (
                                                        <AvatarImage src={profileImageUrl} alt={`${activity.nickname} 프로필 이미지`} />
                                                    ) : null}
                                                    <AvatarFallback className="text-xs">{activity.nickname[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="text-sm">
                                                        <span className="font-medium text-card-foreground">{activity.nickname}</span>
                                                        <span className="text-muted-foreground"> {activity.action}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                                                </div>
                                            </div>
                                            {index < recentActivities.length - 1 && <div className="h-2"></div>}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-8 text-center text-sm text-muted-foreground">아직 활동 내역이 없습니다.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
};