import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogOverlay,DialogClose } from './ui/dialog';
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
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';
import { GroupMemberManager } from './GroupMemberManager'; // <-- 1. GroupMemberManager 컴포넌트 임포트

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
  const [editFormData, setEditFormData] = useState({
    name: group.name,
    description: group.description,
    category: 'sports',
    type: group.type,
    maxMembers: group.maxMembers,
    hasAlarm: true,
    alarmTime: '07:00',
  });
  const [errors, setErrors] = useState<any>({});

  // <-- 2. 멤버 목록을 useState로 변경하여 동적으로 관리
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
    },
  ]);
  
  // onKickMember 함수 추가
  const handleKickMember = (memberId: string) => {
    setMembers(members.filter(member => member.id !== memberId));
    alert('멤버를 그룹에서 내보냈습니다.');
    setShowExMembersModal(false); // 모달 닫기
  };
  
  // 기존에 있던 exMembers 배열은 이제 필요하지 않아 제거했습니다.
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

  const categories = [
    { id: 'sports', name: '운동', emoji: '💪', description: '체력을 기르고 활기찬 하루를 만들어보세요', hoverColor: 'hover:bg-green-100/70' },
    { id: 'study', name: '학습', emoji: '📚', description: '새로운 지식을 배우며 자기계발을 이루세요', hoverColor: 'hover:bg-blue-100/70' },
    { id: 'health', name: '건강', emoji: '🍎', description: '규칙적인 습관으로 건강을 관리하세요', hoverColor: 'hover:bg-red-100/70' },
    { id: 'hobby', name: '취미', emoji: '🎨', description: '새로운 취미를 발견하고 즐거움을 찾아보세요', hoverColor: 'hover:bg-purple-100/70' },
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

  const currentUser = { id: '1', name: '김루틴' }; // id를 string으로 변경
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

  const handleSave = () => {
    console.log('수정된 그룹 정보:', editFormData);
    alert('그룹 정보가 성공적으로 수정되었습니다.');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditFormData({
      name: group.name,
      description: group.description,
      category: 'sports',
      type: group.type,
      maxMembers: group.maxMembers,
      hasAlarm: true,
      alarmTime: '07:00',
    });
  };

  if (isEditing) {
    return (
      <div className="h-full flex flex-col p-4 bg-background">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="p-1 text-icon-secondary dark:text-white"
            >
              <ArrowLeft className="h-5 w-5 icon-secondary" />
            </Button>
            <div>
              <h1 className="text-lg font-medium text-card-foreground">그룹 편집</h1>
              <p className="text-sm text-icon-secondary dark:text-white">그룹 정보를 수정하세요</p>
            </div>
          </div>
          <Button onClick={handleSave} size="sm">
            저장
          </Button>
        </div>

        <div className="flex-1 overflow-auto space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-card-foreground flex items-center space-x-2">
                <Target className="h-4 w-4 icon-accent" />
                <span>기본 정보</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName" className="text-card-foreground">그룹 이름</Label>
                <Input
                  id="groupName"
                  placeholder="그룹 이름을 입력하세요"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  maxLength={30}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {editFormData.name.length}/30
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupDescription" className="text-card-foreground">그룹 설명</Label>
                <Textarea
                  id="groupDescription"
                  placeholder="그룹에 대한 설명을 입력하세요"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="bg-input-background border-border text-foreground resize-none h-20"
                  maxLength={100}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {editFormData.description.length}/100
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">카테고리</Label>
                <Select value={editFormData.category} onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}>
                  <SelectTrigger className="bg-input-background border-border text-foreground">
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className={`transition-colors ${category.hoverColor}`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{category.emoji}</span>
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-xs text-muted-foreground">{category.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-card-foreground flex items-center space-x-2">
                <Users className="h-4 w-4 icon-accent" />
                <span>그룹 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-card-foreground">참여 유형</Label>
                <RadioGroup
                  value={editFormData.type}
                  onValueChange={(value) => setEditFormData({ ...editFormData, type: value })}
                  className="space-y-3"
                >
                  <Label
                    htmlFor="optional"
                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-green-100/70 hover:text-green-800 hover:border-green-300/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value="자유참여" id="optional" className="mt-1" />
                    <div className="flex flex-1 items-start justify-between">
                      <div className="flex flex-col items-start">
                        <div className="text-card-foreground font-medium">자유참여</div>
                        <p className="text-xs text-muted-foreground mt-1">언제든 자유롭게 참여할 수 있습니다</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">추천</Badge>
                    </div>
                  </Label>

                  <Label
                    htmlFor="mandatory"
                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-red-100/70 hover:text-red-800 hover:border-red-300/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value="의무참여" id="mandatory" className="mt-1" />
                    <div className="flex flex-1 items-start justify-between">
                      <div className="flex flex-col items-start">
                        <div className="text-card-foreground font-medium">의무참여</div>
                        <p className="text-xs text-muted-foreground mt-1">정해진 시간에 반드시 참여해야 합니다</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">엄격</Badge>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMembers" className="text-card-foreground">최대 인원</Label>
                <Select value={editFormData.maxMembers} onValueChange={(value) => setEditFormData({ ...editFormData, maxMembers: value })}>
                  <SelectTrigger className="bg-input-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10명</SelectItem>
                    <SelectItem value="20">20명</SelectItem>
                    <SelectItem value="30">30명</SelectItem>
                    <SelectItem value="50">50명</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-card-foreground flex items-center space-x-2">
                <Clock className="h-4 w-4 icon-accent" />
                <span>알림 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-card-foreground font-medium">매일 알림</Label>
                  <p className="text-xs text-muted-foreground">정해진 시간에 루틴 알림을 받습니다</p>
                </div>
                <Switch
                  checked={editFormData.hasAlarm}
                  onCheckedChange={(checked) => setEditFormData({ ...editFormData, hasAlarm: checked })}
                />
              </div>

              {editFormData.hasAlarm && (
                <div className="space-y-2">
                  <Label htmlFor="alarmTime" className="text-card-foreground">알림 시간</Label>
                  <Input
                    id="alarmTime"
                    type="time"
                    value={editFormData.alarmTime}
                    onChange={(e) => setEditFormData({ ...editFormData, alarmTime: e.target.value })}
                    className="bg-input-background border-border text-foreground"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen relative ${
        showExMembersModal || showApprovalModal ? 'bg-transparent' : 'bg-background'
      }`}
    > 
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
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
              <Share className="h-4 w-4 icon-secondary" />
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
                        <Badge variant="outline" className="text-xs">
                          #{member.rank}
                        </Badge>
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

      {/* <-- 3. 탈퇴한 멤버 모달 코드 대신 GroupMemberManager 컴포넌트를 렌더링 */}
      <GroupMemberManager
        open={showExMembersModal}
        onOpenChange={setShowExMembersModal}
        members={members}
        onKickMember={handleKickMember}
      />
    
      {/* 인증 승인 모달 */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
      
        <DialogContent className="bg-background/80 max-w-md text-icon-secondary dark:text-white">
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
