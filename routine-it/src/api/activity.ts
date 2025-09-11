import { apiFetch } from './client';

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
 */
export const getUserActivitiesByDay = async (date: string, userId?: number) => {
  const endpoint = userId ? `/user-activities/day?date=${date}&userId=${userId}` : `/user-activities/day?date=${date}`;
  return await apiFetch(endpoint);
};

/**
 * 그룹 활동을 생성합니다. (자유/의무 그룹 공통)
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
 * @param activityId 수정할 활동의 고유 ID
 * @param activityType 변경할 활동 타입
 */
export const updateActivity = async (activityId: number, activityType: 'NOT_COMPLETED') => {
  const requestBody = {
    activityId,
    activityType,
  };

  console.log('🔵 취소 요청으로 서버에 보낼 데이터:', requestBody); 

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
  return response.data;
};

/**
 * 연속 출석 일수를 조회합니다.
 * @param baseDate 기준 날짜 (YYYY-MM-DD), 없으면 오늘 기준
 */
export const getAttendanceStreak = async (baseDate?: string) => {
  const params = new URLSearchParams();
  if (baseDate) {
    params.append('baseDate', baseDate);
  }
  return await apiFetch(`/user-activities/attendance/streak?${params.toString()}`);
};

/**
 * 특정 날짜의 출석 여부를 확인합니다.
 * @param date 확인할 날짜 (YYYY-MM-DD)
 */
export const checkAttendance = async (date: string) => {
  const params = new URLSearchParams({ date });
  return await apiFetch(`/user-activities/attendance/check?${params.toString()}`);
};