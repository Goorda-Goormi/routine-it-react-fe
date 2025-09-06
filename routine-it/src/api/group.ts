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

// 그룹 탈퇴 (그룹 삭제)

export async function deleteGroup(groupId: number) {
  try {
    await apiFetch(`/groups/${groupId}`, {
      method: "DELETE",
    });
    console.log(`그룹 ${groupId} 탈퇴 성공`);
    return true; // 성공적으로 탈퇴했음을 알리기 위해 true 반환
  } catch (error) {
    console.error(`그룹 ${groupId} 탈퇴 실패:`, error);
    throw new Error("그룹 탈퇴 실패");
  }
}