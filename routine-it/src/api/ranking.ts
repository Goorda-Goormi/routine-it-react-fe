import { apiFetch } from './client';
import type { PersonalRankingData, GlobalGroupRankingData } from '../interfaces';

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

// 개인별 랭킹 조회
// GET /api/rankings/personal
export async function getPersonalRanking(
  userId: number,
  monthYear?: string,
  page: number = 0,
  size: number = 10
): Promise<PersonalRankingData[]> {
  try {
    const params = new URLSearchParams({
      userId: userId.toString(),
      page: page.toString(),
      size: size.toString(),
    });
    if (monthYear) {
      params.append("monthYear", monthYear);
    }

    const response = await apiFetch(`/rankings/personal?${params.toString()}`, {
      method: "GET",
    });
    return response.data;
  } catch (error) {
    console.error("개인별 랭킹 조회 실패:", error);
    throw error;
  }
}

// 사용자 총 점수 조회
// GET /api/rankings/me/total-score
export async function getUserTotalScore(userId: number) {
  try {
    const params = new URLSearchParams({
      userId: userId.toString(),
    });
    const response = await apiFetch(`/rankings/me/total-score?${params.toString()}`, {
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
    
    const url = `/rankings/groups/${groupId}/top3?${params.toString()}`;
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

    const response = await apiFetch(`/rankings/groups/global?${params.toString()}`, {
      method: "GET",
    });
    // API 응답 구조를 기반으로 데이터 반환
    return response.data[0]; // 배열의 첫 번째 요소를 반환
  } catch (error) {
    console.error("그룹별 전체 랭킹 조회 실패:", error);
    throw error;
  }
}