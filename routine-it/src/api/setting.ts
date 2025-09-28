import { apiFetch } from './client';

// API 명세에 따른 설정 정보 타입
interface UserSettings {
  userId: number;
  isAlarmOn: boolean;
  isDarkMode: boolean;
}

/*
/**
 * 사용자의 설정 정보를 조회합니다.
 * @returns {Promise<UserSettings>} 사용자 설정 객체
 */

/**
 * 사용자의 설정 정보를 조회합니다.
 */
export const getSettings = async (): Promise<UserSettings> => {
  const response = await apiFetch('/api/settings');
  // API가 { success, data } 형태로 감싸서 반환하므로 data를 반환합니다.
  return response.data;
};

/**
 * 다크모드를 켜고/끕니다.
 * @param {boolean} enabled - 활성화 여부
 * @returns {Promise<boolean>} 변경된 다크모드 상태
 */
export const toggleDarkMode = async (enabled: boolean): Promise<boolean> => {
  return await apiFetch(`/api/settings/dark-mode?enabled=${enabled}`, {
    method: 'PATCH',
  });
};

/**
 * 알림 설정을 켜고/끕니다.
 * @param {boolean} enabled - 활성화 여부
 * @returns {Promise<boolean>} 변경된 알림 상태
 */
export const toggleAlarm = async (enabled: boolean): Promise<boolean> => {
  return await apiFetch(`/api/settings/alarm?enabled=${enabled}`, {
    method: 'PATCH',
  });
};

/**
 * 사용자 설정을 기본값으로 초기화합니다.
 */
export const resetSettings = async (): Promise<void> => {
  await apiFetch('/api/settings/reset', {
    method: 'POST',
  });
};