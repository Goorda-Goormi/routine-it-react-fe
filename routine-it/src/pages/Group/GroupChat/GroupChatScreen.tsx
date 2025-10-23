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
import { updateRankingScore } from '../../../api/ranking'; 
import { createGroupActivity } from '../../../api/activity';
import type { Group, UserProfile, GroupMemberResponse } from '../../../interfaces';
import { fetchChatHistory, fetchMessageReactions, addMessageReaction, removeMessageReaction } from '../../../api/chat';
import { requestAuthApproval, getGroupMembers, deleteGroup,leaveGroupSelf } from '../../../api/group';
import { getUserProfile } from '../../../api/user';
import { presignGet, presignGroupRoomPut, uploadFileToS3, getContentTyp,presignProofShotPut,getContentType } from '../../../api/storage';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://15.164.98.221:8080";
const WS_CONNECTION_URL = `${BASE_URL}/ws`;

export interface ReactionData {
  emoji: string;      
  count: number;     
  userIds: number[]; 
}

export interface Message {
  id: number | null;
  roomId: number;
  userId: number;
  senderNickname: string;
  message: string | null;
  imageUrl: string | null;
  messageType: 'TALK' | 'AUTH' | 'NOTICE' | 'IMAGE' | 'ALBUM' | 'ONLINE' | 'OFFLINE' | 'MEMBER_JOIN' | 'MEMBER_LEAVE';
  sentAt: string | null;
  isMe: boolean;
  
  reactions?: Record<string, ReactionData>; 
  
  albumImages?: string[];
}

