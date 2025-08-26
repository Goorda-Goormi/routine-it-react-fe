📁 프로젝트 구조
---
```
src/
├── assets/          // 이미지, 아이콘, 폰트 등 정적 자원을 저장
│
├── components/      // 여러 페이지에서 재사용되는 UI 컴포넌트들을 모아 둔 곳
│   ├── modules/     // 특정 '기능'을 담당하며 재사용되는 컴포넌트 (ex: 모달, 팝업)
│   │   └── CreateRoutineScreen.tsx  // 루틴 생성 기능. 여러 페이지에서 모달처럼 사용
│   │
│   ├── ui/          // 버튼, 입력창 등 UI 컴포넌트
│   │
│   ├── utils/       // 로직만 담겨있는 순수 함수
│   │   └── AttendanceStreak.tsx // 출석 정보 계산 로직
│   │   └── rankingUtils.tsx // 랭킹 점수 계산 로직
│   │
│   ├── BottomNavBBar.tsx  
│   ├── HelpScreen.tsx
│   ├── SettingsScreen.tsx
│   └── TopNavBBar.tsx    
│
├── pages/           // 라우팅과 직접 연결되는 화면(페이지) 단위 컴포넌트
│   ├── Group/       // 그룹 관련 기능의 모든 페이지와 컴포넌트
│   │   ├── GroupChat/
│   │   ├── GroupDetail/
│   │   ├── CreateGroupScreen.tsx
│   │   └── GroupScreen.tsx
│   │
│   ├── Home/        // 홈 화면 관련 페이지와 컴포넌트
│   │   ├── HomeScreen.tsx
│   │   └── UserHomeScreen.tsx
│   │
│   ├── Login/       // 로그인 관련 페이지와 컴포넌트
│   │   └── LoginScreen.tsx
│   │
│   ├── MyPage/      // 마이 페이지 관련 페이지와 컴포넌트
│   │   ├── MyPageScreen.tsx
│   │   └── ProfileEditScreen.tsx
│   │
│   ├── Ranking/     // 랭킹 관련 페이지와 컴포넌트
│   │   └── RankingScreen.tsx
│   │
│   └── Routine/     // 루틴 관련 페이지와 컴포넌트
│       ├── RoutineDetailScreen.tsx
│       └── RoutineScreen.tsx
│
├── styles/          // 전역 스타일(CSS) 파일
│   ├── globals.css
│   └── index.css
│
├── App.tsx          // 메인 라우팅을 정의하는 최상위 컴포넌트
└── index.tsx        // 앱의 시작점
```
