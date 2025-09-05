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

  if (!response.ok) {
    // 7. 실패한 응답의 본문(body)에서 에러 메시지를 추출
    // response.json()은 Promise를 반환하므로 await를 사용해야 합니다.
    const errorData = await response.json().catch(() => {
      // JSON 파싱에 실패하는 경우 (예: 서버가 HTML 에러 페이지를 반환)
      return { message: `HTTP error! status: ${response.status}` };
    });
    
    // 8. 추출한 메시지로 새로운 Error 객체를 생성하여 throw
    // 서버 응답에 message 필드가 없을 경우를 대비해 기본 메시지를 설정합니다.
    throw new Error(errorData.message || 'An unknown error occurred.');
  }

  // 9. 성공적인 응답 처리 (예: 204 No Content 같이 내용이 없는 응답)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    // JSON 응답이 있는 경우, 파싱하여 반환
    return await response.json();
  }
  
  // JSON이 아닌 경우, 응답 객체 자체를 반환 (또는 필요에 따라 다르게 처리)
  return;
};

//   return response;
// };