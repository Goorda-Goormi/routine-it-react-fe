//import api from "./api";
import { apiFetch } from "./client";

export interface GroupRequest {
  groupName: string;
  groupDescription: string;
  groupType: "FREE" | "REQUIRED";
  alarmTime: { hour: number; minute: number; second: number; nano: number };
  authDays: string; // ^[01]{7}$ 패턴
  category: string;
  imageUrl: string;
  maxMembers: number;
}

//그룹 생성
export async function createGroup(data: GroupRequest) {
  const response = await apiFetch("/groups", {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // 에러가 발생하면 응답 내용을 바탕으로 에러 메시지를 생성할 수 있습니다.
    const errorData = await response.json().catch(() => ({ message: '그룹 생성에 실패했습니다.' }));
    throw new Error(errorData.message);
  }

  return response.json();
}

//그룹 편집
export async function updateGroup(groupId: number, data: GroupRequest) {
  const response = await apiFetch(`/groups/${groupId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '그룹 편집에 실패했습니다.' }));
    throw new Error(errorData.message);
  }

  return response.json();
}