import type { UserProfile } from '../interfaces';
import { apiFetch } from './client';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const startKakaoLogin = () => {
  const BACKEND_KAKAO_LOGIN_URL = `${BASE_URL}/oauth2/authorization/kakao`;
  window.location.href = BACKEND_KAKAO_LOGIN_URL;
};

/**
 * 인증 토큰을 사용하여 사용자의 기본 정보와 프로필 정보를 모두 가져와 병합 후 반환합니다.
 * @param token - 사용자의 accessToken
 * @returns 병합된 사용자 정보 객체 (UserProfile)
 */

export const getUserInfo = async (): Promise<UserProfile> => {
    try {
    // 이제 apiFetch는 바로 JSON 데이터를 반환합니다.
    const authResult = await apiFetch('/api/auth/me'); 
    const profileResult = await apiFetch('/api/users/me');

    // 두 API 결과 병합
    const authData = authResult.data;
    const profileData = profileResult.data;

    const mergedUserData: UserProfile = {
      id: authData.id,
      email: authData.email,
      nickname: profileData.nickname,
      profileImageUrl: profileData.profileImageUrl,
      profileMessage: profileData.profileMessage,
      isAlarmOn: profileData.isAlarmOn,
      isDarkMode: profileData.isDarkMode,
      joinDate: '', 
      level: 0,
      exp: 0,
      maxExp: 3000,
      streakDays: 0,
    };

    return mergedUserData;
  } catch (error) {
    console.error("사용자 정보 조회 에러:", error);
    // apiFetch가 던진 에러를 그대로 다시 던지거나, 새로운 에러 메시지로 감쌉니다.
    throw new Error('사용자 정보를 불러오는 데 실패했습니다.');
  }
};

// export const getUserInfo = async (): Promise<UserProfile> => {
//     try {
//     const [authResult, profileResult, settingsResult] = await Promise.all([
//       apiFetch('/api/auth/me'), 
//       apiFetch('/api/users/me'),
//       apiFetch('/api/settings')
//     ]);

//     // 두 API 결과 병합
//     const authData = authResult.data;
//     const profileData = profileResult.data;
//     const settingsData = settingsResult.data;

//     const mergedUserData: UserProfile = {
//       id: authData.id,
//       email: authData.email,
//       nickname: profileData.nickname,
//       profileImageUrl: profileData.profileImageUrl,
//       profileMessage: profileData.profileMessage,
//       isAlarmOn: settingsData.isAlarmOn,
//       isDarkMode: settingsData.isDarkMode,
//       joinDate: '', 
//       level: 0,
//       exp: 0,
//       maxExp: 3000,
//       streakDays: 0,
//     };

//     return mergedUserData;
//   } catch (error) {
//     console.error("사용자 정보 조회 에러:", error);
//     // apiFetch가 던진 에러를 그대로 다시 던지거나, 새로운 에러 메시지로 감쌉니다.
//     throw new Error('사용자 정보를 불러오는 데 실패했습니다.');
//   }
// };

// 토큰 갱신 api
export const refreshAuthToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken: refreshToken })
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const result = await response.json();
  if (result.success && result.data.accessToken) {
   
    localStorage.setItem('accessToken', result.data.accessToken);
    if (result.data.refreshToken) {
      localStorage.setItem('refreshToken', result.data.refreshToken);
    }
    return result.data.accessToken; 
  } else {
    throw new Error('Failed to parse refresh token response');
  }
};