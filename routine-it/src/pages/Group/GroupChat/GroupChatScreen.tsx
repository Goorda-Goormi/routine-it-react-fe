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
import { fetchChatHistory } from '../../../api/chat'; // ✅ 추가된 import
import { requestAuthApproval, getGroupMembers } from '../../../api/group'; 

// 👉 API 기본 URL, WS 연결 URL
export const BASE_URL = "http://54.180.93.1:8080";
const WS_CONNECTION_URL = `${BASE_URL}/ws`;

export interface Message {
    id: number | null;
    roomId: number;
    userId: number;
    senderNickname: string;
    message: string | null;
    imageUrl: string | null;
    messageType: 'TALK' | 'AUTH' | 'IMAGE' | 'ALBUM' | 'ONLINE' | 'OFFLINE';
    sentAt: string | null;
    isMe: boolean;
    reactions?: { [key: string]: number };
    albumImages?: string[];
}

export function GroupChatScreen({ group, groupmembers, onBack, onLeaveGroup, userInfo }) {
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    const stompClientRef = useRef<Client | null>(null);

    const myUserId = userInfo.id;
    const myNickname = userInfo.nickname;
    const roomId = group.groupId; // 그룹 채팅방 ID

    // 🔌 채팅 기록 로드 및 웹소켓 연결
    useEffect(() => {
    // 1. 과거 메시지 기록을 불러오는 비동기 함수
    const loadChatHistory = async () => {
        try {
            // fetchChatHistory 함수 호출
            const response = await fetchChatHistory(roomId, 20); 

            // ✅ 응답 객체의 `data.content`에 메시지 배열이 들어있으므로, 이 부분을 사용합니다.
            let messagesFromServer = response.data?.content || [];
            
            // ⭐️ 추가된 코드: 메시지 배열을 역순으로 정렬
            messagesFromServer = messagesFromServer.reverse();
            // 불러온 메시지에 isMe 속성 추가
            const updatedHistory = messagesFromServer.map(msg => ({
              ...msg,
              // MEMBER_JOIN, MEMBER_LEAVE 타입에는 isMe를 항상 false로 설정
              isMe: (msg.messageType === 'MEMBER_JOIN' || msg.messageType === 'MEMBER_LEAVE') ? false : msg.userId === myUserId,
          }));

            // 상태 업데이트
            setMessages(updatedHistory);
        } catch (error) {
            console.error("채팅 기록 로딩 실패:", error);
            // 에러 발생 시 빈 배열로 설정
            setMessages([]);
        }
    };

    // 과거 메시지 로드 후 웹소켓 연결
    loadChatHistory();
        
        // 3. 웹소켓 연결 로직 (기존 코드)
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
                stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
                    const body = JSON.parse(message.body);

                    const newMsg: Message = {
                        id: body.id,
                        roomId: body.roomId,
                        userId: body.userId,
                        senderNickname: body.senderNickname,
                        message: body.message,
                        imageUrl: body.imageUrl,
                        messageType: body.messageType,
                        sentAt: body.sentAt,
                        isMe: body.userId === myUserId,
                        reactions: {},
                    };
                    setMessages((prev) => [...prev, newMsg]);
                });

                // 온라인 신호
                stompClient.publish({
                    destination: `/app/chat.online/${roomId}`,
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

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        const msgBody = {
            userId: myUserId,
            senderNickname: myNickname,
            message: text,
            messageType: 'TALK',
        };

        // 1. 웹소켓으로 메시지 전송
        stompClientRef.current?.publish({
            destination: `/app/chat.send/${roomId}`,
            body: JSON.stringify(msgBody),
        });

      
    };

    // 🖼️ 이미지 보내기 (로컬 프리뷰 + 서버 전송 필요하면 백엔드 맞춤)
    const handleSendImage = (file: File) => {
        const imageUrl = URL.createObjectURL(file);
        const newMessage: Message = {
            id: null,
            roomId,
            userId: myUserId,
            senderNickname: myNickname,
            message: null,
            imageUrl,
            messageType: 'IMAGE',
            sentAt: new Date().toISOString(),
            isMe: true,
            reactions: {},
        };
        setMessages((prev) => [...prev, newMessage]);
    };

    const handleSendAlbum = (files: FileList) => {
        const imageUrls = Array.from(files).map((file) => URL.createObjectURL(file));
        const newMessage: Message = {
            id: null,
            roomId,
            userId: myUserId,
            senderNickname: myNickname,
            message: null,
            imageUrl: null,
            messageType: 'ALBUM',
            sentAt: new Date().toISOString(),
            isMe: true,
            reactions: {},
            albumImages: imageUrls,
        };
        setMessages((prev) => [...prev, newMessage]);
    };

    // const handleAuthSubmit = (data: { description: string; image: File | null; isPublic: boolean }) => {
    //     const authMessage: Message = {
    //         id: null,
    //         roomId,
    //         userId: myUserId,
    //         senderNickname: myNickname,
    //         message: data.description,
    //         imageUrl: null,
    //         messageType: 'AUTH',
    //         sentAt: new Date().toISOString(),
    //         isMe: true,
    //         reactions: {},
    //     };
    //     setMessages((prevMessages) => [...prevMessages, authMessage]);

    //     const routineId = group.routines?.[0]?.id || 0;
    //     onAddAuthMessage(group.groupId, data, myNickname, myUserId, routineId);

    //     setIsAuthDialogOpen(false);
    // };

    const handleDeleteGroup = async () => {
        if (!window.confirm("정말로 이 채팅에서 나가시겠습니까?")) return;
        try {
            await leaveGroup(group.groupId);
            alert("성공적으로 탈퇴했습니다.");
            onLeaveGroup();
        } catch (error) {
            console.error("그룹 탈퇴 오류:", error);
            alert("채팅방 나가기에 실패했습니다.");
        }
    };

    const handleReactionClick = (messageKey: string, emoji: string) => {
        setMessages((prevMessages) =>
            prevMessages.map((msg) => {
                if (`${msg.senderNickname}-${msg.sentAt}-${msg.message}` === messageKey) {
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

    const getUserInfo = (msg: Message): UserProfile | undefined => {
        if (msg.senderNickname === myNickname) {
            return userInfo;
        }
        //const member = groupmembers.find((m) => m.groupMemberId === msg.userId);
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
        try {
            
            const members = await getGroupMembers(group.groupId);
            const leader = members.find(member => member.role === 'LEADER');

            if (!leader) {
            alert('그룹 리더 정보를 찾을 수 없어 인증을 요청할 수 없습니다.');
            return;
            }

            const authData = {
            leaderId: leader.groupMemberId,
            targetMemberId: userInfo.id as number,
            activityDate: new Date().toISOString().split('T')[0],
       
            imageUrl: "https://placeholder.com/image.jpg",
            };

            // 3. 수정한 이름의 함수를 호출합니다.
            await requestAuthApproval(group.groupId, authData);
            alert('인증이 성공적으로 제출되었습니다.');
            

        } catch (error) {
            alert('인증 제출에 실패했습니다.');
            console.error(error);
        }
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
                                        const isMe = member.groupMemberId === myUserId;
                                        return (
                                            <div key={member.groupMemberId} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={isMe ? userInfo.profileImageUrl : member.profileImageUrl} alt={member.memberName} />
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
                getUserInfo={getUserInfo}
                handleReactionClick={handleReactionClick}
                userInfo={userInfo}
            />
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