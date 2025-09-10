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
export const updateRankingScore = async (
     userId: number,
     groupId: number,
    authCount: number
): Promise<any> => {
    try {
        console.log("updateRankingScore 함수에 전달된 groupId:", groupId);
        const params = new URLSearchParams();
        params.append('userId', String(userId));
        params.append('groupId', String(groupId));
        params.append('authCount', String(authCount));
         console.log("API 호출 URL 파라미터:", params.toString());
        return await apiFetch(`/api/rankings/update-score?${params.toString()}`, {
        method: 'POST',
     });
    } catch (error) {
        console.error("랭킹 점수 업데이트 실패:", error);
        throw error;
    }
};

// 개인랭킹
export const getPersonalRankings = async (
  userId: number, 
  monthYear?: string
): Promise<IPersonalRankingResponse> => {
  try {
    const path = '/api/rankings/personal';
    const params = new URLSearchParams();

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


// 그룹 랭킹 상위 3명 조회
/**
 * 특정 그룹 내 상위 3명의 랭킹을 조회합니다.
 * @param groupId 조회할 그룹 ID
 * @param monthYear 조회할 월 (YYYY-MM 형식, 선택 사항)
 * @returns 상위 3명의 랭킹 데이터 배열을 반환하는 Promise
 */

export const getGroupTop3Ranking = async (
  groupId: number,
  userId: number,
  monthYear?: string,
): Promise<RankingResponse> => {
  try {
  const path = `/api/rankings/groups/${groupId}/top3`;
    const params = new URLSearchParams();

    params.append('userId', userId.toString());

    if (monthYear) {
      params.append('monthYear', monthYear);
    }
    const url = `${path}?${params.toString()}`;

    const response = await apiFetch(url);
    return response as RankingResponse;
    } catch (error) {
    console.error('그룹 상위 3명 랭킹 조회 실패:', error);
    throw error;
  }
};

// 그룹별 전체 랭킹 조회
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

    return response.data[0];
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