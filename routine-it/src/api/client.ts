// src/api/client.ts 파일

import { refreshAuthToken } from './login';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 모든 fetch 요청을 이 함수로 대체합니다.
export const apiFetch = async (path: string, options: RequestInit = {}) => {
  console.log(`📤 API Request: ${options.method || 'GET'} ${path}`);
    
    // credentials: 'include' 옵션을 모든 요청에 기본으로 포함시킵니다.
    const config: RequestInit = {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };
    
    // Access Token이 있다면 헤더에 추가합니다.
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && config.headers) {
        (config.headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
    }
    
    try {
        let response = await fetch(`${BASE_URL}${path}`, config);
        console.log(`📥 API Response: ${response.status} ${response.statusText}`);
        
        // 401 오류 발생 시 토큰 갱신을 시도합니다.
        if (response.status === 401 && path !== '/api/auth/refresh') {
            console.log('🔒 401 Unauthorized - attempting token refresh');
            
            try {
                const newAccessToken = await refreshAuthToken();
                console.log('🔄 Retrying request with new token');
                
                // 새로운 토큰으로 헤더를 업데이트하여 원래 요청을 재시도합니다.
                if (config.headers) {
                    (config.headers as Record<string, string>).Authorization = `Bearer ${newAccessToken}`;
                }
                response = await fetch(`${BASE_URL}${path}`, config);
                
                console.log(`🔁 Retry response: ${response.status}`);
                
            } catch (refreshError) {
                console.error('💥 Token refresh failed:', refreshError);
                
                // 토큰 갱신 최종 실패 시 로그인 페이지로 이동시킵니다.
                localStorage.removeItem('accessToken');
                // window.location.href = '/login';
                throw refreshError;
            }
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
            console.error('❌ API error:', response.status, errorData);
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        
        // 응답 본문이 비어있을 수 있는 경우를 처리합니다.
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        }
        return; // 본문이 없는 성공 응답의 경우
        
    } catch (error) {
        console.error('💥 API fetch error:', error);
        throw error;
    }
};

//   return response;
// };