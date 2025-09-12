import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Button } from '../../../components/ui/button';
import { Smile, CheckCircle, Clock } from 'lucide-react';
import type { Message, Group } from './GroupChatScreen';
import type { UserProfile } from '../../../interfaces';

interface GroupChatMessagesProps {
    messages: Message[];
    myUserId: number;
    getUserInfo: (message: Message) => UserProfile | null;
    userInfo: UserProfile;
    group: Group;
    memberProfiles: Record<number, string>;
}

export function GroupChatMessages({ messages, myUserId, getUserInfo, group, memberProfiles }: GroupChatMessagesProps) {
    const [localReactions, setLocalReactions] = useState<{ [key: string]: { [emoji: string]: number } }>({});
    const [hoveredMessageKey, setHoveredMessageKey] = useState<string | null>(null);

    const emojis = ['😀', '😂', '👍', '❤️', '👏', '💪', '🎉', '🔥', '🤔', '😊', '😭', '😎', '👌', '🙏', '🤯'];
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [messages]);

    const formatTime = (isoString: string | null) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        date.setHours(date.getHours() + 9);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? '오후' : '오전';
        const displayHours = hours % 12 === 0 ? 12 : hours % 12;
        const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${ampm} ${displayHours}:${displayMinutes}`;
    };

    const formatDateWithDay = (isoString: string | null) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        date.setHours(date.getHours() + 9);
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' } as const;
        return date.toLocaleDateString('ko-KR', options);
    };

    const isDifferentDay = (currentMsg: Message, messages: Message[], index: number, renderedDates: Set<string>) => {
        if (!currentMsg.sentAt) return false;
        const currentDate = new Date(currentMsg.sentAt);
        currentDate.setHours(currentDate.getHours() + 9);
        const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
        
        // 이미 렌더링된 날짜라면 false 반환
        if (renderedDates.has(dateKey)) {
            return false;
        }

        // 첫 번째 메시지라면 무조건 날짜 구분선 표시
        if (index === 0) {
            renderedDates.add(dateKey);
            return true;
        }

        let prevDate = null;
        let prevIndex = 1;
        while (index - prevIndex >= 0) {
            const prevMessage = messages[index - prevIndex];
            // ONLINE, OFFLINE 메시지를 제외한 모든 메시지를 날짜 비교 대상으로 포함
            if (prevMessage.sentAt && !['ONLINE', 'OFFLINE'].includes(prevMessage.messageType)) {
                prevDate = new Date(prevMessage.sentAt);
                prevDate.setHours(prevDate.getHours() + 9);
                break;
            }
            prevIndex++;
        }

        if (!prevDate) {
            renderedDates.add(dateKey);
            return true;
        }

        const isDifferent =
            currentDate.getFullYear() !== prevDate.getFullYear() ||
            currentDate.getMonth() !== prevDate.getMonth() ||
            currentDate.getDate() !== prevDate.getDate();

        if (isDifferent) renderedDates.add(dateKey);
        return isDifferent;
    };

    const renderedDates = new Set<string>();

    const handleLocalReactionClick = (messageKey: string, emoji: string) => {
        setLocalReactions(prev => {
            const newReactions = { ...prev };
            if (!newReactions[messageKey]) {
                newReactions[messageKey] = {};
            }
            newReactions[messageKey][emoji] = (newReactions[messageKey][emoji] || 0) + 1;
            return newReactions;
        });
    };

    return (
        <div className="flex-1 overflow-y-auto" ref={messagesEndRef}>
            <div className="max-w-md mx-auto px-4 py-4 space-y-4">
                {messages.map((msg, index) => {
                    const messageKey = `${msg.senderNickname}-${msg.sentAt}-${msg.message || ''}-${msg.imageUrl || ''}-${msg.albumImages ? msg.albumImages.join(',') : ''}`;

                    if (['ONLINE', 'OFFLINE'].includes(msg.messageType)) {
                        return null;
                    }

                    const showDateSeparator = isDifferentDay(msg, messages, index, renderedDates);
                    const reactionsToDisplay = localReactions[messageKey] || {};
                     const profileImageUrl = memberProfiles[msg.userId] || null;

                    return (
                        <React.Fragment key={`message-${msg.id || index}`}>
                            {showDateSeparator && (
                                <div key={`date-separator-${msg.sentAt}`} className="flex items-center my-4">
                                    <div className="flex-grow border-t border-muted-foreground/30" />
                                    <span className="mx-3 text-xs text-muted-foreground">
                                        {formatDateWithDay(msg.sentAt)}
                                    </span>
                                    <div className="flex-grow border-t border-muted-foreground/30" />
                                </div>
                            )}
                            
                            {/* MEMBER_JOIN, MEMBER_LEAVE 메시지 렌더링 로직 */}
                            {['MEMBER_JOIN', 'MEMBER_LEAVE'].includes(msg.messageType) ? (
                                <div key={`system-${msg.id || index}`} className="flex items-center my-2">
                                    <div className="flex-grow border-t border-muted-foreground/30" />
                                    <span className="mx-3 text-xs text-muted-foreground text-center">
                                        {msg.message}
                                    </span>
                                    <div className="flex-grow border-t border-muted-foreground/30" />
                                </div>
                            ) : (
                                <div
                                    key={messageKey}
                                    className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                                    onMouseEnter={() => setHoveredMessageKey(messageKey)}
                                    onMouseLeave={() => setHoveredMessageKey(null)}
                                >
                                    <div className={`relative flex items-end space-x-2 max-w-[80%] ${msg.isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        {!msg.isMe && (
                                             <Avatar className="h-6 w-6">
                                                <AvatarImage src={profileImageUrl || ''} alt={`${msg.senderNickname} 프로필`} />
                                                <AvatarFallback className="text-xs">{msg.senderNickname?.[0] || '?'}</AvatarFallback>
                                            </Avatar>
                                        )}

                                        <div className="flex items-end">
                                            {msg.isMe && (
                                                <span className="text-xs text-muted-foreground mr-2">
                                                    {formatTime(msg.sentAt)}
                                                </span>
                                            )}
                                            <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                                {!msg.isMe && (
                                                    <div className="flex items-center space-x-1 mb-1">
                                                        <span className="text-xs text-muted-foreground">{getUserInfo(msg)?.nickname}</span>
                                                        <span className="text-xs text-muted-foreground opacity-70">{getUserInfo(msg)?.streakDays}일</span>
                                                    </div>
                                                )}
                                                <div
                                                    className={`rounded-lg px-3 py-2 max-w-full break-words ${
                                                        msg.messageType === 'NOTICE'
                                                            ? (group.groupType === 'REQUIRED'
                                                                ? 'bg-orange-50/80 border border-orange-200/50 dark:bg-orange-900/20 dark:border-orange-700/50'
                                                                : 'bg-green-50/80 border border-green-200/50 dark:bg-green-900/20 dark:border-green-700/50')
                                                            : msg.isMe
                                                                ? 'bg-chart-5 text-primary'
                                                                : 'bg-muted text-foreground'
                                                        }`}
                                                >
                                                    {msg.messageType === 'NOTICE' ? (
                                                        <div className="flex flex-col items-start space-y-2">
                                                            <div className="flex items-center space-x-1">
                                                                {group.groupType === 'REQUIRED' ? (
                                                                    <>
                                                                        <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                                                                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400">인증 승인 대기</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                                                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">루틴 인증 완료</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {msg.imageUrl && (
                                                                <img
                                                                    src={msg.imageUrl}
                                                                    alt="인증 사진"
                                                                    className="max-w-[200px] rounded-lg cursor-pointer"
                                                                    onClick={() => window.open(msg.imageUrl, '_blank')}
                                                                />
                                                            )}
                                                            {msg.message && (
                                                                <p className="text-sm text-left text-card-foreground/90">{msg.message}</p>
                                                            )}
                                                        </div>
                                                    ) : msg.messageType === 'TALK' ? (
                                                        <p className="text-sm text-left">{msg.message}</p>
                                                    ) : msg.messageType === 'ALBUM' && Array.isArray(msg.albumImages) && msg.albumImages.length > 0 ? (
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {msg.albumImages.map((img, idx) => (
                                                                <img
                                                                    key={idx}
                                                                    src={img}
                                                                    alt={`앨범 이미지 ${idx + 1}`}
                                                                    className="w-full max-h-[150px] object-cover rounded-lg cursor-pointer"
                                                                    onClick={() => window.open(img, '_blank')}
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : msg.messageType === 'IMAGE' && msg.imageUrl ? (
                                                        <img
                                                            src={msg.imageUrl}
                                                            alt="보낸 이미지"
                                                            className="max-w-[200px] rounded-lg cursor-pointer"
                                                            onClick={() => window.open(msg.imageUrl, '_blank')}
                                                        />
                                                    ) : (
                                                        <p className="text-sm text-left">{msg.message}</p>
                                                    )}
                                                </div>
                                                {Object.keys(reactionsToDisplay).length > 0 && (
                                                    <div className="flex space-x-1 mt-1">
                                                        {Object.entries(reactionsToDisplay).map(([emoji, count]) => (
                                                            <div key={emoji} className="flex items-center text-xs p-1 rounded-full bg-secondary text-secondary-foreground">
                                                                <span>{emoji}</span>
                                                                <span className="ml-1">{count}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {!msg.isMe && (
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    {formatTime(msg.sentAt)}
                                                </span>
                                            )}
                                        </div>

                                        {hoveredMessageKey === messageKey && (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={`absolute bottom-0 p-1 w-6 h-6 rounded-full bg-background/90 text-card-foreground hover:bg-card hover:text-card-foreground border border-border transition-opacity duration-200 z-10 ${
                                                            msg.isMe ? 'left-[-1rem]' : 'right-[-1rem]'
                                                        }`}
                                                    >
                                                        <Smile className="w-4 h-4 icon-secondary" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-2 w-auto min-w-[150px] bg-background/95 backdrop-blur border-border" align="start" side="top" sideOffset={10}>
                                                    <div className="grid grid-cols-5 gap-1 text-2xl">
                                                        {emojis.map((emoji, index) => (
                                                            <Button key={index} variant="ghost" className="text-2xl p-1 h-8 w-8" onClick={() => handleLocalReactionClick(messageKey, emoji)}>
                                                                {emoji}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}