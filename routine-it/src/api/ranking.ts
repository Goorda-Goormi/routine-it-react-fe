import { apiFetch } from './client';
import type { IPersonalRankingResponse, UserTotalScoreResponse } from '../interfaces';
import type { GlobalGroupRankingData } from '../pages/Ranking/RankingScreen';

export interface RankingResponse {
  success: boolean;
  message: string;
  data: {
    groupId: number;
    groupName: string | null;
    groupType: string | null;
    groupWeightMultiplier: number | null;
    monthYear: string;
    top3Users: GlobalGroupRankingData[];
    totalMembers: number;
    updatedAt: string;
  };
}



// 랭킹 점수 업데이트
// POST /api/rankings/update-score
export async function updateRankingScore(
  userId: number,
  groupId: number,
  score: number
) {
  try {
    const data = { userId, groupId, score };
    const result = await apiFetch("/api/rankings/update-score", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    console.error("랭킹 점수 업데이트 실패:", error);
    throw error;
  }
}
// 수정된 getPersonalRankings 함수
export const getPersonalRankings = async (
  userId: number, // userId를 필수 매개변수로 추가
  monthYear?: string
): Promise<IPersonalRankingResponse> => {
  try {
    const path = '/api/rankings/personal';
    const params = new URLSearchParams();

    // 필수 파라미터인 userId를 추가합니다.
    params.append('userId', userId.toString());

    if (monthYear) {
      params.append('monthYear', monthYear);
    }
    
    const responseData = await apiFetch(`${path}?${params.toString()}`);
    return responseData as IPersonalRankingResponse;
  } catch (error) {
    console.error('개인 랭킹 조회 실패:', error);
    throw error;
  }
};

// 사용자 총 점수 조회
// GET /api/rankings/me/total-score
/*
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
}*/


//==================================================//

// 그룹 랭킹 상위 3명 조회
/**
 * 특정 그룹 내 상위 3명의 랭킹을 조회합니다.
 * @param groupId 조회할 그룹 ID
 * @param monthYear 조회할 월 (YYYY-MM 형식, 선택 사항)
 * @returns 상위 3명의 랭킹 데이터 배열을 반환하는 Promise
 */
/*export const getGroupTop3Ranking = async (
  groupId: number,
  monthYear?: string
): Promise<GlobalGroupRankingData[]> => {
  try {
    const path = `/api/rankings/groups/${groupId}/top3`;
    const params = new URLSearchParams();

    // monthYear 매개변수가 있을 경우 URL 파라미터에 추가
    if (monthYear) {
      params.append('monthYear', monthYear);
    }
    
    // 최종 URL 생성 (monthYear가 있을 경우 쿼리 파라미터 추가)
    const url = monthYear ? `${path}?${params.toString()}` : path;
    
    const responseData = await apiFetch(url);
    return responseData as GlobalGroupRankingData[];
  } catch (error) {
    console.error('그룹 상위 3명 랭킹 조회 실패:', error);
    throw error;
  }
};*/
export const getGroupTop3Ranking = async (
  groupId: number,
  userId: number,
  monthYear?: string,
): Promise<RankingResponse> => {
  try {
    /*
    const path = `/api/rankings/groups/${groupId}/top3`;
    const params = new URLSearchParams();

    if (monthYear) {
      params.append('monthYear', monthYear);
    }

    const url = monthYear ? `${path}?${params.toString()}` : path;

    const response = await apiFetch(url);
    return response as RankingResponse; // response가 RankingResponse 타입임을 명시
  */
  const path = `/api/rankings/groups/${groupId}/top3`;
    const params = new URLSearchParams();

    // userId는 필수이므로 항상 쿼리 파라미터로 추가합니다.
    params.append('userId', userId.toString());

    // monthYear는 선택적이므로 값이 있을 때만 추가합니다.
    if (monthYear) {
      params.append('monthYear', monthYear);
    }
    
    // params.toString()을 사용하여 'monthYear=2025-09&userId=123' 와 같은 형식의 문자열을 만듭니다.
    const url = `${path}?${params.toString()}`;

    const response = await apiFetch(url);
    return response as RankingResponse;
    } catch (error) {
    console.error('그룹 상위 3명 랭킹 조회 실패:', error);
    throw error;
  }
};

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

/**
 * 현재 로그인한 사용자의 총 점수를 조회합니다.
 * @returns 모든 그룹의 활동 점수를 합산한 총 점수
 */
export async function getUserTotalScore(): Promise<UserTotalScoreResponse> {
  try {
    const responseData = await apiFetch("/api/rankings/me/total-score");
    return responseData as UserTotalScoreResponse;
  } catch (error) {
    console.error("사용자 총 점수 조회 실패:", error);
    throw error;
  }
}