// import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
// import type { Group } from '../interfaces';
// //import type { Routine } from '../interfaces';

// export interface Routine { 
//   routineId: number; 
//   routineName: string;
//   isCompleted: boolean; // 홈 화면에서 토글에 사용될 것으로 예상
//   // ... 기타 루틴 관련 필드
// }
// interface RoutineState {
//   personalRoutines: Routine[]; // 개인 루틴 목록
//   groups: Group[];             // 소속된 그룹 목록
//   isLoading: boolean;
//   error: string | null;
// }

// const initialState: RoutineState = {
//   personalRoutines: [],
//   groups: [],
//   isLoading: false,
//   error: null,
// };

// const routineSlice = createSlice({
//   name: 'routine',
//   initialState,
//   reducers: {
//     // 개인 루틴 목록을 설정하는 액션
//     setPersonalRoutines: (state, action: PayloadAction<Routine[]>) => {
//       state.personalRoutines = action.payload;
//       state.isLoading = false;
//     },
//     // 그룹 목록을 설정하는 액션
//     setGroups: (state, action: PayloadAction<Group[]>) => {
//       state.groups = action.payload;
//       state.isLoading = false;
//     },
//     // 루틴 체크/체크 해제 상태를 토글하는 액션 (로컬 상태 업데이트)
//     toggleRoutineCompletion: (state, action: PayloadAction<number>) => {
//       const routine = state.personalRoutines.find(r => r.id === action.payload);
//       if (routine) {
//         routine.isCompleted = !routine.isCompleted;
//       }
//     },
//     // 로딩 상태 설정
//     setRoutineLoading: (state, action: PayloadAction<boolean>) => {
//       state.isLoading = action.payload;
//       state.error = null;
//     },
//     // 에러 상태 설정
//     setRoutineError: (state, action: PayloadAction<string>) => {
//       state.isLoading = false;
//       state.error = action.payload;
//     },
//   },
// });

// export const { 
//   setPersonalRoutines, 
//   setGroups, 
//   toggleRoutineCompletion,
//   setRoutineLoading,
//   setRoutineError
// } = routineSlice.actions;

// export default routineSlice.reducer;