import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Smile, CheckCircle, Send, Image } from 'lucide-react';

interface GroupChatProps {
  messages: Message[];
  myUserId: number;
  getUserInfo: (message: Message) => any;
  handleReactionClick: (messageKey: string, emoji: string) => void;
  userInfo: UserProfile;
  handleSendMessage: (text: string) => void;
  handleSendImage: (file: File) => void;
  handleSendAlbum: (files: FileList) => void;
}

export function GroupChatMessage({
  messages,
  myUserId,
  getUserInfo,
  handleReactionClick,
  userInfo,
  handleSendMessage,
  handleSendImage,
  handleSendAlbum,
}: GroupChatProps) {
  const [hoveredMessageKey, setHoveredMessageKey] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const emojis = ['😀', '😂', '👍', '❤️', '👏', '💪', '🎉', '🔥', '🤔', '😊', '😭', '😎', '👌', '🙏', '🤯'];

  const handleEmojiClick = (emoji: string) => {
    setMessage((prevMessage) => prevMessage + emoji);
  };

  const onSendMessage = () => {
    if (message.trim()) {
      handleSendMessage(message);
      setMessage('');
    }
  };

  return (
    <>
      {/* 메시지 목록 부분 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          {messages.map((msg) => {
            const senderInfo = getUserInfo(msg);
            if (!senderInfo) {
              return null;
            }

            const isMyMessage = msg.isMe;
            const messageKey = `${msg.nickname}-${msg.time}-${msg.message}`;

            return (
              <div
                key={messageKey}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                onMouseEnter={() => setHoveredMessageKey(messageKey)}
                onMouseLeave={() => setHoveredMessageKey(null)}
              >
                <div className={`relative flex items-end space-x-2 max-w-[80%] ${isMyMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isMyMessage && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={senderInfo.profileImageUrl} alt={msg.nickname} />
                      <AvatarFallback className="text-xs">{msg.nickname[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                    {!isMyMessage && (
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-xs text-muted-foreground">{msg.nickname}</span>
                        <span className="text-xs text-muted-foreground opacity-70">{senderInfo.streakDays}일</span>
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
                  {hoveredMessageKey === messageKey && (
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

      {/* 메시지 입력 부분 */}
      <div className="sticky bottom-0 border-t border-t-[var(--color-border-bottom-custom)] bg-background">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 bg-muted rounded-lg p-2">
                <input
                  type="file"
                  id="chat-image"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      if (e.target.files.length === 1) {
                        handleSendImage(e.target.files[0]);
                      } else {
                        handleSendAlbum(e.target.files);
                      }
                    }
                    e.target.value = '';
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 text-card-foreground hover:text-card-foreground"
                  onClick={() => document.getElementById('chat-image')?.click()}
                >
                  <Image className="h-4 w-4 icon-secondary" />
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="border-0 bg-transparent focus-visible:ring-0 p-0 text-foreground placeholder:text-muted-foreground"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      onSendMessage();
                    }
                  }}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-1 text-card-foreground hover:text-card-foreground">
                      <Smile className="h-4 w-4 icon-secondary" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-2 bg-background/95 backdrop-blur border-border" align="end" side="top" sideOffset={10}>
                    <div className="grid grid-cols-5 gap-2 w-full">
                      {emojis.map((emoji, index) => (
                        <Button key={index} variant="ghost" className="text-2xl p-1 h-10 w-10" onClick={() => handleEmojiClick(emoji)}>
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button onClick={onSendMessage} className="rounded-full p-2 h-10 w-10" disabled={!message.trim()}>
              <Send className="h-4 w-4 icon-primary" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}