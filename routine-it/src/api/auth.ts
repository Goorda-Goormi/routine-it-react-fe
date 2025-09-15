import { apiFetch } from './client';
import type { UserProfile } from '../interfaces'; 

/**
 * 닉네임의 중복 여부를 확인합니다.
 * @param nickname - 확인할 닉네임
 * @returns 사용 가능하면 true, 아니면 false를 반환
 */
export const checkNicknameAvailability = async (nickname: string): Promise<boolean> => {
  try {
    // apiFetch가 바로 { data: boolean } 형태의 객체를 반환합니다.
    const result = await apiFetch('/api/auth/check-nickname', {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    });
    return result.data; // 바로 데이터에 접근
  } catch (error) {
    console.error("닉네임 중복 확인 에러:", error);
    throw error; // apiFetch가 던진 에러를 그대로 전달
  }
};

/**
 * 사용자의 닉네임을 설정하여 회원가입을 완료합니다.
 * @param nickname - 설정할 사용자의 닉네임
 * @returns 업데이트된 사용자 정보 객체 (UserProfile)
 */
export const completeSignup = async (nickname: string): Promise<UserProfile> => {
  try {
    const result = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    });

    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || '회원가입 데이터를 받아오지 못했습니다.');
    }
  } catch (error) {
    console.error("회원가입 완료 에러:", error);
    throw error;
  }
};

/**
 * 사용자를 로그아웃 처리합니다.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    // 성공 시 로컬 스토리지 정리
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (error) {
    console.error("로그아웃 에러:", error);
    throw error;
  }
};

/**
 * 회원 탈퇴를 처리합니다.
 */
export const deleteAccount = async (): Promise<void> => {
  try {
    await apiFetch('/api/users/signout', { method: 'DELETE' });
    // 성공 시 로컬 스토리지 전체 삭제
    localStorage.clear();
  } catch (error) {
    console.error("회원 탈퇴 에러:", error);
    throw error;
  }
};

