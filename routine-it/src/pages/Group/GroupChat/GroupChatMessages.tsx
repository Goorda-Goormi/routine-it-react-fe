import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
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
    onScrollTop: () => void; 
    onScroll:() => void;
}

// React.forwardRef를 사용하여 ref를 받을 수 있게 컴포넌트를 감쌈
export const GroupChatMessages = forwardRef<HTMLDivElement, GroupChatMessagesProps>(
    ({ messages, myUserId, getUserInfo, group, memberProfiles, onScrollTop, onScroll }, ref) => {
        const [localReactions, setLocalReactions] = useState<{ [key: string]: { [emoji: string]: number } }>({});
        const [hoveredMessageKey, setHoveredMessageKey] = useState<string | null>(null);
        
        const emojis = ['😀', '😂', '👍', '❤️', '👏', '💪', '🎉', '🔥', '🤔', '😊', '😭', '😎', '👌', '🙏', '🤯'];

        // ✅ 스크롤 이벤트 핸들러 추가
        useEffect(() => {
            if (ref && typeof ref !== 'function' && ref.current) {
                const currentRef = ref.current;
                
                const handleScrollEvent = () => {
                    // 스크롤이 맨 위에 도달했을 때 (scrollTop === 0)
                    if (currentRef.scrollTop === 0) {
                        onScrollTop();
                    }
                    onScroll(); // 부모 컴포넌트의 스크롤 추적 함수 호출
                };

                currentRef.addEventListener('scroll', handleScrollEvent);
                return () => currentRef.removeEventListener('scroll', handleScrollEvent);
            }
        }, [ref, onScrollTop, onScroll]);

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
            
            if (renderedDates.has(dateKey)) {
                return false;
            }

            if (index === 0) {
                renderedDates.add(dateKey);
                return true;
            }

            let prevDate = null;
            let prevIndex = 1;
            while (index - prevIndex >= 0) {
                const prevMessage = messages[index - prevIndex];
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
                const currentCount = newReactions[messageKey][emoji] || 0;

                    if (currentCount > 0) {
                         newReactions[messageKey][emoji] = currentCount - 1;
                        if (newReactions[messageKey][emoji] === 0) {
                             delete newReactions[messageKey][emoji];
                                if (Object.keys(newReactions[messageKey]).length === 0) {
                                     delete newReactions[messageKey];
                                }
                        }
                     } else {
                    // ✅ 개수가 0이면 +1 (처음 누른 경우)
                    newReactions[messageKey][emoji] = 1;
                }

                return newReactions;
            });
        };

        return (
            <div className="flex-1 overflow-y-auto  p-4 space-y-4" ref={ref} >
                
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
                                    <div key={`system-${msg.id || index}`} className="flex justify-center my-2">
                                        <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-zinc-700/50 rounded-lg px-3 py-1.5 font-light">
                                            {msg.message}
                                        </span>
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
                                                <Avatar className="h-6 w-6 ">
                                                    <AvatarImage className='object-cover' src={profileImageUrl || ''} alt={`${msg.senderNickname} 프로필`} />
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
                                                                            <span className="text-xs font-medium text-green-600 dark:text-green-400">자유 인증 완료</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                                {msg.message && <span className="text-sm">{msg.message}</span>}
                                                                {msg.imageUrl && <img src={msg.imageUrl} alt="전송 이미지" className="max-w-[200px] h-auto rounded-md" />}
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {msg.messageType === 'IMAGE' && msg.imageUrl && (
                                                                    <img src={msg.imageUrl} alt="전송 이미지" className="max-w-[200px] h-auto rounded-md" />
                                                                )}
                                                                {msg.messageType === 'ALBUM' && msg.albumImages && (
                                                                    <div className="grid grid-cols-2 gap-2 max-w-[200px]">
                                                                        {msg.albumImages.map((image, i) => (
                                                                            <img key={i} src={image} alt={`앨범 이미지 ${i + 1}`} className="w-full h-auto rounded-md" />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                {msg.message && <div>{msg.message}</div>}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {!msg.isMe && (
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        {formatTime(msg.sentAt)}
                                                    </span>
                                                )}
                                                {hoveredMessageKey === messageKey && (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={`p-0 w-6 h-6 rounded-full absolute -top-3 ${msg.isMe ? '-left-3' : '-right-3'} z-10`}
                                                            >
                                                                <Smile className="w-4 h-4 text-muted-foreground" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-80 p-2 grid grid-cols-5 gap-1 shadow-lg bg-popover rounded-xl">
                                                            {emojis.map((emoji) => (
                                                                <Button
                                                                    key={emoji}
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-lg p-1 h-8 w-8 hover:bg-muted"
                                                                    onClick={() => handleLocalReactionClick(messageKey, emoji)}
                                                                >
                                                                    {emoji}
                                                                </Button>
                                                            ))}
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            </div>
                                            {Object.keys(reactionsToDisplay).length > 0 && (
                                                <div className="absolute -bottom-2.5 flex space-x-0.5 rounded-full bg-background border px-1 py-0.5">
                                                    {Object.entries(reactionsToDisplay).map(([emoji, count]) => (
                                                        <span key={emoji} className="text-xs">
                                                            {emoji} {count}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
            </div>
        );
    }
);