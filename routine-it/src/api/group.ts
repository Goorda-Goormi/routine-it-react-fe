
import { apiFetch } from "./client";
import type { GroupMemberResponse, Group } from "../interfaces";
import { presignGet } from './storage';

export interface GroupRequest {
  groupName: string;
  groupDescription: string;
  groupType: "FREE" | "REQUIRED";
  alarmTime: string;
  authDays: string; // ^[01]{7}$ 패턴
  category: string;
  imageUrl?: string;
  maxMembers: number;
  alarm?:boolean;
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
export async function getAllGroups(): Promise<Group[]> {
  try {
    const allGroups = await apiFetch("/groups", {
       method: "GET" 
      });
    return allGroups; 
  } catch (error) {
    console.error("Failed to fetch all groups:", error);
    throw new Error("전체 그룹 조회 실패");
  }
}


/**
 * 가입된 그룹 리스트를 조회합니다.
 * @param userId 특정 사용자의 ID (없으면 내 정보 조회)
 */
export async function getJoinedGroups(userId?: number): Promise<Group[]> {
  try {
    const endpoint = userId ? `/groups/joined?userId=${userId}` : '/groups/joined'
    const joinedGroups = await apiFetch(endpoint, { method: "GET" });
    return joinedGroups; 
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
    return true; 
  } catch (error) {
    console.error(`그룹 ${groupId} 탈퇴 실패:`, error);
    throw new Error("그룹 탈퇴 실패");
  }
}

/**
 * 특정 그룹의 인증 대기중인 멤버 목록을 가져옵니다.
 * @param groupId - 그룹 ID
 */
export async function getPendingAuthMembers(groupId: number): Promise<GroupMemberResponse[]> {
  // 그룹 멤버 조회 API를 사용하되, status가 'PENDING'인 멤버만 필터링합니다.
  return apiFetch(`/group/${groupId}/members?status=PENDING`, { method: 'GET' });
}

/**
 * 리더가 멤버의 활동을 승인 또는 거절합니다.
 * @param payload - 승인/거절 처리에 필요한 데이터
 */
interface UpdateAuthStatusPayload {
  groupId: number;
  leaderId: number;
  targetMemberId: number;
  approved: boolean;
}

export async function updateAuthStatus(payload: UpdateAuthStatusPayload) {
  return apiFetch(`/group/${payload.groupId}/members/status`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}


/**
 * 그룹 루틴을 인증합니다.
 * @param groupId - 그룹 ID
 * @param data - 인증 데이터 (설명, 이미지 등)
 */
interface AuthRequestPayload {
  leaderId: number;
  targetMemberId: number;
  activityDate: string; // "YYYY-MM-DD" 형식
  imageUrl: string;
}

export async function requestAuthApproval(groupId: number, authData: AuthRequestPayload) {
  const payload = {
    ...authData,
    groupId,
    approved: true // 랭킹 업데이트를 위해 true
  };

  return apiFetch(`/group/${groupId}/approve-auth`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// 그룹 가입 요청 (인증 필요)
export async function requestJoinGroup(groupId: number, groupMemberId: number) {
  try {
    const response = await apiFetch(`/group/${groupId}/join`, {
      method: 'POST',
      body: JSON.stringify({
        groupId: groupId,
        groupMemberId: groupMemberId,
      }),
    });
    return response;
  } catch (error) {
    console.error(`그룹 ${groupId} 가입 요청 실패:`, error);
    throw new Error('그룹 가입 요청 실패');
  }
}

//리더 위임
export async function delegateLeader(groupId: number, leaderId: number, targetMemberId: number) {
  try {
    const response = await apiFetch(`/group/${groupId}/members/role`, {
      method: "PUT",
      body: JSON.stringify({
        groupId: groupId,
        leaderId: leaderId,
        targetMemberId: targetMemberId,
        status:"JOINED",
        role: "LEADER",
        approved:"true",
      }),
    });
    return response;
  } catch (error) {
    console.error("리더 위임 실패:", error);
    throw error;
  }
}

/**
 * 그룹 멤버의 상태, 역할, 인증 여부 등을 변경합니다.
 * @param groupId - 그룹 ID
 * @param data - 업데이트할 데이터를 담은 객체
 */
export async function updateGroupMemberStatus(
  groupId: number, 
  data: {
    groupId:number;
    leaderId: number;
    targetMemberId: number;
    status?: 'PENDING' | 'JOINED' | 'BLOCKED' | 'LEFT';
    role?: 'LEADER' | 'MEMBER';
    activityDate?: string;
    imageUrl?: string;
    approved?: boolean;
    message?: string;
  }
) {
  try {
    const response = await apiFetch(`/group/${groupId}/members/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error("그룹 멤버 상태 변경 실패:", error);
    throw error;
  }
}


/**
 * 인증된 사용자의 특정 날짜 활동 내역을 조회합니다.
 * @param date - YYYY-MM-DD 형식의 날짜 문자열
 * @returns 활동 목록 배열
 */
export async function getUserActivitiesByDay(date: string) {
  try {
    const activities = await apiFetch(`/user-activities/day?date=${date}`, {
      method: "GET",
    });
    return activities;
  } catch (error) {
    console.error(`Failed to fetch user activities for ${date}:`, error);
    throw new Error("사용자 활동 목록 조회 실패");
  }
}

/**
 * 특정 그룹의 PENDING 상태인 멤버 목록을 가져옵니다.
 * @param groupId - 그룹 ID
 * @returns PENDING 상태인 멤버 목록 배열
 */
export async function getPendingMembersByGroupId(groupId: number): Promise<GroupMemberResponse[]> {
  try {
    const pendingMembers = await apiFetch(`/group/${groupId}/members?status=PENDING`, {
      method: "GET",
    });
    return pendingMembers;
  } catch (error) {
    console.error(`그룹 ${groupId}의 PENDING 멤버 조회 실패:`, error);
    throw new Error("PENDING 멤버 조회 실패");
  }
}

/**
 * 특정 그룹에 대한 나의 알림 설정을 변경합니다.
 * @param groupId - 설정을 변경할 그룹의 ID
 * @param isAlarmOn - 새로운 알림 상태 (true/false)
 */
export const updateGroupMemberAlarm = async (groupId: number, isAlarmOn: boolean): Promise<void> => {
  // 쿼리 파라미터로 isAlarm 값을 전달합니다.
  await apiFetch(`/group/${groupId}/members/me?isAlarm=${isAlarmOn}`, {
    method: 'PUT',
  });
};



interface AuthApprovalPayload {
    groupId: number;
    leaderId?: number;
    targetMemberId?: number;
    status?: 'PENDING' | 'JOINED' | 'BLOCKED' | 'LEFT';
    role?: 'LEADER' | 'MEMBER';
    activityDate?: string;
    imageUrl?: string;
    approved: boolean;
}

/**
 * 리더가 멤버의 루틴 인증 요청을 승인 또는 거절합니다.
 * @param groupId - 그룹 ID
 * @param payload - 승인/거절 처리에 필요한 데이터
 */
export async function approveAuthRequest(groupId: number, payload: AuthApprovalPayload) {
    try {
        const response = await apiFetch(`/group/${groupId}/approve-auth`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        console.log(`그룹 ${groupId} 루틴 인증 처리 성공:`, response);
        return response;
    } catch (error) {
        console.error("루틴 인증 처리 실패:", error);
        throw error;
    }
}