import { apiFetch } from './client';

// API 응답의 data 객체 타입을 명세에 맞게 상세하게 정의합니다.
export interface MonthlyReviewData {
  userId: number;
  nickname: string;
  monthYear: string;
  messageContent: string; // 실제 회고 내용
  // 필요 시 다른 데이터들도 추가할 수 있습니다.
  totalScore: number;
  totalAuthCount: number;
  consecutiveDays: number;
}

export interface MonthlyReviewApiResponse {
  success: boolean;
  message: string;
  data: MonthlyReviewData;
}

/**
 * 사용자의 특정 월 회고 데이터를 조회합니다. (GET 요청)
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

  // 명세에 따라 GET 요청을 사용합니다.
  return await apiFetch(`/api/reviews/monthly?${params.toString()}`, {
    method: 'GET',
  });
};