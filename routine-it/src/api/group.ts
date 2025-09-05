//import api from "./api";
import { apiFetch } from "./client";

export interface GroupRequest {
  groupName: string;
  groupDescription: string;
  groupType: "FREE" | "REQUIRED";
  alarmTime: string;
  authDays: string; // ^[01]{7}$ 패턴
  category: string;
  imageUrl: string;
  maxMembers: number;
}

//그룹 생성

export async function createGroup(data: GroupRequest) {
  const response = await apiFetch("/groups", {
    method: "POST",
    body: JSON.stringify(data),
  });

  // 201 Created 응답인 경우, 정상 처리
  if (response.status === 201) {
    // 백엔드가 본문을 반환하는 경우를 대비해 JSON 파싱을 시도
    try {
      const createdData = await response.json();
      return createdData;
    } catch {
      // 본문이 없거나 파싱에 실패하면, 성공 메시지만 전달
      // 이 경우, 'onCreateGroup'에 넘길 데이터가 없으므로 필요에 따라 로직 수정이 필요합니다.
      return { message: "그룹이 성공적으로 생성되었습니다." };
    }
  }

  // 성공 응답이지만 201이 아닌 경우 (예: 200 OK)
  if (response.ok) {
    // 200 OK 등 다른 성공 응답도 처리할 수 있도록 추가
    const text = await response.text();
    return text ? JSON.parse(text) : true;
  }
  
  // 실패 응답인 경우
  const errorData = await response.json().catch(() => ({ message: "그룹 생성에 실패했습니다." }));
  throw new Error(errorData.message);
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