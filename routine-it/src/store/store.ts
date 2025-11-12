import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; 
import uiReducer from './uiSlice';

// 1. Store 생성
export const store = configureStore({
  reducer: {
    auth: authReducer, 
    ui: uiReducer, 
  },
});

// 2. RootState 및 AppDispatch 타입 정의
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;