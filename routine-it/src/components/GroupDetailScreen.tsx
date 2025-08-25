import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogOverlay, DialogClose } from './ui/dialog';
import { GroupApproval } from './GroupApproval';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  ArrowLeft,
  MessageCircle,
  Settings,
  Users,
  Trophy,
  Calendar,
  Share,
  Crown,
  Target,
  Clock,
  X,
} from 'lucide-react';

import { GroupMemberManager } from './GroupMemberManager';
import GroupEdit from "./GroupEdit";

interface GroupDetailScreenProps {
  group: any;
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

export function GroupDetailScreen({
  group,
  onBack,
  onNavigate,
}: GroupDetailScreenProps) {
  const [isJoined, setIsJoined] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showExMembersModal, setShowExMembersModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const [errors, setErrors] = useState<any>({});

  // 멤버 데이터에 isCertified 속성 추가
  const [members, setMembers] = useState([
    {
      id: '1',
      name: '김루틴',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      rank: 1,
      score: 850,
      isOnline: true,
      isLeader: true,
      isCertified: true, // 추가: 인증 상태
    },
    {
      id: '2',
      name: '박습관',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b95fcebf?w=40&h=40&fit=crop&crop=face',
      rank: 2,
      score: 780,
      isOnline: false,
      isLeader: false,
      isCertified: false, // 추가: 인증 상태
    },
    {
      id: '3',
      name: '이지속',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      rank: 3,
      score: 720,
      isOnline: true,
      isLeader: false,
      isCertified: true, // 추가: 인증 상태
    },
    {
      id: '4',
      name: '최노력',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      rank: 4,
      score: 680,
      isOnline: false,
      isLeader: false,
      isCertified: false, // 추가: 인증 상태
    },
    {
      id: '5',
      name: '정성실',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      rank: 5,
      score: 650,
      isOnline: true,
      isLeader: false,
      isCertified: true, // 추가: 인증 상태
    },
  ]);

  const handleKickMember = (memberId: string) => {
    setMembers(members.filter(member => member.id !== memberId));
    alert('멤버를 그룹에서 내보냈습니다.');
    setShowExMembersModal(false);
  };

  const weeklyRanking = [
    { rank: 1, name: '김루틴', score: 95, change: 'up' },
    { rank: 2, name: '박습관', score: 88, change: 'same' },
    { rank: 3, name: '이지속', score: 82, change: 'down' },
  ];

  const recentActivities = [
    { id: 1, user: '김루틴', action: '운동 인증 완료', time: '10분 전', image: null },
    { id: 2, user: '박습관', action: '목표 달성!', time: '1시간 전', image: null },
    { id: 3, user: '이지속', action: '운동 인증 완료', time: '2시간 전', image: null },
  ];

  const authMessages = [
    { id: 1, user: '이지속', message: '오전 운동 인증' },
    { id: 2, user: '박습관', message: '아침 독서 완료' },
  ];

  const handleJoinGroup = () => {
    setIsJoined(true);
  };

  const handleChatClick = () => {
    onNavigate('group-chat', group);
  };

  const handleMemberClick = (member: any) => {
    onNavigate('user-home', member);
  };

  const currentUser = { id: '1', name: '김루틴' };
  const isLeader = members.find((m) => m.id === currentUser.id)?.isLeader ?? false;

  const handleMenuClick = (action: string) => {
    if (!isLeader) {
      alert('리더만 권한이 있습니다');
      return;
    }

    if (action === 'edit') {
      setIsEditing(true);
    } else if (action === 'approval') {
      setShowApprovalModal(true);
    } else if (action === 'ex-members') {
      setShowExMembersModal(true);
    }
  };

  const handleApprove = (id: number) => {
    console.log(`${id}번 인증을 승인했습니다.`);
    alert(`${id}번 인증이 승인되었습니다.`);
    setShowApprovalModal(false);
  };

  const handleReject = (id: number) => {
    console.log(`${id}번 인증을 거절했습니다.`);
    alert(`${id}번 인증이 거절되었습니다.`);
    setShowApprovalModal(false);
  };



  return (
   
   <div
      className= "min-h-screen relative">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-b-[var(--color-border-bottom-custom)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-1"
            >
              <ArrowLeft className="h-5 w-5 text-icon-secondary dark:text-white" />
            </Button>
            <h1 className="font-bold text-card-foreground">그룹 상세</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-card-foreground hover:text-card-foreground"
            >
              
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-card-foreground hover:text-card-foreground"
                >
                  <Settings className="h-4 w-4 icon-secondary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleMenuClick('edit')}>
                  그룹 정보 편집
                </DropdownMenuItem>
                {group.type === '의무참여' && isLeader && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleMenuClick('approval')}>
                      인증 승인 / 반려
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleMenuClick('ex-members')}>
                  멤버 내보내기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-card-foreground">
                  {group.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {group.description}
                </p>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="font-bold text-card-foreground">
                    {group.members}
                  </div>
                  <div className="text-xs text-muted-foreground">참여자</div>
                </div>
                <div className="text-center">
                  <Badge
                    variant={
                      group.type === '의무참여' ? 'destructive' : 'secondary'
                    }
                  >
                    {group.type}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    그룹 유형
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-card-foreground">
                    {group.time}
                  </div>
                  <div className="text-xs text-muted-foreground">인증 시간</div>
                </div>
              </div>

              {!isJoined ? (
                <Button onClick={handleJoinGroup} className="w-full">
                  그룹 참여하기
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleChatClick} className="flex-1">
                    <MessageCircle className="h-4 w-4 mr-2 icon-primary" />
                    채팅
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-card-foreground border-border hover:bg-accent hover:text-card-foreground"
                  >
                    인증하기
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                        onClick={() => handleMemberClick(member)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback className="text-xs">
                                {member.name[0]}
                              </AvatarFallback>
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
                            <div className="text-xs text-left text-muted-foreground">
                              {member.score}점
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* 인증 상태에 따라 뱃지 표시 */}
                          <Badge
                            variant={member.isCertified ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {member.isCertified ? '인증' : '미인증'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            #{member.rank}
                          </Badge>
                        </div>
                      </div>
                      {index < members.length - 1 && (
                        <div className="border-b border-border/50 mx-3"></div>
                      )}
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
                          <div className={`w-2 h-2 rounded-full ${
                            item.change === 'up' ? 'bg-green-500' : item.change === 'down' ? 'bg-red-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                      </div>
                      {index < weeklyRanking.length - 1 && (
                        <div className="h-2"></div>
                      )}
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
                          <AvatarFallback className="text-xs">
                            {activity.user[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm">
                            <span className="font-medium text-card-foreground">{activity.user}</span>
                            <span className="text-muted-foreground"> {activity.action}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{activity.time}</div>
                        </div>
                      </div>
                      {index < recentActivities.length - 1 && (
                        <div className="h-2"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <GroupEdit
        open={isEditing}
        onOpenChange={setIsEditing}
        group={group}
      />

      <GroupMemberManager
        open={showExMembersModal}
        onOpenChange={setShowExMembersModal}
        members={members}
        onKickMember={handleKickMember}
      />

      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-md text-icon-secondary dark:text-white">
          <GroupApproval
            authMessages={authMessages}
            onApprove={handleApprove}
            onReject={handleReject}
            onClose={() => setShowApprovalModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}