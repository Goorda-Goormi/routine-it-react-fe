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

/*export const getSettings = async (): Promise<UserSettings> => {
  return await apiFetch('/api/settings', {
    method: 'GET',
  });
};*/
export const getSettings = async (): Promise<UserSettings> => {
  // ✅ API 호출 시작 메시지
  console.log('➡️ getSettings API 호출을 시작합니다.');

  try {
    const response = await apiFetch('/api/settings', {
      method: 'GET',
    });
    
    // ✅ API 호출 성공 메시지
    console.log('✅ getSettings API 호출 성공!');
    console.log('응답 데이터:', response);
    
    return response;
  } catch (error) {
    // ✅ API 호출 실패 메시지
    console.error('❌ getSettings API 호출 실패!');
    console.error('에러 상세:', error);
    
    // 에러를 다시 던져서 호출한 쪽에서 처리할 수 있도록 합니다.
    throw error;
  }
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