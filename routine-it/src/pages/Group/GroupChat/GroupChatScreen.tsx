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
import { leaveGroup, createGroupActivity } from '../../../api/chat';
import { updateRankingScore } from '../../../api/ranking'; // ✅ ranking.ts에서 updateRankingScore 임포트

import type { Group, UserProfile, GroupMemberResponse } from '../../../interfaces';
import { fetchChatHistory } from '../../../api/chat';
import { requestAuthApproval, getGroupMembers } from '../../../api/group';

export const BASE_URL = "http://54.180.93.1:8080";
const WS_CONNECTION_URL = `${BASE_URL}/ws`;

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
    const roomId = group.groupId;

    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                const response = await fetchChatHistory(roomId, 20);
                let messagesFromServer = response.data?.content || [];
                messagesFromServer = messagesFromServer.reverse();
                const updatedHistory = messagesFromServer.map(msg => ({
                    ...msg,
                    isMe: (msg.messageType === 'MEMBER_JOIN' || msg.messageType === 'MEMBER_LEAVE') ? false : msg.userId === myUserId,
                }));
                setMessages(updatedHistory);
            } catch (error) {
                console.error("채팅 기록 로딩 실패:", error);
                setMessages([]);
            }
        };

        loadChatHistory();
        
        const socket = new SockJS(WS_CONNECTION_URL);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
            },
            debug: (str) => console.log(str),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('✅ STOMP 연결 성공');
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
        stompClientRef.current?.publish({
            destination: `/app/chat.send/${roomId}`,
            body: JSON.stringify(msgBody),
        });
    };

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
        if (!stompClientRef.current) {
            alert("채팅 연결이 불안정하여 인증을 보낼 수 없습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        try {
            if (group.groupType === 'FREE') {
                const activityData = {
                    description: data.description,
                    photo: data.image,
                    isPublic: data.isPublic,
                    groupId: group.groupId,
                };
                
                await createGroupActivity(activityData);

                // ✅ 추가된 부분: 랭킹 점수 업데이트
                try {
                    await updateRankingScore(myUserId, group.groupId, 1);
                    console.log("✅ 랭킹 점수 업데이트 성공: 자유그룹 인증");
                } catch (rankingError) {
                    console.error("🚨 랭킹 점수 업데이트 실패:", rankingError);
                }
                
                const msgBody = {
                    userId: myUserId,
                    senderNickname: myNickname,
                    message: data.description,
                    imageUrl: data.image ? URL.createObjectURL(data.image) : null,
                    messageType: 'NOTICE', 
                };

                stompClientRef.current.publish({
                    destination: `/app/chat.send/${roomId}`,
                    body: JSON.stringify(msgBody),
                });
                
                alert('자유그룹 인증이 성공적으로 제출되었습니다.');
                    
            } else {
                // REQUIRED 그룹 인증 요청 (기존 로직)
                const authMessage = data.description;
                const msgBody = {
                    userId: myUserId,
                    senderNickname: myNickname,
                    message: authMessage,
                    imageUrl: data.image ? URL.createObjectURL(data.image) : null,
                    messageType: 'NOTICE', 
                };

                stompClientRef.current.publish({
                    destination: `/app/chat.send/${roomId}`,
                    body: JSON.stringify(msgBody),
                });
                
                alert('인증이 성공적으로 제출되었습니다.');
            }
        } catch (error) {
            // 오류 응답 확인
            if (error.name === 'AuthError' || (error.response && error.response.status === 401)) {
                alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                // 여기에서 로그인 페이지로 리디렉션하는 로직을 추가
                // 예: window.location.href = '/login';
            } else {
                alert('인증 제출에 실패했습니다.');
            }
            console.error("🚨 최종 에러 핸들링:", error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
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
                userInfo={userInfo}
                group={group}
            />
            <GroupChatInput handleSendMessage={handleSendMessage} handleSendImage={handleSendImage} handleSendAlbum={handleSendAlbum} />
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
