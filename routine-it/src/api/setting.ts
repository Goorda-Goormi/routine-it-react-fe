import { apiFetch } from './client';

// API 명세에 따른 설정 정보 타입
interface UserSettings {
  userId: number;
  isAlarmOn: boolean;
  isDarkMode: boolean;
}

/**
 * 사용자의 설정 정보를 조회합니다.
 * @returns {Promise<UserSettings>} 사용자 설정 객체
 */
export const getSettings = async (): Promise<UserSettings> => {
  return await apiFetch('/api/settings');
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