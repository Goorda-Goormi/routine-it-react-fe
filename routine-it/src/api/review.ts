import { apiFetch } from './client';

// API 응답 데이터의 타입을 명확하게 정의합니다.
export interface MonthlyReviewData {
  userId: number;
  nickname: string;
  monthYear: string;
  messageContent: string; // 실제 회고 내용
}

export interface MonthlyReviewApiResponse {
  success: boolean;
  message: string;
  data: MonthlyReviewData;
}

/**
 * 사용자의 특정 월 회고 데이터를 조회합니다.
 * @param userId - 조회할 사용자의 ID
 * @param monthYear - 대상 월 (YYYY-MM), 미입력시 이전 월
 */
export const getMonthlyReview = async (userId: number, monthYear?: string): Promise<MonthlyReviewApiResponse> => {
  const params = new URLSearchParams({
    userId: String(userId),
  });
  if (monthYear) {
    params.append('monthYear', monthYear);
  }

  // API 명세에 따라 GET 요청으로 수정합니다.
  return await apiFetch(`/api/reviews/monthly?${params.toString()}`, {
    method: 'GET',
  });
};