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