import React, { useState } from 'react';
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
  //getUserInfo: (userId: number) => any;
  getUserInfo: (message: Message) => any;
  handleReactionClick: (messageKey: string, emoji: string) => void;
  userInfo : UserProfile;
}

export function GroupChatMessages({ messages, myUserId, getUserInfo, handleReactionClick }: GroupChatMessagesProps) {
 console.log("GroupChatMessages.jsx - Received messages :", messages);
 
 const [hoveredMessageKey, setHoveredMessageKey] = useState<string | null>(null);
  const emojis = ['😀', '😂', '👍', '❤️', '👏', '💪', '🎉', '🔥', '🤔', '😊', '😭', '😎', '👌', '🙏', '🤯'];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
       {messages.map((msg, index) => {
         if (msg.messageType === 'ONLINE' || msg.messageType === 'OFFLINE') {
          return null; 
        }
   
        if (!['TALK', 'AUTH', 'IMAGE', 'ALBUM'].includes(msg.messageType)) {
          return (
            <div
              key={`system-${msg.id || index}`} // `msg.id`가 없을 경우를 대비해 `index` 사용
              className="flex items-center my-4"
            >
              <div className="flex-grow border-t border-muted-foreground/30" />
              <span className="mx-3 text-xs text-muted-foreground">
                {msg.message}
              </span>
              <div className="flex-grow border-t border-muted-foreground/30" />
            </div>
          );
        }

    // 기존 로직 (말풍선 UI)
    const userInfo = getUserInfo(msg);
    if (!userInfo) return null;
    const isMyMessage = msg.isMe;
    const messageKey = `${msg.senderNickname}-${msg.sentAt}-${msg.message || msg.imageUrl || msg.albumImages || ''}`;


          return (
            <div
              key={messageKey} // ✅ 고유한 키로 변경
              className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              onMouseEnter={() => setHoveredMessageKey(messageKey)} // ✅ 고유한 키로 변경
              onMouseLeave={() => setHoveredMessageKey(null)} // ✅ 고유한 키로 변경
            >
              <div className={`relative flex items-end space-x-2 max-w-[80%] ${isMyMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isMyMessage && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={userInfo.profileImageUrl} alt={msg.nickname} />
                    <AvatarFallback className="text-xs">{msg.nickname[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                  {!isMyMessage && (
                    <div className="flex items-center space-x-1 mb-1">
                      <span className="text-xs text-muted-foreground">{msg.nickname}</span>
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
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">루틴 인증 전송</span>
                      </div>
                    )}
                    {msg.type === 'album' ? (
                      <div className="grid grid-cols-2 gap-2">
                        {msg.albumImages?.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`앨범 이미지 ${idx + 1}`}
                            className="w-full max-h-[150px] object-cover rounded-lg cursor-pointer"
                            onClick={() => window.open(img, '_blank')}
                          />
                        ))}
                      </div>
                    ) : msg.type === 'image' ? (
                      <img
                        src={msg.imageUrl}
                        alt="보낸 이미지"
                        className="max-w-[200px] rounded-lg cursor-pointer"
                        onClick={() => window.open(msg.imageUrl, '_blank')}
                      />
                    ) : (
                      <p className="text-sm">{msg.message}</p>
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
                  <span className="text-xs text-muted-foreground mt-1">{msg.time}</span>
                </div>

                {hoveredMessageKey === messageKey && ( // ✅ 고유한 키로 변경
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`absolute bottom-0 p-1 w-6 h-6 rounded-full bg-background/90 text-card-foreground hover:bg-card hover:text-card-foreground border border-border transition-opacity duration-200 z-10 ${
                          isMyMessage ? 'left-[-1rem]' : 'right-[-1rem]'
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
          );
        })}
      </div>
    </div>
  );
}