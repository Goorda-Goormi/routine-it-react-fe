import { apiFetch } from './client';

export interface MonthlyReviewResponse {
  success: boolean;
  message: string;
  data: string; // 회고 전체 내용이 여기에 담겨 옵니다.
}

/**
 * 월간 회고 메시지를 가져옵니다.
 * @param monthYear - 대상 월 (YYYY-MM), 미입력시 이전 월
 */
export const getMonthlyReview = async (monthYear?: string): Promise<MonthlyReviewResponse> => {
  const params = new URLSearchParams();
  if (monthYear) {
    params.append('monthYear', monthYear);
  }
  
  // API 명세에 따라 POST 요청을 보냅니다.
  return await apiFetch(`/api/reviews/monthly?${params.toString()}`, {
    method: 'POST',
  });
};