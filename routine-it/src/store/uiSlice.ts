import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// 1. 상태 타입 정의
interface UiState {
  isLoginModalOpen: boolean;
  isAttendanceModalOpen: boolean;
  isStreakModalOpen: boolean;
  isBadgeModalOpen: boolean;
  isReviewModalOpen: boolean;
  badgeName: string | null; 
  badgeImage: string | null; 
}

// 2. 초기 상태 정의
const initialState: UiState = {
  isLoginModalOpen: false,
  isAttendanceModalOpen: false,
  isStreakModalOpen: false,
  isBadgeModalOpen: false,
  isReviewModalOpen: false,
  badgeName: null,
  badgeImage: null,
};

// 3. Slice 생성
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openLoginModal: (state) => { state.isLoginModalOpen = true; },
    closeLoginModal: (state) => { state.isLoginModalOpen = false; },

    openAttendanceModal: (state) => { state.isAttendanceModalOpen = true; },
    closeAttendanceModal: (state) => { state.isAttendanceModalOpen = false; },

    openStreakModal: (state) => { state.isStreakModalOpen = true; },
    closeStreakModal: (state) => { state.isStreakModalOpen = false; },

    openBadgeModal: (state, action: PayloadAction<{ name: string; image: string }>) => {
      state.isBadgeModalOpen = true;
      state.badgeName = action.payload.name;
      state.badgeImage = action.payload.image;
    },
    closeBadgeModal: (state) => {
      state.isBadgeModalOpen = false;
      state.badgeName = null;
      state.badgeImage = null;
    },
    
    openReviewModal: (state) => { state.isReviewModalOpen = true; },
    closeReviewModal: (state) => { state.isReviewModalOpen = false; },
  },
});

// 4. 액션 및 리듀서 내보내기
export const {
  openLoginModal,
  closeLoginModal,
  openAttendanceModal,
  closeAttendanceModal,
  openStreakModal,
  closeStreakModal,
  openBadgeModal,
  closeBadgeModal,
  openReviewModal,
  closeReviewModal,
} = uiSlice.actions;

export default uiSlice.reducer;