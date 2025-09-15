// TimePicker.tsx (예시)
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Clock } from "lucide-react";

interface TimePickerProps {
  value: string; // "HH:MM" 형식
  onChange: (value: string) => void;
}

export function CustomTimePicker({ value, onChange }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempHour, setTempHour] = useState('08');
  const [tempMinute, setTempMinute] = useState('00');

  // 0부터 23까지 시간 배열 생성
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  // 0부터 55까지 5분 단위 분 배열 생성
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  const handleSave = () => {
    onChange(`${tempHour}:${tempMinute}`);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Popover가 열릴 때, 현재 prop 값으로 임시 상태를 설정합니다.
      setTempHour(value.split(':')[0] || '08');
      setTempMinute(value.split(':')[1] || '00');
    }
    setIsOpen(open)
};

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? value : <span className="text-muted-foreground">시간 선택</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="flex items-center space-x-2">
          {/* 시간 선택 */}
          <Select defaultValue={tempHour} onValueChange={setTempHour}>
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="bottom" className="h-[200px]">
              {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
            </SelectContent>
          </Select>
          <span>:</span>
          {/* 분 선택 */}
          <Select defaultValue={tempMinute} onValueChange={setTempMinute}>
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="bottom" className="h-[200px]">
              {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSave} className="w-full mt-4">확인</Button>
      </PopoverContent>
    </Popover>
  );
}