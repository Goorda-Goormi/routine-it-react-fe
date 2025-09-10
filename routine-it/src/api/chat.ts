import axios from 'axios';
import { apiFetch } from './client';

export const leaveGroup = async (roomId) => {
  try {
    const response =  await apiFetch(`/api/chat/rooms/${roomId}/leave`, {
     method: 'DELETE'
    });
    return response; 
  } catch (error) {
    console.error("그룹 탈퇴 오류:", error);
    throw error;
  }
};


// 채팅방의 이전 메시지 기록을 조회합니다.
export const fetchChatHistory = async (
    roomId: number,
    pageable: number = 20,
    beforeMessageId?: number,
): Promise<object> => {
  try {
    // 필수 쿼리 파라미터인 pageable을 포함한 URLSearchParams 객체 생성
    const params = new URLSearchParams({ size: String(pageable) });
    
    // beforeMessageId가 존재하는 경우에만 URL에 추가
    if (beforeMessageId) {
      params.append('beforeMessageId', String(beforeMessageId));
    }

    // 쿼리 파라미터가 포함된 URL로 apiFetch 호출
    const response = await apiFetch(`/api/chat/rooms/${roomId}/messages?${params.toString()}`);
    return response;
  } catch (error) {
    console.error("채팅 기록 조회 오류:", error);
    throw error;
  }
};

/*

// 자유 그룹 활동을 생성하는 API 함수
export const createGroupActivity = async (data) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('인증 토큰이 없습니다.');
    }

    try {
        const response = await apiFetch(`/user-activities/create`, {
            method: 'POST',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API 호출 실패: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("자유 그룹 활동 생성 오류:", error);
        throw error;
    }
};*/
export const BASE_URL = "http://54.180.93.1:8080";
/**
 * 자유 그룹 활동을 생성하고 서버에 제출합니다.
 * @param {object} data - 활동 데이터
 * @param {string} data.description - 활동 설명
 * @param {File} data.photo - 활동 이미지 파일
 * @param {boolean} data.isPublic - 활동 공개 여부
 * @param {number} data.groupId - 그룹 ID
 */
export const createGroupActivity = async (data) => {
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const today = new Date();
  const formattedDate = today.getFullYear() + '-' + 
                        ('0' + (today.getMonth() + 1)).slice(-2) + '-' + 
                        ('0' + today.getDate()).slice(-2);

  const requestBody = {
    activityType: "GROUP_AUTH_COMPLETE",  // enum 값
    groupId: data.groupId,
    description: data.description,        // 서버 스펙에 description 있으면 추가
    isPublic: data.isPublic,
    activityDate: formattedDate,
    imageUrl: data.photo ? "업로드된 이미지 URL" : null, 
  };

  try {
    const response = await axios.post(`${BASE_URL}/user-activities/create`, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('✅ 자유 그룹 활동 생성 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error("자유 그룹 활동 생성 오류:", error);
    throw error;
  }
};
