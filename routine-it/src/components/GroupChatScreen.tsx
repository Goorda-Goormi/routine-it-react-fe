import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Send, Image, Smile, Camera, CheckCircle, Users } from 'lucide-react';
import { getStreakInfo } from './utils/streakUtils';
//import { Field, Switch } from '@chakra-ui/react';

interface GroupChatScreenProps {
  group: any;
  onBack: () => void;
}

interface User {
  id: number;
  name: string;
  avatar?: string;
  streakDays: number;
}

interface Message {
  id: number;
  user: string;
  userId: number;
  message: string;
  time: string;
  isMe: boolean;
  type: 'text' | 'auth';
  reactions?: { [key: string]: number }; // 이모티콘 반응을 저장할 객체
}

export function GroupChatScreen({ group, onBack }: GroupChatScreenProps) {
  const [message, setMessage] = useState('');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [authData, setAuthData] = useState({
    description: '',
    image: null as File | null,
    isPublic: true, // 기본값은 공개로 설정
  });
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);

  const myUserId = 2; // '나'의 userId를 상수로 정의

  // 그룹 멤버 데이터 (연속 출석일 포함)
  const groupMembers: User[] = [
    { 
      id: 1, 
      name: '김루틴', 
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      streakDays: 45 
    },
    { 
      id: myUserId, // '나'의 id
      name: '나', 
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      streakDays: 28 
    },
    { 
      id: 3, 
      name: '박습관', 
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b95fcebf?w=40&h=40&fit=crop&crop=face',
      streakDays: 3 
    },
    { 
      id: 4, 
      name: '이지속', 
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      streakDays: 120 
    },
    { 
      id: 5, 
      name: '최성실', 
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      streakDays: 8 
    }
  ];
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      user: '김루틴',
      userId: 1,
      message: '오늘도 운동 완료! 💪',
      time: '14:32',
      isMe: false,
      type: 'text',
      reactions: { '👍': 1, '🔥': 2 }
    },
    {
      id: 2,
      user: '나',
      userId: 2,
      message: '저도 방금 끝냈어요! 같이 운동하니까 더 동기부여 되는 것 같아요',
      time: '14:35',
      isMe: true,
      type: 'text',
      reactions: { '👏': 1 }
    },
    {
      id: 3,
      user: '박습관',
      userId: 3,
      message: '다들 대단하시네요! 저는 내일부터 시작할게요 😅',
      time: '14:40',
      isMe: false,
      type: 'text',
      reactions: {}
    },
    {
      id: 4,
      user: '이지속',
      userId: 4,
      message: '화이팅! 함께하면 더 오래 지속할 수 있어요',
      time: '14:42',
      isMe: false,
      type: 'text',
      reactions: { '🎉': 1, '💪': 1 }
    },
    {
      id: 5,
      user: '최성실',
      userId: 5,
      message: '오늘 첫 운동이에요! 긴장되네요 ㅎㅎ',
      time: '14:45',
      isMe: false,
      type: 'text',
      reactions: {}
    }
  ]);

  // 이모티콘 목록
  const emojis = ['😀', '😂', '👍', '❤️', '👏', '💪', '🎉', '🔥', '🤔', '😊', '😭', '😎', '👌', '🙏', '🤯'];

  // 사용자 정보 가져오기
  const getUserInfo = (userId: number): User => {
    return groupMembers.find(member => member.id === userId) || groupMembers[1];
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        user: '나',
        userId: myUserId,
        message: message.trim(),
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        type: 'text',
        reactions: {}
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleSubmitAuth = () => {
    if (authData.description.trim()) {
      const authMessage: Message = {
        id: messages.length + 1,
        user: '나',
        userId: myUserId,
        message: authData.description,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        type: 'auth',
        reactions: {}
      };
      setMessages([...messages, authMessage]);
      setAuthData({ description: '', image: null });
      setIsAuthDialogOpen(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAuthData({ ...authData, image: file });
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage(prevMessage => prevMessage + emoji);
  };
  
  const handleReactionClick = (messageId: number, emoji: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          const newReactions = { ...msg.reactions };
          // 이미 누른 이모티콘이면 개수 감소
          if (newReactions[emoji] && newReactions[emoji] > 0) {
            newReactions[emoji]--;
            // 개수가 0이 되면 객체에서 제거
            if (newReactions[emoji] === 0) {
              delete newReactions[emoji];
            }
          } else {
            // 처음 누르는 이모티콘이면 개수 증가
            newReactions[emoji] = (newReactions[emoji] || 0) + 1;
          }
          return { ...msg, reactions: newReactions };
        }
        return msg;
      })
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4 ">
        <div className="mx-auto flex items-center justify-between">
          <div className="flex-1 flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-1 text-card-foreground hover:text-card-foreground">
              <ArrowLeft className="h-5 w-5 icon-secondary" />
            </Button>
            <div className="flex-1" />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-base text-card-foreground line-clamp-2">{group.name}</h1>
            <p className="text-xs text-muted-foreground">{group.members}명 참여 중</p>
          </div>
          <div className="flex-1 flex items-center justify-end space-x-2">
            <div className="flex-1" />
            <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-card-foreground hover:text-card-foreground ">
                  <Users className="h-4 w-4 icon-secondary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-card-foreground">그룹 멤버</DialogTitle>
                  <DialogDescription>{group.name} 참여 멤버들의 연속 출석 현황</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {groupMembers.map((member) => {
                    const streakInfo = getStreakInfo(member.streakDays);
                    return (
                      <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="text-sm">{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{streakInfo.icon}</span>
                            <span className="text-sm font-medium text-card-foreground">{member.name}</span>
                            {member.name === '나' && (<span className="text-xs text-muted-foreground">(나)</span>)}
                          </div>
                          <div className="text-xs text-muted-foreground">{member.streakDays}일 연속 • {streakInfo.stage}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-green-400 hover:bg-green-500 text-icon-secondary dark:text-white">
                  <CheckCircle className="h-4 w-4 mr-1 text-icon-secondary dark:text-white " />
                  인증하기
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm mx-auto dark:text-white">
                <DialogHeader>
                  <DialogTitle className="text-card-foreground">루틴 인증하기</DialogTitle>
                  <DialogDescription>오늘의 루틴 수행 내용을 그룹 멤버들과 공유해주세요.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description" className="text-card-foreground">인증 내용</Label>
                    <Textarea
                      id="description"
                      placeholder="오늘의 루틴 수행 내용을 적어주세요"
                      value={authData.description}
                      onChange={(e) => setAuthData({...authData, description: e.target.value})}
                      rows={3}
                      className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image" className="text-card-foreground">사진 첨부 (선택)</Label>
                    <div className="mt-2">
                      <input type="file" id="image" accept="image/*" onChange={handleImageSelect} className="hidden" />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full text-card-foreground border-border hover:bg-accent hover:text-card-foreground"
                        onClick={() => document.getElementById('image')?.click()}
                      >
                        <Camera className="h-4 w-4 mr-2 icon-secondary" />
                        {authData.image ? authData.image.name : '사진 선택'}
                      </Button>
                    </div>
                  </div>

<div className="flex items-center space-x-2">
  <input
    type="checkbox"
    id="is-public"
    checked={authData.isPublic}
    onChange={(e) => setAuthData({...authData, isPublic: e.target.checked})}
    className="form-checkbox h-4 w-4 text-green-600 rounded"
  />
  <Label htmlFor="is-public" className="text-sm font-medium text-card-foreground">
    {authData.isPublic ? '전체 공개' : '나만 보기'}
  </Label>
</div>

                  <Button 
                    onClick={handleSubmitAuth} 
                    className="w-full bg-green-600 hover:bg-green-700 text-gray-700"
                    disabled={!authData.description.trim()}
                  >
                    인증 완료
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          {messages.map((msg) => {
            const userInfo = getUserInfo(msg.userId);
            const streakInfo = getStreakInfo(userInfo.streakDays);
            
            const isMyMessage = msg.userId === myUserId;

            return (
              <div
                key={msg.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                <div className={`relative flex items-end space-x-2 max-w-[80%] ${isMyMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isMyMessage && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={userInfo.avatar} alt={msg.user} />
                      <AvatarFallback className="text-xs">{msg.user[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                    {!isMyMessage && (
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-sm">{streakInfo.icon}</span>
                        <span className="text-xs text-muted-foreground">{msg.user}</span>
                        <span className="text-xs text-muted-foreground opacity-70">{userInfo.streakDays}일</span>
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 max-w-full break-words ${
                        msg.type === 'auth' 
                          ? 'bg-green-50/80 border border-green-200/50 dark:bg-green-900/20 dark:border-green-700/50'
                          : isMyMessage
                          ? 'bg-chart-5 text-primary'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {msg.type === 'auth' && (
                        <div className="flex items-center space-x-1 mb-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">루틴 인증</span>
                        </div>
                      )}
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    {/* 메시지 반응 표시 */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex space-x-1 mt-1">
                        {Object.entries(msg.reactions).map(([emoji, count]) => (
                          <div key={emoji} className="flex items-center text-xs p-1 rounded-full bg-secondary text-secondary-foreground">
                            <span>{emoji}</span>
                            <span className="ml-1">{count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground mt-1">{msg.time}</span>
                  </div>

                  {/* 마우스 호버 시 이모티콘 버튼 */}
                  {hoveredMessageId === msg.id && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`absolute bottom-0 p-1 w-6 h-6 rounded-full bg-background/90 text-card-foreground hover:bg-card hover:text-card-foreground border border-border transition-opacity duration-200 z-10 ${isMyMessage ? 'left-[-1rem]' : 'right-[-1rem]'}`}
                        >
                          <Smile className="w-4 h-4 icon-secondary" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="p-2 w-auto min-w-[150px] bg-background/95 backdrop-blur border-border" 
                        align="start" 
                        side="top" 
                        sideOffset={10}
                      >
                        <div className="grid grid-cols-5 gap-1 text-2xl">
                          {emojis.map((emoji, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              className="text-2xl p-1 h-8 w-8"
                              onClick={() => handleReactionClick(msg.id, emoji)}
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 메시지 입력 */}
      <div className="sticky bottom-0 border-t border-border dark:border-white bg-background">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 bg-muted rounded-lg p-2">
                <Button variant="ghost" size="sm" className="p-1 text-card-foreground hover:text-card-foreground">
                  <Image className="h-4 w-4 icon-secondary" />
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="border-0 bg-transparent focus-visible:ring-0 p-0 text-foreground placeholder:text-muted-foreground"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-1 text-card-foreground hover:text-card-foreground">
                      <Smile className="h-4 w-4 icon-secondary" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="p-2 bg-background/95 backdrop-blur border-border" 
                    align="end" 
                    side="top"
                    sideOffset={10}
                  >
                    <div className="grid grid-cols-5 gap-2 w-full">
                      {emojis.map((emoji, index) => (
                        <Button 
                          key={index}
                          variant="ghost" 
                          className="text-2xl p-1 h-10 w-10" 
                          onClick={() => handleEmojiClick(emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button 
              onClick={handleSendMessage}
              className="rounded-full p-2 h-10 w-10"
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4 icon-primary" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}