// GroupChatScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { ArrowLeft, CheckCircle, Users } from 'lucide-react';

import { GroupRoutineDialog } from './GroupRoutineDialog';
import { GroupChatMessages } from './GroupChatMessages';
import { GroupChatInput } from './GroupChatInput';
import { leaveGroup } from '../../../api/chat';

import type { Group, UserProfile, GroupMemberResponse } from '../../../interfaces';

// 👉 API 기본 URL, WS 연결 URL
export const BASE_URL = "http://54.180.93.1:8080";
const WS_CONNECTION_URL = `${BASE_URL}/ws`;

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

export function GroupChatScreen({ group, groupmembers, onBack, onAddAuthMessage, onLeaveGroup, userInfo }) {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const stompClientRef = useRef<Client | null>(null);

  const myUserId = userInfo.id;
  const myNickname = userInfo.nickname;
  const roomId = group.groupId; // 그룹 채팅방 ID

  // 🔌 웹소켓 연결
  useEffect(() => {
    const socket = new SockJS(WS_CONNECTION_URL);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
      },
      debug: (str) => console.log(str),
      reconnectDelay: 5000, // 재연결 5초
      onConnect: () => {
        console.log('✅ STOMP 연결 성공');

        // 구독
        stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
          const body = JSON.parse(message.body);

          const newMsg: Message = {
            id: Date.now(),
            nickname: body.nickname,
            userId: body.userId,
            message: body.message,
            time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            isMe: body.userId === myUserId,
            type: 'text',
            reactions: {},
          };
          setMessages((prev) => [...prev, newMsg]);
        });

        // 온라인 신호
        stompClient.publish({
          destination: `/app/chat/${roomId}/online`,
          body: JSON.stringify({ userId: myUserId, nickname: myNickname }),
        });
      },
      onStompError: (frame) => {
        console.error('❌ STOMP 오류:', frame);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, [roomId, myUserId, myNickname]);

  // ✉️ 메시지 보내기
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const msgBody = {
      userId: myUserId,
      nickname: myNickname,
      message: text,
      type: 'text',
    };

    stompClientRef.current?.publish({
      destination: `/app/chat/${roomId}/send`,
      body: JSON.stringify(msgBody),
    });
  };

  // 🖼️ 이미지 보내기 (로컬 프리뷰 + 서버 전송 필요하면 백엔드 맞춤)
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
    setMessages((prev) => [...prev, newMessage]);
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

  const handleDeleteGroup = async () => {
    if (!window.confirm("정말로 이 그룹에서 나가시겠습니까?")) return;
    try {
      await leaveGroup(group.groupId);
      alert("성공적으로 그룹에서 탈퇴했습니다.");
      onLeaveGroup();
    } catch (error) {
      console.error("그룹 탈퇴 오류:", error);
      alert("그룹 탈퇴에 실패했습니다.");
    }
  };

  const handleReactionClick = (messageId: number, emoji: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === messageId) {
          const newReactions = { ...msg.reactions };
          if (newReactions[emoji]) {
            newReactions[emoji]--;
            if (newReactions[emoji] === 0) delete newReactions[emoji];
          } else {
            newReactions[emoji] = 1;
          }
          return { ...msg, reactions: newReactions };
        }
        return msg;
      })
    );
  };

  const getUserInfo = (userId: number): UserProfile | undefined => {
    const member = groupmembers.find((m) => m.groupMemberId === userId);
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
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
        <div className="mx-auto flex items-center justify-between">
          <div className="flex-1 flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-base">{group.groupName}</h1>
            <p className="text-xs text-muted-foreground">{group.currentMemberCount}명 참여 중</p>
          </div>
          <div className="flex-1 flex items-center justify-end space-x-2">
            <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm mx-auto">
                <DialogHeader>
                  <DialogTitle>그룹 멤버</DialogTitle>
                  <DialogDescription>{group.groupName} 참여 멤버</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {groupmembers.map((member) => {
                    const isMe = member.memberName === myNickname;
                    return (
                      <div key={member.groupMemberId} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={isMe ? userInfo.profileImageUrl : ''} alt={member.memberName} />
                          <AvatarFallback>{member.memberName}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{member.memberName}</span>
                            {isMe && <span className="text-xs text-muted-foreground">(나)</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-4 mt-4">
                  <Button variant="destructive" className="w-full" onClick={handleDeleteGroup}>
                    그룹 나가기
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm" className="bg-green-400 hover:bg-green-500" onClick={() => setIsAuthDialogOpen(true)}>
              <CheckCircle className="h-4 w-4 mr-1" />
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
