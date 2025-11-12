import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// 1. 상태 타입 정의
interface AuthState {
  isLoggedIn: boolean;
  nickname: string | null;
  userId: string | null;
}

// 2. 초기 상태 정의
const initialState: AuthState = {
  isLoggedIn: false,
  nickname: null,
  userId: null,
};

// 3. Slice 생성 
const authSlice = createSlice({
  name: 'auth', 
  initialState,
  reducers: {
    // 액션: 로그인 성공 시 상태를 업데이트합니다.
    login: (state, action: PayloadAction<{ nickname: string; userId: string }>) => {
      state.isLoggedIn = true;
      state.nickname = action.payload.nickname;
      state.userId = action.payload.userId;
    },
    // 액션: 로그아웃 시 상태를 초기화합니다.
    logout: (state) => {
      state.isLoggedIn = false;
      state.nickname = null;
      state.userId = null;
    },
    // 액션: 닉네임만 변경 시 사용합니다.
    setNickname: (state, action: PayloadAction<string>) => {
      state.nickname = action.payload;
    },
  },
});

// 4. 액션 생성자(Action Creators) 내보내기
export const { login, logout, setNickname } = authSlice.actions;

// 5. 리듀서 내보내기 (Store에 연결할 함수)
export default authSlice.reducer;