export function GroupChatScreen({ group, groupmembers, onBack, onLeaveGroup, userInfo, onDataRefresh, onGroupRoutineComplete, onUpdateMessages,onDeleteGroupSuccess }: {
  group: Group;
  groupmembers: Array<{ userId: number; groupMemberId: number; memberName: string; profileImageUrl: string; role?: string;}>;
  onBack: () => void;
  onLeaveGroup: (groupId:number) => void;
  userInfo: UserProfile;
  onDataRefresh?: () => void;
  onGroupRoutineComplete?: (groupId: number, activityId: number) => void;
  onUpdateMessages: (roomId: number, newMessages: Message[]) => void;
  onDeleteGroupSuccess: () => void;
}) {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Record<number, string>>({});
  const [oldestMessageId, setOldestMessageId] = useState<number | undefined>(undefined);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);

  const myUserId = userInfo.id;
  const myNickname = userInfo.nickname;
  const roomId = group.groupId;

  const isAtBottomRef = useRef(true);
  const prevScrollHeightRef = useRef(0);
  const prevMessagesLengthRef = useRef(0);

  // 고유키로 중복 방지 (id 없을 때 대비)
  const keyOf = (m: Message) =>
    `${m.messageType}:${m.userId}:${m.sentAt ?? ''}:${m.message ?? ''}:${m.imageUrl ?? ''}:${JSON.stringify(m.albumImages ?? [])}`;


  const handleScroll = () => {
    if (messagesEndRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesEndRef.current;
      isAtBottomRef.current = scrollHeight - scrollTop <= clientHeight + 10;
    }
  };

  // 1) STOMP 연결 및 수신
  useEffect(() => {
    const onMessageReceived = (payload: any) => {
      const receivedMessage: Message = JSON.parse(payload.body);
      receivedMessage.isMe = receivedMessage.userId === myUserId;

      setMessages(prev => {
        const exists = prev.some(msg =>
          msg.id === receivedMessage.id || keyOf(msg) === keyOf(receivedMessage)
        );
        if (exists) return prev;
        return [...prev, receivedMessage];
      });
    };

    const connect = () => {
      if (!stompClientRef.current || !stompClientRef.current.connected) {
        const socket = new SockJS(WS_CONNECTION_URL);
        const client = new Client({
          webSocketFactory: () => socket,
          connectHeaders: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
          debug: (str) => console.log(str),
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log('✅ STOMP 연결 성공');
            client.subscribe(`/topic/room/${roomId}`, onMessageReceived);
            const joinMessage = {
              senderId: myUserId,
              senderNickname: myNickname,
              type: 'ENTER',
            };
            client.publish({
              destination: `/app/chat.online/${roomId}`,
              body: JSON.stringify(joinMessage),
            });
          },
          onStompError: (frame) => console.error('❌ STOMP 오류:', frame),
        });
        client.activate();
        stompClientRef.current = client;
      }
    };

    const disconnect = () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.deactivate();
        console.log('STOMP 연결 해제');
      }
    };

    if (myUserId && myNickname && roomId) {
      connect();
    }
    return () => disconnect();
  }, [roomId, myUserId, myNickname]);

  // 2) 초기 채팅 로딩
  useEffect(() => {
  const loadChatHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetchChatHistory(roomId, 20);
      const messagesFromServer: Message[] = response.data?.content || [];
      console.log("초기 채팅 기록:", messagesFromServer);

      if (messagesFromServer.length > 0) {
        setOldestMessageId(
          messagesFromServer[messagesFromServer.length - 1].id || undefined
        );
      }

const updatedHistory = messagesFromServer.map((msg) => {
  let reactionMap: Record<string, ReactionData> = {}; // 초기화

  if (Array.isArray(msg.reactions)) {
    reactionMap = (msg.reactions as ReactionData[]).reduce((acc, current) => {
      acc[current.emoji] = current;
      return acc;
    }, {} as Record<string, ReactionData>);
  }

  return {
    ...msg,
    isMe:
      msg.messageType === "MEMBER_JOIN" ||
      msg.messageType === "MEMBER_LEAVE"
        ? false 
        : msg.userId === myUserId,
    reactions: reactionMap,
  };
});

      setMessages((prev) => {
        const newOnes = updatedHistory.filter(
          (newMsg) =>
            !prev.some(
              (oldMsg) =>
                oldMsg.id === newMsg.id ||
                keyOf(oldMsg) === keyOf(newMsg)
            )
        );
        return [...prev, ...newOnes.reverse()];
      });
    } catch (error) {
      console.error("채팅 기록 로딩 실패:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  if (myUserId && roomId) {
    loadChatHistory();
  }
}, [roomId, myUserId]);

  // 3) 스크롤 동작
  useEffect(() => {
    const chatContainer = messagesEndRef.current;
    if (!chatContainer) return;

    if (messages.length > prevMessagesLengthRef.current) {
      const isAddingOlder =
        messages.length > 0 &&
        messages[0]?.id &&
        messages[1]?.id &&
        (messages[0].id as number) < (messages[1].id as number);

      if (isAddingOlder) {
        const newScrollTop = chatContainer.scrollHeight - prevScrollHeightRef.current;
        chatContainer.scrollTop = newScrollTop;
      }
    }

    if (isAtBottomRef.current) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  // 4) 멤버 프로필 로딩
  useEffect(() => {
    const fetchMemberProfiles = async () => {
      const profiles: Record<number, string> = {};
      for (const member of groupmembers) {
        if (member.userId === userInfo.id) {
          profiles[member.userId] = userInfo.profileImageUrl;
          continue;
        }
        try {
          const profileData = await getUserProfile(member.userId);
          profiles[member.userId] = profileData.profileImageUrl;
        } catch (error) {
          console.error(`멤버 프로필 가져오기 실패: userId ${member.userId}`, error);
          profiles[member.userId] = '';
        }
      }
      setMemberProfiles(profiles);
    };

    if (groupmembers && groupmembers.length > 0) {
      fetchMemberProfiles();
    }
  }, [groupmembers, userInfo.id, userInfo.profileImageUrl]);

  // 5) 과거 로딩
  const loadMoreChatHistory = async () => {
    if (isLoadingHistory || !oldestMessageId) return;
    setIsLoadingHistory(true);
    try {
      const response = await fetchChatHistory(roomId, 20, oldestMessageId);
      const olderMessages: Message[] = response.data?.content || [];
        console.log("이전 메시지 내역:", olderMessages);
      if (olderMessages.length > 0) {
        setOldestMessageId(olderMessages[olderMessages.length - 1].id || undefined);
      }

      if (messagesEndRef.current) {
        prevScrollHeightRef.current = messagesEndRef.current.scrollHeight;
      }

      setMessages(prev => {
        const updated = olderMessages.map(msg => ({
          ...msg,
          isMe: (msg.messageType === 'MEMBER_JOIN' || msg.messageType === 'MEMBER_LEAVE') ? false : msg.userId === myUserId,
        }));
        const newOnes = updated.filter(newMsg =>
          !prev.some(oldMsg => oldMsg.id === newMsg.id || keyOf(oldMsg) === keyOf(newMsg))
        );
        return [...newOnes.reverse(), ...prev];
      });
    } catch (error) {
      console.error("과거 채팅 기록 로딩 실패:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // 6) 텍스트 전송
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    const msgBody = {
      userId: myUserId,
      senderNickname: myNickname,
      message: text,
      messageType: 'TALK',
    };
    stompClientRef.current?.publish({
      destination: `/app/chat.send/${roomId}`,
      body: JSON.stringify(msgBody),
    });

  };

  // 7) 이미지 전송 (1장)
const handleSendImage = async (file: File) => {
    if (!stompClientRef.current?.connected) {
        alert("채팅 연결이 불안정하여 이미지를 보낼 수 없습니다. 잠시 후 다시 시도해주세요.");
        return;
    }

    try {
        // 1) presigned URL 발급
        const { uploadUrl, key } = await presignGroupRoomPut(roomId, myUserId, file);
        const contentType = getContentType(file.name, file.type);

        // 2) S3 업로드
        await uploadFileToS3(uploadUrl, file, contentType);

        const msgBody = {
            userId: myUserId,
            senderNickname: myNickname,
            message: "[image]",   
            imageUrl: key,        
            messageType: "TALK", 
        };
        stompClientRef.current.publish({
            destination: `/app/chat.send/${roomId}`,
            body: JSON.stringify(msgBody),
        });


    } catch (error) {
        console.error("이미지 업로드 및 전송 실패:", error);
        alert("이미지 전송에 실패했습니다. 다시 시도해주세요.");
    }
};

  // 8) 앨범 전송 (여러 장)
  const handleSendAlbum = async (files: FileList) => {
    if (!stompClientRef.current?.connected) {
      alert("채팅 연결이 불안정하여 앨범을 보낼 수 없습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    try {
      const fileArray = Array.from(files);
      const imageUrls = await Promise.all(
        fileArray.map(async (file) => {
          const { uploadUrl, key } = await presignGroupRoomPut(roomId, myUserId, file);
          const contentType = getContentType(file.name, file.type);
          await uploadFileToS3(uploadUrl, file, contentType);
          const { url } = await presignGet(key, "inline");
          return url;
        })
      );

      const msgBody = {
        userId: myUserId,
        senderNickname: myNickname,
        message: null,
        imageUrl: null,
        messageType: 'ALBUM',
        albumImages: imageUrls,
      };
      stompClientRef.current!.publish({
        destination: `/app/chat.send/${roomId}`,
        body: JSON.stringify(msgBody),
      });

      const optimisticAlbum: Message = {
        id: null,
        roomId,
        userId: myUserId,
        senderNickname: myNickname,
        message: null,
        imageUrl: null,
        messageType: 'ALBUM',
        albumImages: imageUrls,
        sentAt: new Date().toISOString(),
        isMe: true,
      };
      setMessages(prev => [...prev, optimisticAlbum]);
    } catch (error) {
      console.error("앨범 업로드 및 전송 실패:", error);
      alert("앨범 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleDeleteGroup = async () => {
     // 1. 그룹 멤버 수 확인
    const memberCount = groupmembers.length;

     // 2. 내 role 확인 (내가 리더인지)
    const myMemberInfo = groupmembers.find(m => m.userId === myUserId);
    const isGroupLeader = myMemberInfo?.role === 'LEADER';

     const groupId = group.groupId;
    const myMemberId = myMemberInfo?.groupMemberId;
    const groupLeaderInfo = groupmembers.find(m => m.role === 'LEADER');
    const leaderMemberId = groupLeaderInfo?.groupMemberId;

    if (memberCount === 1) {
       // 케이스 1: 멤버가 1명 (나 혼자) -> 그룹 삭제
      if (!window.confirm("정말로 이 채팅방을 삭제하고 나가시겠습니까? (방에는 회원님만 있습니다)")) return;
      try {
        await deleteGroup(group.groupId); // 그룹 삭제 API 호출
        alert("그룹이 성공적으로 삭제되었습니다.");
        onDeleteGroupSuccess(); // 그룹 삭제 성공 콜백
      } catch (error) {
        console.error("그룹 삭제 오류:", error);
        alert("그룹 삭제에 실패했습니다.");
      }
    } else if (memberCount > 1 && isGroupLeader) {
      // 케이스 2: 멤버가 2명 이상 & 내가 리더
      alert("⚠️ 그룹 리더는 다른 멤버에게 리더를 위임한 후에만 탈퇴할 수 있습니다.\n멤버 창에서 리더 위임 후 다시 시도해 주세요.");
       setIsMembersDialogOpen(true); // 멤버 다이얼로그 열기
    } else if (memberCount > 1 && !isGroupLeader) {
       // 케이스 3: 멤버가 2명 이상 & 내가 멤버 (리더 아님) -> 그룹 탈퇴
      if (!window.confirm("정말로 이 채팅에서 나가시겠습니까? (그룹 탈퇴)")) return;
       try {
            await leaveGroupSelf(groupId); 
            
            alert("성공적으로 탈퇴했습니다.");
            onLeaveGroup(groupId); 
            
        } catch (error) {
            console.error("그룹 탈퇴 오류:", error);
            alert("그룹 탈퇴에 실패했습니다.");
        }
    } else {
      console.error("그룹 나가기/삭제 로직 오류: 멤버 수:", memberCount, "리더 여부:", isGroupLeader);
      alert("처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

 const handleReactionClick = async (messageId: number | null, emoji: string) => {
  if (!messageId) {
    console.error("메시지 ID가 없어 리액션 처리를 할 수 없습니다.");
    return;
  }

  try {
    const targetMessage = messages.find((m) => m.id === messageId);
    if (!targetMessage) return;

    //현재 reactions 복사 
    const currentReactions: Record<string, ReactionData> = { ...(targetMessage.reactions || {}) };

    const existing: ReactionData | undefined = currentReactions[emoji];
    const userAlreadyReacted = existing?.userIds?.includes(myUserId) ?? false;

    //낙관적 UI 업데이트용 복제
    const updatedReactions: Record<string, ReactionData> = { ...currentReactions };

    if (userAlreadyReacted) {
      const newUserIds = existing!.userIds.filter((id) => id !== myUserId);
      const newCount = Math.max((existing!.count || 1) - 1, 0);

      if (newCount <= 0) {
        delete updatedReactions[emoji];
      } else {
        updatedReactions[emoji] = { emoji, count: newCount, userIds: newUserIds };
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions: updatedReactions } : m))
      );


      await removeMessageReaction(messageId, emoji);
      console.log(`✅ 메시지 ${messageId}에서 리액션 '${emoji}' 제거 성공`);
    } else {

      const newUserIds = [...(existing?.userIds || []), myUserId];
      const newCount = (existing?.count || 0) + 1;

      updatedReactions[emoji] = { emoji, count: newCount, userIds: newUserIds };

      // UI 먼저 반영
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions: updatedReactions } : m))
      );


      await addMessageReaction(messageId, emoji);
      console.log(`✅ 메시지 ${messageId}에 리액션 '${emoji}' 추가 성공`);
    }
  } catch (error) {
    console.error(`리액션 처리 중 오류 발생 (메시지 ${messageId}, 이모지 ${emoji}):`, error);
    alert("리액션 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
};

  const getUserInfoFromMsg = (msg: Message): UserProfile | undefined => {
    if (msg.senderNickname === myNickname) {
      return userInfo;
    }
    const member = groupmembers.find((m) => m.memberName === msg.senderNickname);
    if (!member) {
      console.warn(`사용자 정보를 찾을 수 없습니다: userId ${msg.userId}`);
      return undefined;
    }
    return {
      id: member.groupMemberId,
      nickname: member.memberName,
      profileImageUrl: member.profileImageUrl,
      streakDays: 0,
    };
  };

const handleAuthSubmit = async (data: { description: string; image: File | null; isPublic: boolean }) => {
    if (!stompClientRef.current?.connected) {
      alert("채팅 연결이 불안정하여 인증을 보낼 수 없습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    try {

      let imageKey: string | null = null;

    // 1) S3 업로드 먼저
    if (data.image) {
      const { uploadUrl, key } = await presignProofShotPut(group.groupId, myUserId, data.image);
      const contentType = getContentType(data.image.name, data.image.type);
      await uploadFileToS3(uploadUrl, data.image, contentType);
      imageKey = key; 
    }

      const activityData = {
        groupId: group.groupId,
        description: data.description,
        imageUrl: imageKey,
        isPublic: data.isPublic,
      };
      await createGroupActivity(activityData);
      await updateRankingScore(myUserId, group.groupId, 1);

      let messageText: string;
      let messageType: 'NOTICE';

      if (group.groupType === 'REQUIRED') {
          // 의무 그룹일 경우
          messageText = `${myNickname}님이 루틴 인증을 요청했습니다.`;
          messageType = 'NOTICE';
      } else {
          // 자유 그룹일 경우 (기존 로직)
          messageText = `${myNickname}님이 루틴을 인증했습니다: ${data.description}`;
          messageType = 'NOTICE';
      }

      const msgBody = {
        userId: myUserId,
        senderNickname: myNickname,
        message: messageText,
        imageUrl: imageKey,
        messageType: messageType,
      };
      stompClientRef.current!.publish({
        destination: `/app/chat.send/${roomId}`,
        body: JSON.stringify(msgBody),
      });

      alert('인증이 성공적으로 제출되었습니다.');
      onGroupRoutineComplete?.();
      console.log("인증 제출 완료:", activityData);
    } catch (error) {
      alert('인증 제출에 실패했습니다.');
      console.error("🚨 최종 에러 핸들링:", error);
    }
  };


  return (
    <div className="flex flex-col h-full bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-b-[var(--color-border-bottom-custom)] p-4">
        <div className="mx-auto flex items-center justify-between">
          <div className="flex-1 flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-1">
              <ArrowLeft className="h-5 w-5 text-icon-secondary dark:text-white" />
            </Button>
          </div>
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-base">{group.groupName}</h1>
            <p className="text-xs text-muted-foreground">{group.currentMemberCount}명 참여 중</p>
          </div>
          <div className="flex-1 flex items-center justify-end space-x-2">
            <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4 text-icon-secondary dark:text-white" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm mx-auto text-icon-secondary dark:text-white">
                <DialogHeader>
                  <DialogTitle>그룹 멤버</DialogTitle>
                  <DialogDescription>{group.groupName} 참여 멤버</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 max-h-80 overflow-y-auto ">
                  {groupmembers.map((member) => {
                    const profileImage = memberProfiles[member.userId];
                    const isMe = member.groupMemberId === myUserId;
                    return (
                      <div key={member.groupMemberId} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50">
                        <Avatar className="h-10 w-10">
                          <AvatarImage className='object-cover' src={profileImage} alt={`${member.memberName} 프로필`} />
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

      <GroupChatMessages
        messages={messages}
        myUserId={myUserId}
        getUserInfo={getUserInfoFromMsg}
        userInfo={userInfo}
        group={group}
        memberProfiles={memberProfiles}
        ref={messagesEndRef}
        onScrollTop={loadMoreChatHistory}
        onScroll={handleScroll}
        onReactionClick={handleReactionClick}
      />

      <GroupChatInput
        handleSendMessage={handleSendMessage}
        handleSendImage={handleSendImage}
        handleSendAlbum={handleSendAlbum}
      />

      <GroupRoutineDialog
        isOpen={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        onAuthSubmit={handleAuthSubmit}
        selectedRoutine={group?.routines?.[0] || null}
        group={group}
      />
    </div>
  );
}