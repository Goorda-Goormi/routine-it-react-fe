// src/api/client.ts 파일

import { refreshAuthToken } from './login';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 모든 fetch 요청을 이 함수로 대체합니다.
export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const accessToken = localStorage.getItem('accessToken');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
  };

  // 1. 첫 번째 API 요청 시도
  let response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // 2. 토큰 만료(401) 에러가 발생했는지 확인
  if (response.status === 401) {
    try {
      // 3. 토큰 갱신 시도
      const newAccessToken = await refreshAuthToken();
      
      // 갱신된 토큰으로 헤더를 다시 설정
      const newHeaders = {
        ...headers,
        'Authorization': `Bearer ${newAccessToken}`,
      };

      // 4. 원래 실패했던 요청을 새로운 토큰으로 재시도
      console.log('Retrying request with new token...');
      response = await fetch(`${BASE_URL}${path}`, { ...options, headers: newHeaders });

    } catch (error) {
      console.error('Token refresh failed:', error);
      // 5. 토큰 갱신 실패 시 사용자 로그아웃 처리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login'; // 로그인 페이지로 리디렉션
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
};