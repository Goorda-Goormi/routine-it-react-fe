import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { ArrowLeft, CheckCircle, Users } from 'lucide-react';
import { getStreakInfo } from '../../../components/utils/streakUtils';
import { GroupRoutineDialog } from './GroupRoutineDialog';
import { GroupChatMessages } from './GroupChatMessages';
import { GroupChatInput } from './GroupChatInput';
import type { User } from '../../../interfaces';

interface GroupChatScreenProps {
  group: any;
  onBack: () => void;
  onAddAuthMessage: (groupId: number, data: any, userName: string, userId: string | number, routineId: number) => void;
}


export interface Message {
  id: number;
  user: string;
  userId: number;
  message: string;
  time: string;
  isMe: boolean;
  type: 'text' | 'auth' | 'image' | 'album';
  reactions?: { [key: string]: number };
  imageUrl?: string;
  albumImages?: string[];
}

export function GroupChatScreen({ group, onBack, onAddAuthMessage }: GroupChatScreenProps) {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);

  const myUserId = 2; // '나'의 userId를 상수로 정의

  // 그룹 멤버 데이터
  const groupMembers: User[] = [
    {
      id: 1,
      name: '김루틴',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      streakDays: 45,
    },
    {
      id: myUserId, // '나'의 id
      name: '나',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      streakDays: 28,
    },
    {
      id: 3,
      name: '박습관',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b95fcebf?w=40&h=40&fit=crop&crop=face',
      streakDays: 3,
    },
    {
      id: 4,
      name: '이지속',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      streakDays: 120,
    },
    {
      id: 5,
      name: '최성실',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      streakDays: 8,
    },
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
      reactions: { '👍': 1, '🔥': 2 },
    },
    {
      id: 2,
      user: '나',
      userId: 2,
      message: '저도 방금 끝냈어요! 같이 운동하니까 더 동기부여 되는 것 같아요',
      time: '14:35',
      isMe: true,
      type: 'text',
      reactions: { '👏': 1 },
    },
    {
      id: 3,
      user: '박습관',
      userId: 3,
      message: '다들 대단하시네요! 저는 내일부터 시작할게요 😅',
      time: '14:40',
      isMe: false,
      type: 'text',
      reactions: {},
    },
    {
      id: 4,
      user: '이지속',
      userId: 4,
      message: '화이팅! 함께하면 더 오래 지속할 수 있어요',
      time: '14:42',
      isMe: false,
      type: 'text',
      reactions: { '🎉': 1, '💪': 1 },
    },
    {
      id: 5,
      user: '최성실',
      userId: 5,
      message: '오늘 첫 운동이에요! 긴장되네요 ㅎㅎ',
      time: '14:45',
      isMe: false,
      type: 'text',
      reactions: {},
    },
  ]);

  const handleSendMessage = (text: string) => {
    if (text.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        user: '나',
        userId: myUserId,
        message: text.trim(),
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        type: 'text',
        reactions: {},
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }
  };

  const handleSendImage = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    const newMessage: Message = {
      id: Date.now(),
      user: '나',
      userId: myUserId,
      message: '',
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'image',
      reactions: {},
      imageUrl,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleSendAlbum = (files: FileList) => {
    const imageUrls = Array.from(files).map((file) => URL.createObjectURL(file));

    const newMessage: Message = {
      id: Date.now(),
      user: '나',
      userId: myUserId,
      message: '',
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'album',
      reactions: {},
      albumImages: imageUrls,
    };

    setMessages((prev) => [...prev, newMessage]);
  };
  const myUserName = '나';
   const handleAuthSubmit = (data: { description: string; image: File | null; isPublic: boolean }) => {
    // 1. 그룹 채팅에 바로 표시할 메시지 추가
    const authMessage: Message = {
      id: Date.now(),
      user: myUserName,
      userId: myUserId,
      message: data.description,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'auth',
      reactions: {},
    };
    setMessages((prevMessages) => [...prevMessages, authMessage]);
     
    const routineId = group.routines?.[0]?.id || 0;
    // 2. props로 받은 onAddAuthMessage 함수를 호출하여 필요한 모든 데이터를 전달
    onAddAuthMessage(group.id, data, myUserName, myUserId, routineId);
    
    setIsAuthDialogOpen(false);
  };

  const handleReactionClick = (messageId: number, emoji: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === messageId) {
          const newReactions = { ...msg.reactions };
          if (newReactions[emoji] && newReactions[emoji] > 0) {
            newReactions[emoji]--;
            if (newReactions[emoji] === 0) {
              delete newReactions[emoji];
            }
          } else {
            newReactions[emoji] = (newReactions[emoji] || 0) + 1;
          }
          return { ...msg, reactions: newReactions };
        }
        return msg;
      })
    );
  };

  const getUserInfo = (userId: number): User => {
    return groupMembers.find((member) => member.id === userId) || groupMembers[1];
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-b-[var(--color-border-bottom-custom)] p-4">
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
          <div className="flex-1 flex items-center justify-end space-x-2 text-icon-secondary dark:text-white">
            <div className="flex-1" />
            <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-card-foreground hover:text-card-foreground">
                  <Users className="h-4 w-4 icon-secondary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm mx-auto text-icon-secondary">
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
                            {member.id === myUserId && <span className="text-xs text-muted-foreground">(나)</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.streakDays}일 연속 • {streakInfo.stage}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-4 mt-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    // 실제 그룹 나가기 로직을 여기에 구현
                    // onBack 함수를 호출하여 이전 화면(그룹 목록)으로 돌아갑니다.
                    onBack();
                  }}
                >
                  그룹 나가기
                </Button>
              </div>
              </DialogContent>
            </Dialog>
            {/* 인증하기 버튼 */}
            <Button
              size="sm"
              className="bg-green-400 hover:bg-green-500 text-icon-secondary dark:text-white"
              onClick={() => setIsAuthDialogOpen(true)}
            >
              <CheckCircle className="h-4 w-4 mr-1 text-icon-secondary dark:text-white " />
              인증하기
            </Button>
          </div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <GroupChatMessages messages={messages} myUserId={myUserId} getUserInfo={getUserInfo} handleReactionClick={handleReactionClick} />

      {/* 메시지 입력 */}
      <GroupChatInput handleSendMessage={handleSendMessage} handleSendImage={handleSendImage} handleSendAlbum={handleSendAlbum} />
      
      {/* GroupRoutineDialog 모달을 조건부 렌더링 */}
       <GroupRoutineDialog 
       isOpen={isAuthDialogOpen} 
       onOpenChange={setIsAuthDialogOpen} 
       onAuthSubmit={handleAuthSubmit}
       isMandatory={group.isMandatory}
       selectedRoutine={group.routines?.[0] || null} 
       />
    </div>
  );
}