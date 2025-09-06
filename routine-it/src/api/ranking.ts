import { apiFetch } from './client';
import type { IPersonalRankingResponse } from '../interfaces';

// 랭킹 점수 업데이트
// POST /api/rankings/update-score
export async function updateRankingScore(
  userId: number,
  groupId: number | null,
  score: number
) {
  try {
    const data = { userId, groupId, score };
    const result = await apiFetch("/rankings/update-score", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    console.error("랭킹 점수 업데이트 실패:", error);
    throw error;
  }
}

/**
 * 개인 랭킹을 조회하는 함수
 * @param monthYear 조회할 월 (YYYY-MM 형식), 선택적 매개변수
 * @returns IPersonalRankingResponse 형태의 Promise
 */
export const getPersonalRankings = async (
  monthYear?: string
): Promise<IPersonalRankingResponse> => {
  try {
    const path = '/api/rankings/personal';
    const params = new URLSearchParams(); // 쿼리 파라미터를 위한 URLSearchParams 객체 사용

    if (monthYear) {
      params.append('monthYear', monthYear);
    }
    
    // apiFetch 함수를 사용하여 GET 요청을 보냅니다.
    // URLSearchParams.toString()을 사용하여 'monthYear=YYYY-MM' 형식으로 변환
    const responseData = await apiFetch(`${path}?${params.toString()}`);

    // apiFetch는 이미 성공적인 응답의 JSON을 파싱하여 반환하므로,
    // 바로 반환 타입에 맞게 캐스팅하여 사용하면 됩니다.
    return responseData as IPersonalRankingResponse;
  } catch (error) {
    // apiFetch에서 이미 에러를 throw하므로, 여기서는 에러를 로깅만 합니다.
    console.error('개인 랭킹 조회 실패:', error);
    throw error; // 에러를 다시 throw하여 호출한 곳에서 처리할 수 있게 합니다.
  }
};

// 사용자 총 점수 조회
// GET /api/rankings/me/total-score
export async function getUserTotalScore(userId: number) {
  try {
    const params = new URLSearchParams({
      userId: userId.toString(),
    });
    const response = await apiFetch(`/api/rankings/me/total-score?${params.toString()}`, {
      method: "GET",
    });
    return response.data;
  } catch (error) {
    console.error("사용자 총 점수 조회 실패:", error);
    throw error;
  }
}

// 그룹 랭킹 상위 3명 조회
// GET /api/rankings/groups/{groupId}/top3
export async function getGroupTop3Ranking(
  groupId: number,
  monthYear?: string,
  userId?: number
) {
  try {
    const params = new URLSearchParams();
    if (monthYear) {
      params.append("monthYear", monthYear);
    }
    if (userId) {
      params.append("userId", userId.toString());
    }
    
    const url = `api/rankings/groups/${groupId}/top3?${params.toString()}`;
    const response = await apiFetch(url, { method: "GET" });
    return response.data;
  } catch (error) {
    console.error(`그룹 ID ${groupId}의 상위 3명 랭킹 조회 실패:`, error);
    throw error;
  }
}

// 그룹별 전체 랭킹 조회
// GET /api/rankings/groups/global
export async function getGlobalGroupRanking(
  monthYear?: string,
  category?: string,
  groupType?: 'OPTIONAL' | 'MANDATORY',
  page: number = 0,
  size: number = 20
): Promise<GlobalGroupRankingData> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (monthYear) {
      params.append("monthYear", monthYear);
    }
    if (category) {
      params.append("category", category);
    }
    if (groupType) {
      params.append("groupType", groupType);
    }

    const response = await apiFetch(`/api/rankings/groups/global?${params.toString()}`, {
      method: "GET",
    });
    // API 응답 구조를 기반으로 데이터 반환
    return response.data[0]; // 배열의 첫 번째 요소를 반환
  } catch (error) {
    console.error("그룹별 전체 랭킹 조회 실패:", error);
    throw error;
  }
}