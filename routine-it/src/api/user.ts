import { apiFetch } from './client';
import type { UpdateProfilePayload } from '../interfaces';

//프로필 수정
/**
 * 사용자의 프로필 정보(닉네임, 자기소개, 프로필 이미지)를 업데이트합니다.
 * @param profileData - 업데이트할 프로필 데이터
 * @returns 업데이트된 전체 사용자 정보 객체 (API 명세상으로는 data에 UserProfile 객체가 반환되나, 현재 코드에서는 반환값을 사용하지 않으므로 Promise<void>로 처리해도 무방합니다.)
 */
export const updateUserProfile = async (profileData: UpdateProfilePayload): Promise<void> => {
  const response = await apiFetch('/api/users/me/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '프로필 업데이트에 실패했습니다.' }));
    throw new Error(errorData.message || '프로필 업데이트 중 오류가 발생했습니다.');
  }

  const result = await response.json();
  return result.data;
};

//타 유저 프로필 조회
export interface PublicUserProfile {
  id: number;
  nickname: string;
  profileMessage: string;
  profileImageUrl: string;
  isAlarmOn: boolean;
  isDarkMode: boolean;
}

/**
 * 특정 사용자의 공개 프로필 정보를 조회합니다.
 * @param userId - 조회할 사용자의 ID
 * @returns 사용자의 공개 프로필 정보
 */
export const getUserProfile = async (userId: number): Promise<PublicUserProfile> => {
  // GET 요청은 body가 필요 없습니다.
  const response = await apiFetch(`/api/users/${userId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '사용자 정보 조회에 실패했습니다.' }));
    throw new Error(errorData.message || '사용자 정보를 불러오는 중 오류가 발생했습니다.');
  }

  const result = await response.json();
  return result.data;
};
