import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Trophy, Calendar, Crown } from 'lucide-react';

interface GroupDetailTabsProps {
  members: any[];
  weeklyRanking: any[];
  recentActivities: any[];
  onMemberClick: (member: any) => void;
}

export const GroupDetailTabs = ({
  members,
  weeklyRanking,
  recentActivities,
  onMemberClick,
}: GroupDetailTabsProps) => {
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
            <CardTitle className="text-base text-card-foreground">그룹 멤버</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0">
              {members.map((member, index) => (
                <div key={member.id}>
                  <div
                    className="flex items-center justify-between rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => onMemberClick(member)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                        </Avatar>
                        {member.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-card-foreground">{member.name}</span>
                          {member.isLeader && (
                            <div className="flex items-center space-x-1">
                              <Crown className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs text-yellow-600 font-medium">리더</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-left text-muted-foreground">{member.score}점</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={member.isCertified ? 'default' : 'destructive'} className="text-xs">
                        {member.isCertified ? '인증' : '미인증'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        #{member.rank}
                      </Badge>
                    </div>
                  </div>
                  {index < members.length - 1 && <div className="border-b border-border/50 mx-3"></div>}
                </div>
              ))}
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
              {weeklyRanking.map((item, index) => (
                <div key={item.rank}>
                  <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-accent/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{item.rank}</span>
                      </div>
                      <span className="text-sm font-medium text-card-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-card-foreground">{item.score}%</span>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.change === 'up' ? 'bg-green-500' : item.change === 'down' ? 'bg-red-500' : 'bg-gray-400'
                        }`}
                      ></div>
                    </div>
                  </div>
                  {index < weeklyRanking.length - 1 && <div className="h-2"></div>}
                </div>
              ))}
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
              {recentActivities.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex items-center space-x-3 p-3 border border-border/50 rounded-lg hover:bg-accent/30 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{activity.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium text-card-foreground">{activity.user}</span>
                        <span className="text-muted-foreground"> {activity.action}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{activity.time}</div>
                    </div>
                  </div>
                  {index < recentActivities.length - 1 && <div className="h-2"></div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};