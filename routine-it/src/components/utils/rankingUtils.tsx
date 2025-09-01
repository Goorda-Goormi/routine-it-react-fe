// 랭킹 점수 계산 로직
// src/components/utils/rankingUtils.tsx

export interface RankingMember {
  id: number;
  name: string;
  profileImageUrl?: string;
  streakDays: number; // 연속일
  approvals: number; // 리더가 인증 승인해준 횟수
}

export interface RankingGroup {
  id: number;
  name: string;
  type: '자유참여' | '의무참여';
  members: number;
  category: string;
  membersData: RankingMember[];
}

/**
 * 개별 멤버 점수 계산
 * - 기본점수: 승인 횟수 * 10 * 가중치
 * - 연속일 가산점수: min(30, streakDays) * 0.5
 */
export function calculateMemberScore(
  approvals: number,
  streakDays: number,
  groupType: '자유참여' | '의무참여'
): number {
  const weight = groupType === '의무참여' ? 1.5 : 1.2;
  const baseScore = approvals * 10 * weight;
  const streakBonus = Math.min(30, streakDays) * 0.5;
  return baseScore + streakBonus;
}

/**
 * 그룹 전체 점수 계산
 * - 그룹 내 모든 멤버 점수 합산
 */
export function calculateGroupScore(group: RankingGroup) {
  const memberScores = group.membersData.map((m) =>
    calculateMemberScore(m.approvals, m.streakDays, group.type)
  );

  const totalScore = memberScores.reduce((a, b) => a + b, 0);
  const avgScore = memberScores.length > 0 ? totalScore / memberScores.length : 0;

  return {
    ...group,
    totalScore,
    avgScore,
  };
}

/**
 * 그룹 랭킹 정렬 및 순위 부여
 */
export function rankGroups(groups: RankingGroup[]) {
  return groups
    .map((group) => calculateGroupScore(group))
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((group, idx) => ({ ...group, rank: idx + 1 }));
}
