import { apiFetch } from './client';

// 개인 루틴 객체 타입
export interface PersonalRoutineResponse {
  routineId: number;
  userId: number;
  routineName: string;
  description: string;
  startTime: string; 
  repeatDays: string; 
  startDate: string; 
  endDate: string; 
  isAlarmOn: boolean;
  isPublic: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// 개인 루틴 생성을 위한 요청 데이터 타입
export interface PersonalRoutineCreatePayload {
  userId: number;
  routineName: string;
  description?: string;
  startTime: string; 
  repeatDays: string; 
  startDate: string; 
  endDate: string; 
  isAlarmOn?: boolean;
  isPublic?: boolean;
}

// 개인 루틴 수정을 위한 요청 데이터 타입 (모두 선택적)
export type PersonalRoutineUpdatePayload = Partial<Omit<PersonalRoutineCreatePayload, 'userId'>>;

/**
 * 새로운 개인 루틴을 생성합니다.
 */
export const createPersonalRoutine = async (payload: PersonalRoutineCreatePayload): Promise<PersonalRoutineResponse> => {
  return await apiFetch('/api/personal-routines', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * 특정 사용자의 모든 개인 루틴 목록을 조회합니다.
 */
export const getPersonalRoutinesByUser = async (userId: number): Promise<PersonalRoutineResponse[]> => {
  return await apiFetch(`/api/personal-routines/user/${userId}`);
};

/**
 * 기존 개인 루틴의 정보를 수정합니다.
 */
export const updatePersonalRoutine = async (routineId: number, payload: PersonalRoutineUpdatePayload): Promise<PersonalRoutineResponse> => {
  return await apiFetch(`/api/personal-routines/${routineId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

/**
 * 개인 루틴을  삭제합니다.
 */
export const deletePersonalRoutine = async (routineId: number): Promise<void> => {
  // DELETE 요청은 보통 내용이 없는 204 No Content를 반환하므로 void 처리합니다.
  await apiFetch(`/api/personal-routines/${routineId}`, {
    method: 'DELETE',
  });
};

/**
 * 특정 루틴의 공개 여부를 토글합니다.
 */
export const toggleRoutinePublic = async (routineId: number): Promise<PersonalRoutineResponse> => {
  return await apiFetch(`/api/personal-routines/${routineId}/toggle-public`, {
    method: 'POST',
  });
};

/**
 * 특정 루틴의 알림 여부를 토글합니다.
 */
export const toggleRoutineAlarm = async (routineId: number): Promise<PersonalRoutineResponse> => {
  return await apiFetch(`/api/personal-routines/${routineId}/toggle-alarm`, {
    method: 'POST',
  });
};
