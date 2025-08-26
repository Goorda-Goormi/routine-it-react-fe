import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Send, Image, Smile } from 'lucide-react';

interface GroupChatInputProps {
  handleSendMessage: (text: string) => void;
  handleSendImage: (file: File) => void;
  handleSendAlbum: (files: FileList) => void;
}

export function GroupChatInput({ handleSendMessage, handleSendImage, handleSendAlbum }: GroupChatInputProps) {
  const [message, setMessage] = useState('');

  // 이모티콘 목록
  const emojis = ['😀', '😂', '👍', '❤️', '👏', '💪', '🎉', '🔥', '🤔', '😊', '😭', '😎', '👌', '🙏', '🤯'];

  const handleEmojiClick = (emoji: string) => {
    setMessage((prevMessage) => prevMessage + emoji);
  };

  const onSendMessage = () => {
    handleSendMessage(message);
    setMessage('');
  };

  return (
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
  );
}