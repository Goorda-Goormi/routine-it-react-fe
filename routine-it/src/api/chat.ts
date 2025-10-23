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

// page를 쿼리 파라미터로 받는 새로운 함수
export const fetchChatHistoryByPage = async (
    roomId: number,
    page: number = 0, // 페이지 번호 (보통 0부터 시작)
    size: number = 20, // 한 페이지에 불러올 메시지 수
): Promise<object> => {
  try {
    const params = new URLSearchParams({ 
      page: String(page),
      size: String(size),
    });
    
    const response = await apiFetch(`/api/chat/rooms/${roomId}/messages?${params.toString()}`);
    return response;
  } catch (error) {
    console.error("채팅 기록 조회 오류:", error);
    throw error;
  }
};


// 특정 메시지의 모든 이모지 리액션을 조회
export const fetchMessageReactions = async (messageId: number): Promise<object> => {
  try {
    const response = await apiFetch(`/api/chat/messages/${messageId}/reactions`);
    return response;
    } catch (error) {
    console.error(`메시지 ${messageId}의 리액션 조회 오류:`, error);
    throw error;
  }
};

 // 채팅 메시지에 이모지 리액션을 추가
export const addMessageReaction = async (messageId: number, emoji: string): Promise<object> => {
  try {
    const response = await apiFetch(`/api/chat/messages/${messageId}/reactions`, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
    body: JSON.stringify({ messageId, emoji }),
    });
  return response;
  } catch (error) {
    console.error(`메시지 ${messageId}에 리액션 '${emoji}' 추가 오류:`, error);
    throw error;
  }
  };


// 특정 메시지의 이모지별 리액션 요약 정보를 조회

export const fetchReactionSummary = async (messageId: number): Promise<object> => {
  try {
    const response = await apiFetch(`/api/chat/messages/${messageId}/reactions/summary`);
    return response;
  } catch (error) {
    console.error(`메시지 ${messageId}의 리액션 요약 조회 오류:`, error);
    throw error;
  }
};


 // 채팅 메시지에서 이모지 리액션을 제거
export const removeMessageReaction = async (messageId: number, emoji: string): Promise<object> => {
  try {
     // URL의 {emoji} 부분은 인코딩되어야 할 수 있습니다 (예: 슬래시 같은 특수 문자 방지)
    const encodedEmoji = encodeURIComponent(emoji);
    const response = await apiFetch(`/api/chat/messages/${messageId}/reactions/${encodedEmoji}`, {
       method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error(`메시지 ${messageId}에서 리액션 '${emoji}' 제거 오류:`, error);
    throw error;
  }
};