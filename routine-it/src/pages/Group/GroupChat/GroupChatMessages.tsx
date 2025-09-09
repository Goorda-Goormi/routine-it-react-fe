import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Button } from '../../../components/ui/button';
import { Smile, CheckCircle } from 'lucide-react';
import { getStreakInfo } from '../../../components/utils/streakUtils';
import type { Message } from './GroupChatScreen';
import type { UserProfile } from '../../../interfaces';

interface GroupChatMessagesProps {
  messages: Message[];
  myUserId: number;
  getUserInfo: (message: Message) => any;
  handleReactionClick: (messageKey: string, emoji: string) => void;
  userInfo: UserProfile;
}

export function GroupChatMessages({ messages, myUserId, getUserInfo, handleReactionClick }: GroupChatMessagesProps) {
  console.log("GroupChatMessages.jsx - Received messages :", messages);

  const [hoveredMessageKey, setHoveredMessageKey] = useState<string | null>(null);
  const emojis = ['😀', '😂', '👍', '❤️', '👏', '💪', '🎉', '🔥', '🤔', '😊', '😭', '😎', '👌', '🙏', '🤯'];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  // UTC 시간을 한국 시간으로 변환하는 함수
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

  // 날짜를 'YYYY년 MM월 DD일 요일' 형식으로 변환하는 함수
  const formatDateWithDay = (isoString: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    date.setHours(date.getHours() + 9);

    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    } as const;

    return date.toLocaleDateString('ko-KR', options);
  };
  
  // 날짜가 바뀌었는지 판단하는 함수
  const isDifferentDay = (currentMsg: Message,
     prevMsg: Message | null,
     renderedDates: Set<string>
    ) => {
    if (!currentMsg.sentAt) return false;

  const currentDate = new Date(currentMsg.sentAt);
  currentDate.setHours(currentDate.getHours() + 9);

  const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;

  if (renderedDates.has(dateKey)) {
    return false; // 이미 렌더링된 날짜이면 구분선 생략
  }

  if (!prevMsg || !prevMsg.sentAt) {
    renderedDates.add(dateKey);
    return true;
  }

  const prevDate = new Date(prevMsg.sentAt);
  prevDate.setHours(prevDate.getHours() + 9);

  const isDifferent =
    currentDate.getFullYear() !== prevDate.getFullYear() ||
    currentDate.getMonth() !== prevDate.getMonth() ||
    currentDate.getDate() !== prevDate.getDate();

  if (isDifferent) renderedDates.add(dateKey);

  return isDifferent;
  };
  const renderedDates = new Set<string>();

  return (
    <div className="flex-1 overflow-y-auto" ref={messagesEndRef}>
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {messages.map((msg, index) => {
          if (msg.messageType === 'ONLINE' || msg.messageType === 'OFFLINE') {
            return null;
          }
          if (!msg) {
            console.warn("GroupChatMessages.jsx: 유효하지 않은 메시지 객체를 건너뜁니다.", index);
            return null;
          }

          const prevMsg = index > 0 ? messages[index - 1] : null;
         const showDateSeparator = isDifferentDay(msg, prevMsg, renderedDates);
          const messageKey = `${msg.senderNickname}-${msg.sentAt}-${msg.message || ''}-${msg.imageUrl || ''}-${msg.albumImages ? msg.albumImages.join(',') : ''}`;
          const isSystemMessage = ['TALK', 'AUTH', 'IMAGE', 'ALBUM'].includes(msg.messageType) === false;

          return (
            <React.Fragment key={`message-${msg.id || index}`}>
              {/* ✅ 날짜가 바뀌는 지점에만 날짜 구분선 렌더링 */}
              {showDateSeparator && !isSystemMessage && (
                <div
                  key={`date-separator-${msg.sentAt}`}
                  className="flex items-center my-4"
                >
                  <div className="flex-grow border-t border-muted-foreground/30" />
                  <span className="mx-3 text-xs text-muted-foreground">
                    {/* ✅ 오늘 날짜인지 확인하여 '오늘'로 표시 */}
                    {formatDateWithDay(msg.sentAt) === formatDateWithDay(new Date().toISOString()) ? '오늘' : formatDateWithDay(msg.sentAt)}
                  </span>
                  <div className="flex-grow border-t border-muted-foreground/30" />
                </div>
              )}
              
              {isSystemMessage ? (
                // 시스템 메시지 렌더링
                <div key={`system-${msg.id || index}`} className="flex items-center my-4">
                  <div className="flex-grow border-t border-muted-foreground/30" />
                  <span className="mx-3 text-xs text-muted-foreground">
                    {msg.message}
                  </span>
                  <div className="flex-grow border-t border-muted-foreground/30" />
                </div>
              ) : (
                // 일반/인증 메시지 렌더링
                <div
                  key={messageKey}
                  className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                  onMouseEnter={() => setHoveredMessageKey(messageKey)}
                  onMouseLeave={() => setHoveredMessageKey(null)}
                >
                  <div className={`relative flex items-end space-x-2 max-w-[80%] ${msg.isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!msg.isMe && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={getUserInfo(msg)?.profileImageUrl} alt={getUserInfo(msg)?.nickname} />
                        <AvatarFallback className="text-xs">{getUserInfo(msg)?.nickname?.[0] || '?'}</AvatarFallback>
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
                            msg.messageType === 'AUTH'
                              ? 'bg-green-50/80 border border-green-200/50 dark:bg-green-900/20 dark:border-green-700/50'
                              : msg.isMe
                              ? 'bg-chart-5 text-primary'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {msg.messageType === 'AUTH' && (
                            <div className="flex items-center space-x-1 mb-1">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span className="text-xs font-medium text-green-600 dark:text-green-400">루틴 인증 전송</span>
                            </div>
                          )}
                          {msg.messageType === 'ALBUM' && Array.isArray(msg.albumImages) && msg.albumImages.length > 0 ? (
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
                              <Button key={index} variant="ghost" className="text-2xl p-1 h-8 w-8" onClick={() => handleReactionClick(messageKey, emoji)}>
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