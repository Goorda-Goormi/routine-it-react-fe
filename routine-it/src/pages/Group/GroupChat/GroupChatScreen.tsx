import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { ArrowLeft, CheckCircle, Users } from 'lucide-react';
import { getStreakInfo } from '../../../components/utils/streakUtils';
import { GroupRoutineDialog } from './GroupRoutineDialog';
import { GroupChatMessages } from './GroupChatMessages';
import  {GroupChatInput}  from './GroupChatInput';
import { leaveGroup } from '../../../api/chat';
import type { Group, UserProfile, GroupMemberResponse } from '../../../interfaces';

interface GroupChatScreenProps {
  group: Group;
  groupmembers: GroupMemberResponse[];
  onBack: () => void;
  onAddAuthMessage: (groupId: number, data: any, nickname: string, userId: number, routineId: number) => void;
  onLeaveGroup: () => void;
  userInfo: UserProfile;
}

export interface Message {
  id: number;
  nickname: string;
  userId: number;
  message: string;
  time: string;
  isMe: boolean;
  type: 'text' | 'auth' | 'image' | 'album';
  reactions?: { [key: string]: number };
  imageUrl?: string;
  albumImages?: string[];
}

export function GroupChatScreen({ group, groupmembers, onBack, onAddAuthMessage, onLeaveGroup, userInfo }: GroupChatScreenProps) {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);

  const myUserId = userInfo.id;
  const myNickname = userInfo.nickname;

  /*const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      nickname: '루티니',
      userId: 1,
      message: '오늘도 운동 완료! 💪',
      time: '14:32',
      isMe: false,
      type: 'text',
      reactions: { '👍': 1, '🔥': 2 },
    },
    {
      id: 2,
      nickname: '나',
      userId: 2,
      message: '저도 방금 끝냈어요! 같이 운동하니까 더 동기부여 되는 것 같아요',
      time: '14:35',
      isMe: false,
      type: 'text',
      reactions: { '👏': 1 },
    },
    {
      id: 3,
      nickname: '관습박',
      userId: 3,
      message: '다들 대단하시네요! 저는 내일부터 시작할게요 😅',
      time: '14:40',
      isMe: false,
      type: 'text',
      reactions: {},
    },
  ]);*/
 const [messages, setMessages] = useState<Message[]>([]);
  const handleDeleteGroup = async () => {
    if (!window.confirm("정말로 이 그룹에서 나가시겠습니까?")) {
      return;
    }

    try {
      await leaveGroup(group.groupId);
      alert("성공적으로 그룹에서 탈퇴했습니다.");
      onLeaveGroup();
    } catch (error) {
      console.error("그룹 탈퇴 오류:", error);
      alert("그룹 탈퇴에 실패했습니다.");
    }
  };

  const handleSendMessage = (text: string) => {
    if (text.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        nickname: myNickname,
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
      nickname: myNickname,
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
      nickname: myNickname,
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

  const handleAuthSubmit = (data: { description: string; image: File | null; isPublic: boolean }) => {
    const authMessage: Message = {
      id: Date.now(),
      nickname: myNickname,
      userId: myUserId,
      message: data.description,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'auth',
      reactions: {},
    };
    setMessages((prevMessages) => [...prevMessages, authMessage]);
    
    const routineId = group.routines?.[0]?.id || 0;
    onAddAuthMessage(group.groupId, data, myNickname, myUserId, routineId);
    
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

  const getUserInfo = (userId: number): UserProfile | undefined => {
    const member = groupmembers.find((member) => member.groupMemberId === userId);
    if (!member) return undefined;
    
    return {
      id: member.groupMemberId,
      nickname: member.memberName,
      profileImageUrl: 'default_image_url',
      streakDays: 0,
    };
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
            <h1 className="font-bold text-base text-card-foreground line-clamp-2">{group.groupName}</h1>
            <p className="text-xs text-muted-foreground">{group.currentMemberCount}명 참여 중</p>
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
                  <DialogDescription>{group.groupName} 참여 멤버</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {Array.isArray(groupmembers) && groupmembers.length > 0 ? (
                    groupmembers.map((member) => {
                      const isMe = member.memberName === myNickname;
                      const memberProfileImage = isMe ? userInfo.profileImageUrl : '';
                     // const streakInfo = isMe ? getStreakInfo(userInfo.streakDays) : null;
                     
                      console.log("그룹 채팅 member",member);
                      
                      console.log("그룹 채팅 group: " ,group)
                      return (
                        <div key={member.groupMemberId} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={memberProfileImage} alt={member.memberName} />
                            <AvatarFallback className="text-sm">{member.memberName}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                           {/* <div className="flex items-center space-x-2">
                              {isMe && <span className="text-lg">{streakInfo.icon}</span>}
                              <span className="text-sm font-medium text-card-foreground">{member.memberName}</span>
                              {isMe && <span className="text-xs text-muted-foreground">(나)</span>}
                            </div>
                            {isMe && (
                              <div className="text-xs text-muted-foreground">
                                {userInfo.streakDays}일 연속 • {streakInfo.stage}
                              </div>
                            )}*/}
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-card-foreground">{member.memberName}</span>
                              {isMe && <span className="text-xs text-muted-foreground">(나)</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-muted-foreground">그룹 멤버를 불러오는 중입니다...</p>
                  )}
                </div>
                <div className="border-t pt-4 mt-4">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleDeleteGroup}
                  >
                    그룹 나가기
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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

      <GroupChatMessages messages={messages} myUserId={myUserId} getUserInfo={getUserInfo} handleReactionClick={handleReactionClick} />

      <GroupChatInput handleSendMessage={handleSendMessage} handleSendImage={handleSendImage} handleSendAlbum={handleSendAlbum} />
      
      <GroupRoutineDialog
        isOpen={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        onAuthSubmit={handleAuthSubmit}
        isMandatory={group.groupType === 'REQUIRED'}
        selectedRoutine={group.routines?.[0] || null}
      />
    </div>
  );
}