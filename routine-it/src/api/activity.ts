// src/api/activity.ts

import { apiFetch } from './client';
import { presignGet } from './storage'; 

/**
 * 개인 루틴 완료 활동을 생성합니다.
 */
export const createPersonalActivity = async (personalRoutineId: number) => {
  const today = new Date();
  const formattedDate =
    today.getFullYear() +
    '-' +
    ('0' + (today.getMonth() + 1)).slice(-2) +
    '-' +
    ('0' + today.getDate()).slice(-2);

  const requestBody = {
    activityType: 'PERSONAL_ROUTINE_COMPLETE',
    personalRoutineId: personalRoutineId,
    activityDate: formattedDate,
  };

  return await apiFetch('/user-activities/create', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
};

/**
 * 특정 날짜의 모든 사용자 활동 목록을 조회합니다.
 * @param date 조회할 날짜 (YYYY-MM-DD)
 * @param userId (선택) 특정 사용자의 활동을 조회할 경우
 */
export const getUserActivitiesByDay = async (date: string, userId?: number) => {
  const params = new URLSearchParams({ date });
  if (userId) {
    params.append('userId', String(userId));
  }
  
  return await apiFetch(`/user-activities/day?${params.toString()}`);
};

/**
 * 그룹 활동을 생성합니다.
 */
export const createGroupActivity = async (data: {
  groupId: number;
  description: string;
  imageUrl: string | null;
  isPublic: boolean;
}) => {
  const today = new Date();
  const formattedDate =
    today.getFullYear() +
    '-' +
    ('0' + (today.getMonth() + 1)).slice(-2) +
    '-' +
    ('0' + today.getDate()).slice(-2);

  const requestBody = {
    activityType: 'GROUP_AUTH_COMPLETE',
    groupId: data.groupId,
    imageUrl: data.imageUrl,
    isPublic: data.isPublic,
    activityDate: formattedDate,
  };

  return await apiFetch('/user-activities/create', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
};

/**
 * 사용자 활동을 수정합니다. (예: 완료 -> 미완료로 변경)
 * @param userActivityId 수정할 활동의 고유 ID
 * @param activityType 변경할 활동 타입
 */
export const updateActivity = async (userActivityId: number, activityType: 'NOT_COMPLETED') => {
  const requestBody = {
    activityId: userActivityId, 
    activityType,
  };

  return await apiFetch('/user-activities/update', {
    method: 'PUT',
    body: JSON.stringify(requestBody),
  });
};

/**
 * 사용자의 인증 사진 목록을 조회합니다.
 * @param targetUserId 조회할 사용자의 ID (없으면 내 사진 조회)
 */
export const getUserAuthPhotos = async (targetUserId?: number) => {
  const params = new URLSearchParams();
  if (targetUserId) {
    params.append('targetUserId', String(targetUserId));
  }
   const response = await apiFetch(`/user-activities/info?${params.toString()}`);
   let activities = Array.isArray(response) ? response : response.data;

   if (Array.isArray(activities)) {
        // map을 사용하여 각 활동의 imageUrl을 변환합니다. Promise.all로 모든 변환을 병렬 처리합니다.
        activities = await Promise.all(
            activities.map(async (activity) => {
                let finalImageUrl = activity.imageUrl;
                // imageUrl이 있고, http로 시작하지 않는다면 S3 key로 간주합니다.
                if (finalImageUrl && !finalImageUrl.startsWith('http')) {
                    try {
                        const { url } = await presignGet(finalImageUrl);
                        finalImageUrl = url;
                    } catch (e) {
                        console.error(`인증 사진(key: ${activity.imageUrl})의 URL을 가져오는데 실패했습니다:`, e);
                    }
                }
                return { ...activity, imageUrl: finalImageUrl };
            })
        );
    }
    return activities; 
};

/**
 * 기간 동안의 누적 출석 일수를 조회합니다.
 */
export const getTotalAttendanceDays = async (params: { 
  targetUserId?: number; 
  startDate?: string; 
  endDate?: string; 
} = {}): Promise<number> => {

  const queryParams = new URLSearchParams();
  if (params.targetUserId) {
    queryParams.append('targetUserId', String(params.targetUserId));
  }
  if (params.startDate) {
    queryParams.append('startDate', params.startDate);
  }
  if (params.endDate) {
    queryParams.append('endDate', params.endDate);
  }

  try {
    const responseData = await apiFetch(`/user-activities/attendance/total?${queryParams.toString()}`);
   
    if (typeof responseData === 'number') {
      return responseData;
    }
    
    if (responseData && typeof responseData.data === 'number') {
      return responseData.data;
    }
    
    return 0; 

  } catch (error) {
    console.error("누적 출석일 조회 실패:", error);
    return 0;
  }
};

/**
 * 특정 날짜의 출석 여부를 확인합니다.
 * @param date 확인할 날짜 (YYYY-MM-DD)
 */
export const checkAttendance = async (date: string): Promise<boolean> => {
  const params = new URLSearchParams({ date });
  const responseData = await apiFetch(`/user-activities/attendance/check?${params.toString()}`);

  return responseData.data ?? false;
};