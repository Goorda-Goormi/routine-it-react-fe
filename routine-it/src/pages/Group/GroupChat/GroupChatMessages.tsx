import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Button } from '../../../components/ui/button';
import { Smile, CheckCircle } from 'lucide-react';
import { getStreakInfo } from '../../../components/utils/streakUtils';
import { Message } from './GroupChatScreen';

interface GroupChatMessagesProps {
  messages: Message[];
  myUserId: number;
  getUserInfo: (userId: number) => any;
  handleReactionClick: (messageId: number, emoji: string) => void;
}

export function GroupChatMessages({ messages, myUserId, getUserInfo, handleReactionClick }: GroupChatMessagesProps) {
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);

  // 이모티콘 목록
  const emojis = ['😀', '😂', '👍', '❤️', '👏', '💪', '🎉', '🔥', '🤔', '😊', '😭', '😎', '👌', '🙏', '🤯'];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {messages.map((msg) => {
          const userInfo = getUserInfo(msg.userId);
          const streakInfo = getStreakInfo(userInfo.streakDays);
          const isMyMessage = msg.userId === myUserId;

          return (
            <div
              key={msg.id}
              className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              <div className={`relative flex items-end space-x-2 max-w-[80%] ${isMyMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isMyMessage && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={userInfo.avatar} alt={msg.user} />
                    <AvatarFallback className="text-xs">{msg.user[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                  {!isMyMessage && (
                    <div className="flex items-center space-x-1 mb-1">
                      <span className="text-sm">{streakInfo.icon}</span>
                      <span className="text-xs text-muted-foreground">{msg.user}</span>
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

                {hoveredMessageId === msg.id && (
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
                          <Button key={index} variant="ghost" className="text-2xl p-1 h-8 w-8" onClick={() => handleReactionClick(msg.id, emoji)}>
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