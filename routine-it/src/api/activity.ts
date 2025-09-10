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
export const getUserActivitiesByDay = async (date: string) => {
  return await apiFetch(`/user-activities/day?date=${date}`);
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