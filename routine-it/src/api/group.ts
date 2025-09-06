//import api from "./api";
import { apiFetch } from "./client";
import type { GroupMemberResponse } from "../interfaces";

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
/*
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
}*/
export async function createGroup(data: GroupRequest) {
  try {
    const createdData = await apiFetch("/groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return createdData;
  } catch (error) {
    console.error("그룹 생성 실패:", error);
    throw error;
  }
}


//그룹 편집
/*
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
}*/
export async function updateGroup(groupId: number, data: GroupRequest) {
  try {
    const updatedData = await apiFetch(`/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return updatedData;
  } catch (error) {
    console.error("그룹 편집 실패:", error);
    throw error;
  }
}


// 전체 그룹 리스트 조회
export async function getAllGroups() {
  // apiFetch가 이미 JSON을 반환하므로, 바로 변수에 할당합니다.
  try {
    const allGroups = await apiFetch("/groups", { method: "GET" });
    return allGroups; // JSON 데이터가 담긴 배열을 반환
  } catch (error) {
    // apiFetch에서 이미 에러를 throw하므로, 여기서는 단순히 다시 던지거나
    // 특정 에러 메시지를 추가하면 됩니다.
    console.error("Failed to fetch all groups:", error);
    throw new Error("전체 그룹 조회 실패");
  }
}


// 가입된 그룹 리스트 조회
export async function getJoinedGroups() {
  try {
    const joinedGroups = await apiFetch("/groups/joined", { method: "GET" });
    return joinedGroups; // JSON 데이터가 담긴 배열을 반환
  } catch (error) {
    console.error("Failed to fetch joined groups:", error);
    throw new Error("가입된 그룹 조회 실패");
  }
}


// 그룹 상세 조회
export async function getGroupDetail(groupId: number) {
  try {
    const groupDetail = await apiFetch(`/groups/${groupId}`, { method: "GET" });
    return groupDetail;
  } catch (error) {
    console.error(`Failed to fetch group detail for ID ${groupId}:`, error);
    throw new Error("그룹 상세 조회 실패");
  }
}
// 그룹 멤버 목록 조회
/*export async function getGroupMembers(groupId: number) {
  try {
    const members = await apiFetch(`/groups/${groupId}/members`, {
      method: "GET",
    });
    return members;
  } catch (error) {
    console.error(`Failed to fetch group members for ID ${groupId}:`, error);
    throw new Error("그룹 멤버 조회 실패");
  }
}*/
export async function getGroupMembers(groupId: number): Promise<GroupMemberResponse[]> {
  try {
    const members = await apiFetch(`/group/${groupId}/members`, {
      method: "GET",
    });
    return members;
  } catch (error) {
    console.error(`Failed to fetch group members for ID ${groupId}:`, error);
    throw new Error("그룹 멤버 조회 실패");
  }
}