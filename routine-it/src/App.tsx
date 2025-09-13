import React, { useState, useEffect } from "react";
import { TopNavBar } from "./components/TopNavBar";
import { BottomTabNav } from "./components/BottomTabNav";
import { LoginScreen } from "./pages/Login/LoginScreen";
import { HomeScreen } from "./pages/Home/HomeScreen";
import { RoutineScreen } from "./pages/Routine/RoutineScreen";
import { GroupScreen } from "./pages/Group/GroupScreen"
import { RankingScreen } from "./pages/Ranking/RankingScreen";
import { MyPageScreen } from "./pages/MyPage/MyPageScreen";
import { RoutineDetailScreen } from "./pages/Routine/RoutineDetailScreen";
import { GroupDetailScreen } from "./pages/Group/GroupDetail/GroupDetailScreen";
import { ProfileEditScreen } from "./pages/MyPage/ProfileEditScreen";
import { GroupChatScreen } from "./pages/Group/GroupChat/GroupChatScreen";
import { CreateRoutineScreen } from "./components/modules/CreateRoutineScreen";
import { CreateGroupScreen } from "./pages/Group/CreateGroupScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { HelpScreen } from "./components/HelpScreen";
import { UserHomeScreen } from "./pages/Home/UserHomeScreen";
import type { RecommendedRoutine } from "./pages/Routine/RoutineScreen";
import { AttendanceModal } from './components/modules/AttendanceModal';
import { StreakModal } from './components/modules/StreakModal';
import { getStreakInfo } from './components/utils/streakUtils';
import { AchievementBadgeModal } from './components/modules/AchievementBadgeModal';
import type { Notification, AuthMessage,Routine,Group,Member, PendingAuthMap,UserProfile,GroupMemberResponse } from "./interfaces";
import { LoginModal } from './components/modules/LoginModal';
import { LoadingSpinner } from "./components/ui/loading-spinner";
import { MonthlyReviewModal } from './components/modules/MonthlyReviewModal';
import { startKakaoLogin, getUserInfo } from "./api/login"; 
import { completeSignup, logoutUser, deleteAccount } from './api/auth';
import { 
  createPersonalActivity,
  getUserActivitiesByDay,
  updateActivity,
  getTotalAttendanceDays,
  checkAttendance
} from './api/activity';
import { 
  createPersonalRoutine,
  getPersonalRoutinesByUser,
  updatePersonalRoutine,
  deletePersonalRoutine,
  toggleRoutinePublic, 
  toggleRoutineAlarm 
} from './api/personalRoutine';
import { apiFetch } from "./api/client";
import type { PersonalRoutineResponse, PersonalRoutineCreatePayload, PersonalRoutineUpdatePayload } from './api/personalRoutine';
import { createGroup, getAllGroups,getJoinedGroups,getGroupMembers, requestJoinGroup } from "./api/group";
import { updateRankingScore, getPersonalRankings, getUserTotalScore, getGlobalGroupRanking } from "./api/ranking";
import { getMonthlyReview } from './api/review';
import type { IPersonalRankingResponse, UserTotalScoreResponse } from './interfaces';
import type { GlobalGroupRankingData } from "./pages/Ranking/RankingScreen";import { toggleDarkMode as toggleDarkModeAPI, toggleAlarm as toggleAlarmAPI } from './api/setting';
import { getNotifications, markNotificationAsRead } from "./api/notification";
import type { NotificationApiResponse, NotificationType } from "./interfaces";
import { User, Bell, Camera, Clock } from 'lucide-react'
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface NavigationState {
  screen: string;
  params?: any;
}

const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const transformPersonalRoutine = (pr: PersonalRoutineResponse): Routine => {
  return {
    id: pr.routineId,
    name: pr.routineName,
    description: pr.description,
    time: pr.startTime ? pr.startTime.slice(0, 5) : '',
    frequency: convertAuthDaysToFrequency(pr.repeatDays), 
    isPublic: pr.isPublic,
    reminder: pr.isAlarmOn,
    
    isGroupRoutine: false,
    completed: false, 
    streak: 0, 
    difficulty: '쉬움',
    goal: '30', 
    category: '생활',
  };
};

type RoutineOverride = Partial<Pick<Routine, 'time' | 'frequency' | 'reminder' | 'goal'>>;

/**
 * { hour: 8, minute: 0 } 형태의 alarmTime 객체를 '08:00' 형태의 문자열로 변환합니다.
 */
const convertAlarmTimeToTimeString = (alarmTime: { hour?: number; minute?: number }): string => {
  if (!alarmTime || typeof alarmTime.hour !== 'number' || typeof alarmTime.minute !== 'number') {
    // [수정] '시간 미정' 대신 기본 시간을 반환합니다.
    return '09:00';
  }
  const hour = String(alarmTime.hour).padStart(2, '0');
  const minute = String(alarmTime.minute).padStart(2, '0');
  return `${hour}:${minute}`;
};

  // 날짜 포맷 옵션 (연, 월, 일, 시, 분)
const dateOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
};

/**
 * '1111100' 형태의 authDays 문자열을 ['월', '화', '수', '목', '금'] 형태의 배열로 변환합니다.
 */
const convertFrequencyToAuthDays = (frequency: string[]): string => {
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  return daysOfWeek.map(day => frequency.includes(day) ? '1' : '0').join('');
};

const convertAuthDaysToFrequency = (authDays: string): string[] => {
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  if (!authDays || authDays.length !== 7) {
    return [];
  }
  return authDays.split('').map((char, index) => (char === '1' ? daysOfWeek[index] : null)).filter(Boolean) as string[];
};

const transformGroupToRoutine = (group: Group): Routine => {
  
  return {
    // 1. Group 객체에서 직접 매핑되는 필드
    id: group.groupId,
    name: group.groupName,
    description: group.description,
    category: group.category,
    isGroupRoutine: true, // 이 루틴이 그룹에서 왔음을 명시

    // 2. 헬퍼 함수 및 타입 변환
    time: convertAlarmTimeToTimeString(group.alarmTime),
    frequency: convertAuthDaysToFrequency(group.authDays),
    type: group.groupType === 'REQUIRED' ? '의무참여' : '자율참여',

    // 3. Routine 객체에 필요하지만 Group 객체에 없는 필드 (기본값 설정)
    difficulty: '보통',
    completed: false, 
    streak: 0,
    goal: '30',
    reminder: true,
    isPublic: true,
  };
  
};

// --- Helper Functions ---
/**
 * API 응답 데이터를 프론트엔드 Notification 타입으로 변환합니다.
 */
const transformNotification = (apiNotif: NotificationApiResponse): Notification => {
  let category: Notification['category'] = '홈';
  let icon: React.ReactNode = <Bell className="h-4 w-4 icon-secondary" />;

  // API의 notificationType에 따라 카테고리와 아이콘을 매핑
  switch (apiNotif.notificationType) {
    case 'GROUP_JOIN_REQUEST':
    case 'GROUP_MEMBER_STATUS_UPDATED':
    case 'GROUP_MEMBER_ROLE_UPDATED':
      category = '그룹';
      icon = <User className="h-4 w-4 text-muted-foreground" />;
      break;
    case 'GROUP_TODAY_AUTH_REQUEST':
      category = '그룹';
      icon = <Camera className="h-4 w-4 text-muted-foreground" />;
      break;
    case 'GROUP_TODAY_AUTH_COMPLETED':
    case 'GROUP_TODAY_AUTH_REJECTED':
      category = '그룹';
      break;
    case 'MONTHLY_REVIEW':
      category = '회고';
      break;
    default:
      category = '홈';
  }

  const dateString = apiNotif.createdAt 
    ? new Date(apiNotif.createdAt+ 'Z').toLocaleString('ko-KR', dateOptions)
    : '시간 정보 없음';

  return {
    id: apiNotif.id,
    message: apiNotif.content,
    category: category,
    date: dateString, 
    read: apiNotif.read,
    icon: icon,
    isLocal: false,
  };
};

/**
 * 루틴 난이도에 따라 점수를 계산합니다.
 */
const calculateScoreByDifficulty = (difficulty?: string): number => {
  switch (difficulty) {
    case '쉬움':
      return 10;
    case '보통':
      return 20;
    case '어려움':
      return 30;
    default:
      return 10; // 난이도가 없으면 기본 점수
  }
};


type BadgeType = '첫걸음' | '7일 연속' | '루틴 마스터' | '월간 챔피언';
//type PendingAuthMap = { [groupId: number]: AuthMessage[] };
export default function App() {
  
  //1. 상태관리 변수===================================================
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState("home");
  //const [pendingAuthMessages, setPendingAuthMessages] = useState<PendingAuthMap>({});
  const [navigationStack, setNavigationStack] = useState<NavigationState[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [completedActivityIds, setCompletedActivityIds] = useState({
    personal: new Map<number, number>(),
    group: new Map<number, number>(),
  });
  const [isAttendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [isStreakModalOpen, setStreakModalOpen] = useState(false);
  const [isBadgeModalOpen, setBadgeModalOpen] = useState(false);
  const [badgeName, setBadgeName] = useState('');
  const [badgeImage, setBadgeImage] = useState('');
  const [pendingBadges, setPendingBadges] = useState<{ name: string; image: string; }[]>([]);
  const [lastCompletionDate, setLastCompletionDate] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastCompletionDate');
    }
    return null;
  });

  const [groupRoutineOverrides, setGroupRoutineOverrides] = useState<Record<number, RoutineOverride>>({});

  const [routineCompletionCount, setRoutineCompletionCount] = useState<number>(() => {
    return Number(localStorage.getItem('routineCompletionCount')) || 0;
  });
  const [attendanceCount, setAttendanceCount] = useState(() => {
    const savedCount = localStorage.getItem('attendanceCount');
    return savedCount ? Number(savedCount) : 0;
  });
  const [attendanceDates, setAttendanceDates] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const savedDates = localStorage.getItem('attendanceDates');
      return savedDates ? JSON.parse(savedDates) : [];
    }
    return [];
  });
  const [earnedBadges, setEarnedBadges] = useState<BadgeType[]>(() => {
    if (typeof window !== 'undefined') {
      const storedBadges = localStorage.getItem('earnedBadges');
      return storedBadges ? JSON.parse(storedBadges) : [];
    }
    return [];
  });
  
  const [streakDays, setStreakDays] = useState(0);
  const [UserInfo, setUserInfo] = useState<UserProfile | null>(null); // 초기 상태를 null로 변경
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [personalRoutines, setPersonalRoutines] = useState<Routine[]>([])

 const [groups, setGroups] = useState<Group[]>([]);
 const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

  //const [groupRoutines, setGroupRoutines] = useState<Routine[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [remindersSentToday, setRemindersSentToday] = useState<Record<number, boolean>>({});

  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewModalContent, setReviewModalContent] = useState({ content: '', monthYear: '' });
  const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      date: new Date().toLocaleString('ko-KR', dateOptions),
      read: false,
      isLocal: true,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  useEffect(() => {
    const savedOverrides = localStorage.getItem('groupRoutineOverrides');
    if (savedOverrides) {
      setGroupRoutineOverrides(JSON.parse(savedOverrides));
    }
  }, []);

  useEffect(() => {
    const dummyNotifications: Notification[] = [
      { id: 1, message: '출석체크로 20점을 획득했습니다!', category: '홈', date: '1분 전', read: false },
      { id: 2, message: '김민지님이 그룹 루틴 인증을 요청했습니다.', category: '그룹', date: '10분 전', read: false },
      { id: 3, message: '루틴 회고 알림이 도착했어요.', category: '회고', date: '어제', read: true },
    ];
    setNotifications(dummyNotifications);
  }, []);
  
  const [recommendedRoutines, setRecommendedRoutines] = useState([
    {
      id: 7,
      name: '스트레칭',
      description: '매일 10분 스트레칭으로 몸의 긴장을 풀어보세요',
      time: '08:00',
      frequency: ['월', '화', '수', '목', '금', '토', '일'],
      reminder: true,
      goal: '30',
      category: 'exercise',
      completed: false,
      streak: 0,
      difficulty: '쉬움',
      isGroupRoutine: false,
      isPublic: true
    },
    {
      id: 8,
      name: '감사 일기',
      description: '하루에 감사한 일 3가지를 적어보세요',
      time: '08:00',
      frequency: ['월', '화', '수', '목', '금', '토', '일'],
      reminder: true,
      goal: '30',
      category: '',
      completed: false,
      streak: 0,
      difficulty: '쉬움',
      isGroupRoutine: false,
      isPublic: true
    },
    {
      id: 9,
      name: '물 마시기',
      description: '하루 2L 물 마시기로 건강한 습관을 만들어보세요',
      time: '08:00',
      frequency: ['월', '화', '수', '목', '금', '토', '일'],
      reminder: true,
      goal: '30',
      category: 'health',
      completed: false,
      streak: 0,
      difficulty: '보통',
      isGroupRoutine: false,
      isPublic: true
    },
    {
      id: 10,
      name: '단어 암기',
      description: '매일 새로운 영어 단어 10개를 학습하세요',
      time: '08:00',
      frequency: ['월', '화', '수', '목', '금', '토', '일'],
      reminder: true,
      goal: '30',
      category: 'study',
      completed: false,
      streak: 0,
      difficulty: '보통',
      isGroupRoutine: false,
      isPublic: true
    },
    {
      id: 11,
      name: '5분 청소하기',
      description: '하루 5분만 투자해 내 주변자리를 정돈해보세요',
      time: '08:00',
      frequency: ['월', '화', '수', '목', '금', '토', '일'],
      reminder: true,
      goal: '30',
      category: 'lifestyle',
      completed: false,
      streak: 0,
      difficulty: '쉬움',
      isGroupRoutine: false,
      isPublic: true
    },
    {
      id: 12,
      name: '오늘의 사진 한 장',
      description: '일상 속 특별한 순간을 포착하고 기록해보세요',
      time: '08:00',
      frequency: ['월', '화', '수', '목', '금', '토', '일'],
      reminder: true,
      goal: '30',
      category: 'hobby',
      completed: false,
      streak: 0,
      difficulty: '쉬움',
      isGroupRoutine: false,
      isPublic: true
    }
  ]);

  const fetchTotalAttendance = async () => {
    //if (!isLoggedIn) return;
    try {
      // targetUserId 없이 호출하여 '내' 누적 출석일을 가져옵니다.
      const totalDays = await getTotalAttendanceDays();
      console.log('✅ [App.tsx] fetchTotalAttendance API 응답:', totalDays);
      setStreakDays(totalDays);
    } catch (error) {
      console.error("누적 출석일 조회 실패:", error);
    }
  };

   const [groupMembers, setGroupMembers] = useState<Record<number, GroupMemberResponse[]>>({});
  
    const currentScreen =
    navigationStack.length > 0
      ? navigationStack[navigationStack.length - 1]
      : null;

        const groupId = currentScreen && currentScreen.params ? currentScreen.params.groupId : undefined;
        const members = groupId !== undefined ? (groupMembers[groupId] || []) : [];
        const myId = UserInfo?.id; 
        const isJoined = groupId !== undefined ? myGroups.some(joinedGroup => joinedGroup.groupId === groupId) : false; 

        //2. 유틸리티 함수 ============================================
  const badgeInfo = {
    '첫걸음': {
      image: 'https://i.ibb.co/6P0D6kX/first-step-badge.png',
      message: '첫 번째 루틴 완료를 축하합니다!'
    },
    '7일 연속': {
      image: 'https://i.ibb.co/wJv0P2H/7-day-streak-badge.png',
      message: '7일 연속 출석! 당신의 꾸준함을 응원합니다!'
    },
    '루틴 마스터': {
      image: 'https://i.ibb.co/hK8xN2Y/routine-master-badge.png',
      message: '총 100개 루틴을 완료했습니다! 당신은 진정한 루틴 마스터!'
    },
    '월간 챔피언': {
      image: 'https://i.ibb.co/5c9dK9y/monthly-champion-badge.png',
      message: '이번 달 30번 출석! 루틴잇 월간 챔피언입니다!'
    }
  };

  //3.api통신 및 데이터 로딩 =============================================================

  const fetchUserInfo = async () => {
    setIsLoading(true);
    console.log('A. fetchUserInfo 함수 시작.');
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error("인증 토큰이 없습니다.");
      setIsLoading(false); // 로딩 상태 해제
      return;
    }
      
    try {
      console.log('B. getUserInfo API 호출 직전...');
      const userInfoData = await getUserInfo();
      console.log('C. getUserInfo API 호출 성공! 받은 데이터:', userInfoData);
      setUserInfo(prevUserInfo => ({
        ...prevUserInfo,
        ...userInfoData,
      }));
      console.log('D. setUserInfo 호출 완료.'); // <-- 로그 D
    } catch (error) {
      // ▼▼▼ 이 로그를 추가해서 에러를 확인하세요! ▼▼▼
      console.log('E. fetchUserInfo의 catch 블록 실행됨!', error);
      
      console.error("사용자 정보 조회 에러:", error);
      localStorage.removeItem('accessToken');
      setIsLoggedIn(false);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  
  const fetchGroupData = async () => {
    setIsLoadingGroups(true);
    setError(null);
    try {
      const allGroups = await getAllGroups();
      const joinedGroupsFromServer: any[] = await getJoinedGroups();

      const transformedJoinedGroups: Group[] = joinedGroupsFromServer.map((group: any) => {
        // group.recentMembers 배열을 순회하며 각 멤버(apiMember)를 UI용 Member 타입으로 변환합니다.
        const transformedMembers: Member[] = (group.recentMembers || []).map(
          (apiMember: GroupMemberResponse) => ({
            id: apiMember.userId, // 👈 'userId'를 'id'로 변환하는 가장 중요한 부분입니다.
            nickname: apiMember.nickname,
            profileImageUrl: apiMember.profileImageUrl,
          })
        );
        // 변환된 멤버 배열(transformedMembers)을 기존 그룹 객체에 다시 할당합니다.
        return { ...group, recentMembers: transformedMembers };
      });

      // 중복 제거는 변환이 완료된 데이터를 기준으로 수행합니다.
      const uniqueJoinedGroups = Array.from(
        new Map(transformedJoinedGroups.map((group) => [group.groupId, group])).values()
      );
      
      setMyGroups(uniqueJoinedGroups);
      setGroups(allGroups);

    } catch (err) {
      console.error("Failed to fetch groups:", err);
      setError("그룹 데이터를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoadingGroups(false);
    }
  };


 

  //4.useEffect  =============================================================

  //웹 페이지 로드 시 로그인 상태 확인
  useEffect(() => {
  const checkAuthAndFetchUser = async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('accessToken');
    const isNew = params.get('isNewUser') === 'true';
    if (token) {
      localStorage.setItem('accessToken', token);
      window.history.replaceState({}, document.title, window.location.pathname);
    setIsLoggedIn(true);

    if (isNew) {
        setIsNewUser(true);
        setIsLoginModalOpen(true);
      } else {
        await fetchUserInfo();
      }
    } else if (localStorage.getItem('accessToken')) {
      setIsLoggedIn(true);
      await fetchUserInfo();
    }
  };

  checkAuthAndFetchUser();
}, []);


useEffect(() => {
  if (isLoggedIn && UserInfo) {
    const fetchRemainingData = async () => {
      await Promise.all([
        fetchUserActivities(),
        fetchPersonalRoutines(),
        fetchUserTotalScore(),
        fetchTotalAttendance(),
        fetchGroupData(),
        fetchNotifications()
      ]);
    };
    fetchRemainingData();
  }
}, [UserInfo]);

  // UserInfo(서버) 상태와 isDarkMode(UI) 상태를 동기화
  useEffect(() => {
    if (UserInfo) {
      setIsDarkMode(UserInfo.isDarkMode ?? false);
    }
  }, [UserInfo]);

  //다크 모드 상태 관리
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);


const fetchMembers = async (groupId: number) => {
    try {
        const members = await getGroupMembers(groupId);
        setGroupMembers(prevMembers => ({
            ...prevMembers,
            [groupId]: members,
        }));
    } catch (error) {
        console.error("그룹 멤버 조회 실패:", error);
    }
};

// 그룹 멤버 목록을 새로고침하는 함수
const handleGroupMembersRefresh = () => {
  if (currentScreen && currentScreen.screen === "group-detail" && currentScreen.params.groupId) {
    const groupId = currentScreen.params.groupId;
    fetchMembers(groupId);
  }
};


// 아래 useEffect 수정
useEffect(() => {
  if (currentScreen && currentScreen.screen === "group-detail" && currentScreen.params.groupId) {
    const groupId = currentScreen.params.groupId;
    fetchMembers(groupId);
  }
}, [navigationStack, myGroups]);
  

  //5. 사용자/계정 관리 =============================================================

  const handleKakaoLogin = () => {
    startKakaoLogin();
  };


  const handleLogin = (isNew: boolean) => {
    setIsNewUser(isNew);
    if (isNew) {
      setIsLoginModalOpen(true); 
      
    } else {
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
    }
  };
  
  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('accessToken', token);
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
  };

  // 닉네임 설정 완료 후 호출될 함수
  const handleNicknameSetupComplete = async (nickname: string) => {
    try { 
      const updatedUserInfo = await completeSignup(nickname);

      setUserInfo(updatedUserInfo);
      setIsLoggedIn(true);
      setIsNewUser(false);
      setIsLoginModalOpen(false);
      alert('회원가입이 완료되었습니다.');

    } catch (error) {
    console.error("회원가입 에러:", error);
    alert((error as Error).message);
  }
};

// const fetchInitialDataAfterLogin = async () => {
//     // 1. API 호출 시작을 콘솔에 기록합니다.
//     console.log('➡️ getSettings API 호출을 시도합니다.');
    
//     setIsLoading(true);
//     try {
//       const settingsData = await getSettings();
      
//       // 2. API 호출 성공 시 반환된 데이터를 콘솔에 기록합니다.
//       console.log('✅ getSettings API 호출 성공!');
//       console.log('받은 데이터:', settingsData);
      
//       // TODO: 필요한 다른 API 호출 추가
//     } catch (error) {
//       // 3. API 호출 실패 시 에러 상세 정보를 콘솔에 기록합니다.
//       console.error('❌ getSettings API 호출 실패!');
//       console.error('에러 상세:', error);
//       // apiFetch에서 토큰 갱신 실패 시 리디렉션 처리하므로 추가 로직이 필요 없을 수 있음.
//     } finally {
//       setIsLoading(false);
//       // API 호출이 완료되었음을 알려줍니다. (성공/실패 무관)
//       console.log('➡️ getSettings API 호출이 완료되었습니다.');
//     }
//   };

  // 수정: LoginModal의 onComplete 핸들러
  const handleLoginComplete = async (nickname: string) => {
    await handleNicknameSetupComplete(nickname);
  };

  const handleLogout = async() => {
    try {
        console.log('🚪 Logging out...');
        
        // 서버에 로그아웃을 요청하여 서버 세션 및 쿠키를 무효화합니다.
        await fetch(`${BASE_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include', // 쿠키(refreshToken)를 함께 보내기 위해 필수
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        });
        
        console.log('✅ Logout request sent to server');
        
    } catch (error) {
        console.error('⚠️ Logout request failed:', error);
    } finally {
        // 요청 성공 여부와 관계없이 로컬 데이터를 모두 정리합니다.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken'); // 혹시 남아있을 경우를 대비
        
        console.log('✅ Local tokens cleared');
        
        // 상태를 초기화하고 로그인 페이지로 이동합니다.
        setIsLoggedIn(false);
        setUserInfo(null);
        window.location.href = '/login';
    }
  };


  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm("계정 탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다. 정말로 탈퇴하시겠습니까?");
    if (isConfirmed) {
      try {
        await deleteAccount();

        setIsLoggedIn(false);
        setActiveTab("home");
        setNavigationStack([]);
        setUserInfo({
          id: 0,
          nickname: '',
          email: '',
          profileImageUrl: '',
          profileMessage: '',
          isAlarmOn: true,
          isDarkMode: false,
          joinDate: '',
          level: 0,
          exp: 0,
          maxExp: 3000,
          maxStreakDays: 0,
          streakDays: 0
        });
        setPersonalRoutines([]);
        setGroups([]);
        //setPendingAuthMessages({});
        setLastCompletionDate(null);
        setRoutineCompletionCount(0);
        setAttendanceCount(0);
        setEarnedBadges([]);
        setStreakDays(0);
        setAttendanceDates([]);

        localStorage.clear();
        
        alert("계정이 성공적으로 탈퇴되었습니다.");
      } catch (error) {
        console.error("회원 탈퇴 에러:", error);
        alert((error as Error).message);
      }
    }
  };

   const handleSaveProfile = async () => {
    await fetchUserInfo();
  };


  //6.루틴 관리 =============================================================
  
  const fetchUserActivities = async () => {
    if (!isLoggedIn) return;
    const today = new Date().toISOString().split('T')[0];
    try {
      const activities = await getUserActivitiesByDay(today);
      const personalMap = new Map<number, number>();
      const groupMap = new Map<number, number>();

      if (Array.isArray(activities)) {
      activities.forEach((activity: any) => {
        if (activity.activityType === 'PERSONAL_ROUTINE_COMPLETE' && activity.personalRoutineId) {
          personalMap.set(activity.personalRoutineId, activity.userActivityId);
        } else if (activity.activityType === 'GROUP_AUTH_COMPLETE' && activity.groupId) {
          groupMap.set(activity.groupId, activity.activityId);
        }
      });
    }

      setCompletedActivityIds({ personal: personalMap, group: groupMap });
    } catch (error) {
      console.error("오늘의 활동 내역 조회 실패:", error);
    }
  };

  // useEffect(() => {
  //   console.log(`[상태 체크] isLoggedIn: ${isLoggedIn}, UserInfo가 있나?: ${!!UserInfo}`);
  //   if (isLoggedIn && UserInfo) {
  //     fetchUserActivities(); 
  //     fetchPersonalRoutines(); 
  //     fetchUserTotalScore(); 
  //   }
  // }, [isLoggedIn, UserInfo]); 


  useEffect(() => {
    setPersonalRoutines(prevRoutines =>
      prevRoutines.map(routine => ({
        ...routine,
        completed: completedActivityIds.personal.has(routine.id),
      }))
    );
  }, [completedActivityIds]);

  const handleCreateRoutine = async (newRoutineData: Omit<Routine, 'id' | 'completed' | 'streak'>) => {
    if (!UserInfo) return;

    const payload: PersonalRoutineCreatePayload = {
      userId: UserInfo.id as number,
      routineName: newRoutineData.name,
      description: newRoutineData.description,
      startTime: newRoutineData.time,
      repeatDays: convertFrequencyToAuthDays(newRoutineData.frequency || []),
      startDate: new Date().toISOString().split('T')[0], // 예시: 오늘부터
      endDate: '2099-12-31', // 예시: 무기한
      isAlarmOn: !!newRoutineData.reminder,
      isPublic: newRoutineData.isPublic,
    };

    try {
      await createPersonalRoutine(payload);
      await fetchPersonalRoutines(); // 성공 후 목록 새로고침
      navigateBack();
    } catch (error) {
      console.error("루틴 생성 실패:", error);
      alert("루틴 생성에 실패했습니다.");
    }
  };

  
  const handleUpdateRoutine = async (updatedRoutine: Routine) => {
    if (updatedRoutine.isGroupRoutine) {
      const overrideData: RoutineOverride = {
        time: updatedRoutine.time,
        frequency: updatedRoutine.frequency,
        reminder: updatedRoutine.reminder,
        goal: updatedRoutine.goal,
      }

      const newOverrides = {
        ...groupRoutineOverrides,
        [updatedRoutine.id]: overrideData,
      };

      setGroupRoutineOverrides(newOverrides);
      localStorage.setItem('groupRoutineOverrides', JSON.stringify(newOverrides));
      
      } 
      // B. 개인 루틴일 경우 -> 기존 로직 (상태 직접 수정)
      else {
        const payload: PersonalRoutineUpdatePayload = {
        routineName: updatedRoutine.name,
        description: updatedRoutine.description,
        startTime: updatedRoutine.time,
        repeatDays: convertFrequencyToAuthDays(updatedRoutine.frequency || []),
        isAlarmOn: !!updatedRoutine.reminder,
        isPublic: updatedRoutine.isPublic,
      };
      try {
        await updatePersonalRoutine(updatedRoutine.id, payload);
        await fetchPersonalRoutines(); // 성공 후 목록 새로고침
      } catch (error) {
        console.error("루틴 수정 실패:", error);
        alert("루틴 수정에 실패했습니다.");
      }
    }
  };

  const handleDataRefresh = () => {
    console.log ('1️⃣ 데이터 새로고침 시작!');
    fetchUserActivities();
    fetchUserTotalScore();
    fetchRankingData();
  };

  const fetchPersonalRoutines = async () => {
    if (!UserInfo) return;
    try {
      const routinesFromServer = await getPersonalRoutinesByUser(UserInfo.id as number);
      
      console.log('2. [컴포넌트] API 함수로부터 전달받은 데이터:', routinesFromServer); // 이 줄은 여전히 실행되지 않을 겁니다.

      const transformedRoutines = (routinesFromServer || []).map(apiRoutine => {
        const isCompleted = completedActivityIds.personal.has(apiRoutine.routineId);
        const transformed = transformPersonalRoutine(apiRoutine);
        return {
          ...transformed,
          completed: isCompleted,
        };
      });

      setPersonalRoutines(transformedRoutines);
    } catch (error) {
      console.error("개인 루틴 목록 로딩 실패:", error);
    }
  };

  const getGroupRoutinesWithOverrides = (): Routine[] => {
  return myGroups.map(group => {
      const routine = transformGroupToRoutine(group);
      const override = groupRoutineOverrides[group.groupId];
  
      routine.completed = completedActivityIds.group.has(group.groupId);

    return override ? { ...routine, ...override } : routine;
  });
};

const handleToggleRoutinePublic = async (routine: Routine) => {
    if (routine.isGroupRoutine) {
      const currentOverride = groupRoutineOverrides[routine.id] || {};
      const newOverrides = {
        ...groupRoutineOverrides,
        [routine.id]: {
          ...currentOverride,
          isPublic: !routine.isPublic, // 현재 상태의 반대 값으로 설정
        },
      };

      setGroupRoutineOverrides(newOverrides);
      localStorage.setItem('groupRoutineOverrides', JSON.stringify(newOverrides));
      
      // 상세 화면의 상태도 즉시 업데이트
      setNavigationStack(prevStack =>
        prevStack.map(navItem =>
          navItem.screen === 'routine-detail' && navItem.params.id === routine.id
            ? { ...navItem, params: { ...routine, isPublic: !routine.isPublic } }
            : navItem
        )
      );
    } 
    // B. 개인 루틴일 경우 -> 기존 API 호출 로직
    else {
      try {
        const updatedRoutineFromServer = await toggleRoutinePublic(routine.id);
        const transformedRoutine = transformPersonalRoutine(updatedRoutineFromServer);

        setPersonalRoutines(prevRoutines =>
          prevRoutines.map(r => (r.id === routine.id ? transformedRoutine : r))
        );

        setNavigationStack(prevStack =>
          prevStack.map(navItem =>
            navItem.screen === 'routine-detail' && navItem.params.id === routine.id
              ? { ...navItem, params: transformedRoutine }
              : navItem
          )
        );
      } catch (error) {
        console.error("루틴 공개 여부 변경 실패:", error);
        alert("설정 변경에 실패했습니다.");
      }
    }
  };

  const handleToggleRoutineAlarm = async (routine: Routine) => {
    if (routine.isGroupRoutine) {
      const currentOverride = groupRoutineOverrides[routine.id] || {};
      const newOverrides = {
        ...groupRoutineOverrides,
        [routine.id]: {
          ...currentOverride,
          reminder: !routine.reminder, // 현재 상태의 반대 값으로 설정
        },
      };

      setGroupRoutineOverrides(newOverrides);
      localStorage.setItem('groupRoutineOverrides', JSON.stringify(newOverrides));
      
      // 상세 화면의 상태도 즉시 업데이트
      setNavigationStack(prevStack =>
        prevStack.map(navItem =>
          navItem.screen === 'routine-detail' && navItem.params.id === routine.id
            ? { ...navItem, params: { ...routine, reminder: !routine.reminder } }
            : navItem
        )
      );
    }
    // B. 개인 루틴일 경우 -> 기존 API 호출 로직
    else {
      try {
        const updatedRoutineFromServer = await toggleRoutineAlarm(routine.id);
        const transformedRoutine = transformPersonalRoutine(updatedRoutineFromServer);
        
        setPersonalRoutines(prevRoutines =>
          prevRoutines.map(r => (r.id === routine.id ? transformedRoutine : r))
        );

        setNavigationStack(prevStack =>
          prevStack.map(navItem =>
            navItem.screen === 'routine-detail' && navItem.params.id === routine.id
              ? { ...navItem, params: transformedRoutine }
              : navItem
          )
        );
      } catch (error) {
        console.error("루틴 알림 설정 변경 실패:", error);
        alert("설정 변경에 실패했습니다.");
      }
    }
  };


  const handleTogglePersonalRoutineCompletion = async (routineId: number) => {
  console.log('현재 완료된 루틴 Map:', completedActivityIds.personal);
  console.log(`이 루틴은 완료 상태인가? ->`, completedActivityIds.personal.has(routineId));
    const isCompleted = completedActivityIds.personal.has(routineId);

    try {
    if (isCompleted) {
      // --- 루틴 취소 로직 ---
      const userActivityId = completedActivityIds.personal.get(routineId);
      if (userActivityId) {
        await updateActivity(userActivityId, 'NOT_COMPLETED');
        // 완료 횟수 1 감소
        setRoutineCompletionCount(prev => {
          const newCount = Math.max(0, prev - 1);
          localStorage.setItem('routineCompletionCount', String(newCount));
          return newCount;
        });
      }
    } else {
      // --- 루틴 완료 로직 ---
      await createPersonalActivity(routineId);
      // 완료 횟수 1 증가
      const newRoutineCount = routineCompletionCount + 1;
      setRoutineCompletionCount(newRoutineCount);
      localStorage.setItem('routineCompletionCount', String(newRoutineCount));

      // '루틴 마스터' 배지 획득 조건 확인
      if (newRoutineCount >= 100 && !earnedBadges.includes('루틴 마스터')) {
        const badgeName: BadgeType = '루틴 마스터';
        
        // 상태와 로컬스토리지에 배지 정보 저장
        setEarnedBadges(prev => {
          const newEarned = [...prev, badgeName];
          localStorage.setItem('earnedBadges', JSON.stringify(newEarned));
          return newEarned;
        });
      
      // 배지 획득 모달 띄우기
      setBadgeName(badgeName);
      setBadgeImage(badgeInfo[badgeName].image);
      setBadgeModalOpen(true);
    }

    // 4. 출석 모달 띄우기 (배지 획득 여부와 관계없이 항상 실행)
    handleOpenAttendanceModal();
  } 
  
  await Promise.all([fetchUserActivities(), fetchUserTotalScore()]);

  } catch (error) {
    alert("루틴 상태 변경에 실패했습니다.");
    console.error("개인 루틴 완료/취소 처리 실패:", error);
  }
};

const handleGroupRoutineCompletion = () => {
    console.log("🏆 그룹 루틴 완료! 출석 및 통계 처리를 시작합니다.");

    // 1. 전체 루틴 완료 횟수 증가
    const newRoutineCount = routineCompletionCount + 1;
    setRoutineCompletionCount(newRoutineCount);
    localStorage.setItem('routineCompletionCount', String(newRoutineCount));

    // 2. '루틴 마스터' 배지 획득 조건 확인
    if (newRoutineCount >= 100 && !earnedBadges.includes('루틴 마스터')) {
      const badgeName: BadgeType = '루틴 마스터';
      setEarnedBadges(prev => {
        const newEarned = [...prev, badgeName];
        localStorage.setItem('earnedBadges', JSON.stringify(newEarned));
        return newEarned;
      });
      setBadgeName(badgeName);
      setBadgeImage(badgeInfo[badgeName].image);
      setBadgeModalOpen(true);
    }

    // 3. 출석 모달 띄우기
    handleOpenAttendanceModal();

    // 4. 데이터 새로고침 (활동 내역, 점수 등)
    handleDataRefresh();
  };


  const handleAddRecommendedRoutine = async (recommendedRoutine: RecommendedRoutine) => {
    if (!UserInfo) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    const payload: PersonalRoutineCreatePayload = {
      userId: UserInfo.id as number,
      routineName: recommendedRoutine.name,
      description: recommendedRoutine.description,
      startTime: recommendedRoutine.time,
      repeatDays: convertFrequencyToAuthDays(recommendedRoutine.frequency || []),
      startDate: new Date().toISOString().split('T')[0], // 시작일은 오늘로 설정
      endDate: '2099-12-31', // 종료일은 먼 미래로 설정
      isAlarmOn: recommendedRoutine.reminder,
      isPublic: recommendedRoutine.isPublic,
    };

    try {
      // 3. 개인 루틴 생성 API를 호출합니다.
      await createPersonalRoutine(payload);
      
      // 4. 성공 시, 전체 루틴 목록을 다시 불러와 화면을 갱신합니다.
      await fetchPersonalRoutines();
      
      console.log(`'${recommendedRoutine.name}' 루틴이 추가되었습니다.`);

    } catch (error) {
      console.error("추천 루틴 추가 실패:", error);
      alert("루틴 추가에 실패했습니다.");
    }
  };

  const handleDeleteRoutine = async (routineId: number, isGroupRoutine?: boolean) => {
    if (isGroupRoutine) {
      // 그룹 루틴 삭제
      setGroups(prevGroups => 
        prevGroups.map(group => {
          if (group.routines) {
            return {
              ...group,
              // 삭제할 루틴의 ID를 제외하고 새로운 배열 생성
              routines: group.routines.filter(r => r.id !== routineId)
            };
          }
          return group;
        })
      );
    } else {
      try {
        await deletePersonalRoutine(routineId);
        await fetchPersonalRoutines(); // 성공 후 목록 새로고침
        navigateBack();
      } catch (error) {
        console.error("루틴 삭제 실패:", error);
        alert("루틴 삭제에 실패했습니다.");
      }
    }
  };

  const fetchMonthlyReview = async () => {
    if (!UserInfo) return; 

    try {
      const date = new Date();
      date.setMonth(date.getMonth() - 1); // 지난달 기준
      const lastMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // POST 요청으로 수정하고, userId를 쿼리 파라미터로 전달
      const response = await apiFetch(`/api/reviews/monthly?userId=${UserInfo.id}&monthYear=${lastMonth}`, {
        method: 'POST',
      });

      if (response.success) {
        // 서버에서 메시지를 성공적으로 보냈다면, 프론트에서는 알림을 생성합니다.
        addNotification({
          message: `지난 달의 활동을 정리한 ${lastMonth} 월간 회고가 도착했어요.`,
          category: '회고',
          monthYear: lastMonth, // ★★★ 모달을 열 때 사용할 수 있도록 monthYear 정보 추가 ★★★
        });
      }
    } catch (error) {
      console.error("월간 회고 알림 생성 실패:", error);
    }
  };

  /**
   * 서버에서 알림 목록을 가져와 상태를 업데이트합니다.
   */
  const fetchNotifications = async () => {
    if (!isLoggedIn) return;
    try {
      const apiNotifications = await getNotifications();
      const transformedNotifications = apiNotifications.map(transformNotification);
      setNotifications(transformedNotifications);
    } catch (error) {
      console.error("알림을 불러오는데 실패했습니다.", error);
    }
  };

  // 로그인 시 알림 데이터를 불러옵니다.
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn]);


  /**
   * 알림 클릭 시 호출됩니다.
   * '읽음' 처리 API를 호출하고, UI 상태를 즉시 업데이트합니다.
   */
  const handleNotificationClick = async (notification: Notification) => {
    // 1. UI 즉시 업데이트 (Optimistic Update)
    if (!notification.read) {
      setNotifications(currentNotifications =>
        currentNotifications.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
    }

    if (notification.isLocal) {
      console.log(`로컬 알림(${notification.id})을 읽음 처리했습니다. (API 호출 없음)`);
      return; 
    }

    // 2. 서버에 '읽음' 상태 전송
    try {
      await markNotificationAsRead(notification.id, true);
    } catch (error) {
      // 실패 시 UI 롤백 (선택적)
      console.error("알림 읽음 처리 실패:", error);
      setNotifications(currentNotifications =>
        currentNotifications.map(n =>
          n.id === notification.id ? { ...n, read: false } : n
        )
      );
    }
    
    if (notification.category === '회고' && UserInfo?.id) {
      try {
        // 1. 회고 API를 호출합니다. (monthYear는 알림 객체에 저장된 값을 사용)
        const response = await getMonthlyReview(UserInfo.id as number, notification.monthYear);

        if (response.success && response.data) {
          // 2. 성공 시, 모달에 표시할 내용과 월 정보를 상태에 저장합니다.
          setReviewModalContent({
            content: response.data.messageContent, // API 응답의 실제 회고 내용
            monthYear: response.data.monthYear,
          });
          // 3. 회고 모달을 엽니다.
          setReviewModalOpen(true);
        } else {
          alert("회고 내용을 불러오는 데 실패했습니다: " + response.message);
        }
      } catch (error) {
        console.error("월간 회고 조회 API 호출 실패:", error);
        alert("회고 내용을 불러오는 중 오류가 발생했습니다.");
      }
    }
  };
  
  // 앱이 로드될 때 회고 데이터를 불러옵니다.
  useEffect(() => {
    if (isLoggedIn) {
      fetchMonthlyReview();
    }
  }, [isLoggedIn]);

  // 루틴 시작 5분 전 알림을 위한 useEffect
  // ------------------------------------------------------------------
  useEffect(() => {
    // 1분마다 실행되는 타이머를 설정합니다.
    const timer = setInterval(() => {
      const now = new Date();
      const allRoutines = [...personalRoutines, ...getGroupRoutinesWithOverrides()];

      allRoutines.forEach(routine => {
        // 조건: 1. 알림이 켜져 있고, 2. 시간이 설정되어 있으며, 3. 오늘 아직 알림을 보내지 않았어야 함
        if (routine.reminder && routine.time && !remindersSentToday[routine.id]) {
          
          // '08:30'과 같은 시간 문자열을 파싱합니다.
          const [hours, minutes] = routine.time.split(':').map(Number);
          
          // 오늘 날짜를 기준으로 루틴 실행 시간을 Date 객체로 만듭니다.
          const routineTime = new Date();
          routineTime.setHours(hours, minutes, 0, 0);

          // 현재 시간과 루틴 시간의 차이를 분(minute)으로 계산합니다.
          const diffInMinutes = (routineTime.getTime() - now.getTime()) / 1000 / 60;

          // 차이가 정확히 5분일 때 알림을 보냅니다.
          if (Math.round(diffInMinutes) === 5) {
            console.log(`'${routine.name}' 5분 전 알림 생성!`);
            
            // 기존 알림 추가 함수를 사용하여 새 알림을 생성합니다.
            addNotification({
              message: `'${routine.name}' 시작 5분 전입니다.`,
              category: '홈', // '홈' 또는 '그룹' 카테고리로 설정 가능
              icon: <Clock className="h-4 w-4 text-primary" />,
            });

            // 알림을 보냈다고 기록하여 중복을 방지합니다.
            setRemindersSentToday(prev => ({
              ...prev,
              [routine.id]: true,
            }));
          }
        }
      });
    }, 60000); // 60000ms = 1분

    // 컴포넌트가 사라질 때 타이머를 정리하여 메모리 누수를 방지합니다.
    return () => clearInterval(timer);

  }, [personalRoutines, remindersSentToday]); // 의존성 배열

  
   //7.그룹 관련 =============================================================
  
  /**
   * (유지) 사용자가 그룹 가입을 '요청'했을 때 호출됩니다.
   * - '의무 참여' 그룹인 경우, 리더에게 알림을 생성합니다.
   */
  const handleJoinGroupRequest = async (groupId: number) => {

    const group = groups.find(g => g.groupId === groupId);
    if (!group || !UserInfo || !UserInfo.id) {
      console.error("가입 요청 실패: 사용자 또는 그룹 정보가 없습니다.", { group, UserInfo });
      alert("사용자 또는 그룹 정보를 찾을 수 없어 가입 요청에 실패했습니다.");
      return;
    }

    try {
      await requestJoinGroup(groupId, UserInfo.id as number);

      if (group.groupType === 'FREE') {
        // --- 자유 참여 그룹일 경우 ---
        alert(`'${group.groupName}' 그룹에 참여했습니다!`);
        // 그룹 목록을 새로고침하여 UI에 즉시 반영합니다.
        fetchGroupData(); 
      } else {
        // --- 의무 참여 그룹일 경우 ---
        // 리더에게 보낼 알림을 생성합니다.
        addNotification({
          message: `${UserInfo.nickname || '사용자'}님이 '${group.groupName}' 그룹 참여를 신청했습니다.`,
          category: '그룹',
          relatedId: group.groupId,
          isLocal: true, 
        });
        alert('그룹 가입 요청이 전송되었습니다. 리더의 승인을 기다려주세요.');
      }

    } catch (error) {
      console.error("그룹 가입 요청 API 실패:", error);
      alert("그룹 가입 요청 중 오류가 발생했습니다.");
    }
  };

const handleAddGroup = async (newGroupData: any) => {
    try {
      await fetchGroupData(); 
      
      navigateTo("group");

      alert('그룹이 성공적으로 생성되었습니다.');
    } catch (error: any) {
      console.error("그룹 생성 실패:", error);
      alert(error.message);
    }
  };

  const handleUpdateGroup = (updatedGroup: Group) => {
    const isMandatory = updatedGroup.groupType === 'REQUIRED';
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.groupId === updatedGroup.groupId
          ? {
              ...group,
              ...updatedGroup,
              isMandatory: isMandatory,
            }
          : group
      )
    );

    setMyGroups(prevMyGroups => 
      prevMyGroups.map(group =>
        group.groupId === updatedGroup.groupId
          ? {
              ...group,
              ...updatedGroup,
              isMandatory: isMandatory,
            }
          : group
      )
    );

  };

  

  


const handleDeleteGroupSuccess = () => {
 
  fetchGroupData();
  navigateBack();
};
 // 8. 랭킹 관련 =============================================================

const [personalRankingData, setPersonalRankingData] = useState<IPersonalRankingResponse | null>(null);
const [userTotalScore, setUserTotalScore] = useState<number | null>(null);
const [loadingUserTotalScore, setLoadingUserTotalScore] = useState(true);
const [groupRankingData, setGroupRankingData] = useState<GlobalGroupRankingData | null>(null);
const [loadingGroupRanking, setLoadingGroupRanking] = useState(true);

// 모든 랭킹 데이터를 가져오는 통합 함수
const fetchRankingData = async () => {
  if (!isLoggedIn || !UserInfo) {
    console.log("로그인 상태가 아니거나 사용자 정보가 없습니다.");
     return;
  }

  setIsLoading(true);
  try {
     // 개인 랭킹 데이터 가져오기
    const personalRankingResponse = await getPersonalRankings(UserInfo.id);
     setPersonalRankingData(personalRankingResponse);

     // 그룹 랭킹 데이터 가져오기
    setLoadingGroupRanking(true);
     const now = new Date();
     const year = now.getFullYear();
     const month = String(now.getMonth() + 1).padStart(2, '0');
     const monthYear = `${year}-${month}`;
    const globalGroupRankingResponse = await getGlobalGroupRanking(monthYear);
    console.log("그룹 랭킹 API 응답:", globalGroupRankingResponse); 
    setGroupRankingData(globalGroupRankingResponse);
    
  } catch (error) {
    console.error("랭킹 데이터 로딩 실패:", error);
    setPersonalRankingData(null);
    setGroupRankingData(null);
  } finally {
     setLoadingGroupRanking(false);
     setIsLoading(false);
  }
};

// 사용자 총 점수를 가져오는 별도의 함수 (필요한 곳에서 재사용 가능)
const fetchUserTotalScore = async () => {
  if (!isLoggedIn) return;
  
  setLoadingUserTotalScore(true);
  try {
    const response = await getUserTotalScore();
  
     if (response.success) {
      setUserTotalScore(response.data);
       console.log("사용자 총 점수 조회 성공:", response.data);
    } else {
      console.error("사용자 총 점수 조회 실패:", response.message);
      setUserTotalScore(null);
    }
  } catch (error) {
    console.error("사용자 총 점수 데이터를 불러오는데 실패했습니다.", error);
    setUserTotalScore(null);
  } finally {
     setLoadingUserTotalScore(false);
  }
};

const handleRankingTabClick = () => {
  // 탭 클릭 시 랭킹 데이터만 새로고침
  fetchRankingData();
  setActiveTab('ranking');
};


// 9. ui/네비게이션 관련 =============================================================
  const handleSearch = (query: string) => {
    console.log("검색:", query);
  };

  const handleNewProject = () => {
    navigateTo("create-routine");
  };

  const handleProfileMenuClick = (action: string) => {
    switch (action) {
      case "settings":
        navigateTo("settings");
        break;
      case "help":
        navigateTo("help");
        break;
      case "logout":
        setIsLoggedIn(false);
        setActiveTab("home");
        setNavigationStack([]);
        break;
    }
  };

const navigateTo = (screen: string, params?: any, options?: { replace?: boolean }) => {
  const tabs = ["home", "routine", "group", "ranking", "mypage"];
  if (tabs.includes(screen)) {
    setActiveTab(screen);
    setNavigationStack([]);
    return;
  }

  // ✨ 여기를 수정합니다.
  setNavigationStack(prevStack => {
    // replace 옵션이 true일 경우, 스택의 마지막 요소를 새 화면으로 교체
    if (options?.replace) {
      // 기존 스택에서 마지막 요소를 제거하고 새로운 화면을 추가
      return [...prevStack.slice(0, -1), { screen, params }];
    } else {
      // 일반적인 경우, 스택에 새로운 화면을 추가
      return [...prevStack, { screen, params }];
    }
  });
};

  const navigateBack = () => {
    setNavigationStack(navigationStack.slice(0, -1));
  };

  const toggleDarkMode = async () => {
    if (!UserInfo) return;

    // 1. 예상되는 다음 상태를 먼저 UI에 반영 (Optimistic Update)
    const nextDarkModeState = !UserInfo.isDarkMode;
    setUserInfo({ ...UserInfo, isDarkMode: nextDarkModeState });

    try {
      // 2. API를 호출하여 서버의 상태를 변경
      await toggleDarkModeAPI(nextDarkModeState);
      // 성공 시, UI는 이미 반영되었으므로 추가 작업 불필요
    } catch (error) {
      // 3. API 호출 실패 시, UI를 원래 상태로 되돌림 (Rollback)
      console.error("다크 모드 변경 실패:", error);
      setUserInfo({ ...UserInfo, isDarkMode: !nextDarkModeState });
      alert("다크 모드 설정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleToggleAlarm = async () => {
    if (!UserInfo) return;

    // 1. Optimistic UI Update
    const nextAlarmState = !UserInfo.isAlarmOn;
    setUserInfo({ ...UserInfo, isAlarmOn: nextAlarmState });

    try {
      // 2. API 호출
      await toggleAlarmAPI(nextAlarmState);
    } catch (error) {
      // 3. Rollback on error
      console.error("알림 설정 변경 실패:", error);
      setUserInfo({ ...UserInfo, isAlarmOn: !nextAlarmState });
      alert("알림 설정에 실패했습니다. 다시 시도해주세요.");
    }
  };

   const handleLeaveGroup = () => {
    
    // 그룹을 떠난 후 그룹 목록 화면으로 바로 이동하도록 합니다.
    setNavigationStack([]);
    setActiveTab("group");
  };


// 9. 화면 렌더링 및 모달 =============================================================

  const renderScreen = () => {
    if (!isLoggedIn) {
      return <LoginScreen onLogin={handleKakaoLogin} />;
    }

    if (isLoading || !UserInfo) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    }
    
    const currentScreen = navigationStack[navigationStack.length - 1];
    if (currentScreen) {
      switch (currentScreen.screen) {
        case "routine-detail":
          return (
            <RoutineDetailScreen
              routine={currentScreen.params}
              onBack={navigateBack}
              onUpdateRoutine={handleUpdateRoutine}
              onDeleteRoutine={handleDeleteRoutine}
              onTogglePublic={handleToggleRoutinePublic}
              onToggleAlarm={handleToggleRoutineAlarm}
            />
          );
       
          case "group-detail": { 
            console.log('넘어온 params:', currentScreen.params);
          console.log('넘어온 groupId:', groupId);
          console.log('해당 그룹의 멤버 groupmembers:', members);
          console.log('그룹상세 groups:', groups);
          console.log('내 아이디 myId:', myId);
          console.log("isJoined:", isJoined);
        return (
          <GroupDetailScreen
            groupId={groupId}
            groups={groups}
            onBack={navigateBack}
            onNavigate={navigateTo}
            onUpdateGroup={handleUpdateGroup}
            currentUser={UserInfo} 
            groupMembers={members}
            onDeleteGroupSuccess={handleDeleteGroupSuccess}
            myid={myId ?? 0}
            onGroupJoined={fetchGroupData}
            isJoined={isJoined}
           onRefreshMembers={handleGroupMembersRefresh} 
          />
        );
      }
      
      case "user-home":
        // ▼▼▼ 이 로직을 추가하세요 ▼▼▼

        // 1. 현재 보고 있는 사용자의 ID를 가져옵니다.
        const targetUser = currentScreen.params as { id: number; nickname: string };

        // 2. 이 사용자가 참여한 그룹만 필터링합니다.
        const userJoinedGroups = groups.filter(group => {
          const membersOfGroup = groupMembers[group.groupId] || [];
          return membersOfGroup.some(member => member.userId === targetUser.id);
        });

        // 3. 필터링된 그룹 목록을 userJoinedGroups라는 prop으로 전달합니다.
        return (
          <UserHomeScreen
            user={targetUser}
            onBack={navigateBack}
             // 👈 이 prop을 새로 추가하세요!
          />
        );
        
        case "profile-edit":
            return (
              <ProfileEditScreen 
                onBack={navigateBack} 
                onNavigate={navigateTo}
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                userInfo={UserInfo}
                onDeleteAccount={handleDeleteAccount} 
                onSaveProfile={handleSaveProfile}
              />
            );
        case "group-chat":{
          const groupId = currentScreen.params.groupId;
           console.log('chat groupId:', groupId);
           console.log('chat params:', currentScreen.params);
          return (
            <GroupChatScreen
              group={currentScreen.params}
              groupmembers={members}
              onBack={navigateBack}
              onLeaveGroup={handleLeaveGroup}
              userInfo={UserInfo}
              onDataRefresh={handleDataRefresh}
              onGroupRoutineComplete={handleGroupRoutineCompletion}
            />
          );
        }
        case "create-routine":
          return (
            <CreateRoutineScreen 
              onBack={navigateBack} 
              onCreateRoutine={handleCreateRoutine}
            />
          );
        case "create-group":
          return (
            <CreateGroupScreen
              onBack={navigateBack}
              onCreateGroup={handleAddGroup}
            />
          );
        case "settings":
          return (
            <SettingsScreen
              onBack={navigateBack}
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
              onDeleteAccount={handleDeleteAccount} 
              isAlarmOn={UserInfo.isAlarmOn ?? true}
              onToggleAlarm={handleToggleAlarm}
            />
          );
        case "help":
          return <HelpScreen onBack={navigateBack} />;
        case "user-home":
          return (
            <UserHomeScreen
              user={currentScreen.params as { id: number; nickname: string; }}
              onBack={navigateBack} 
                         />
          );
        default:
          return renderMainScreen();
      }
    }
    return renderMainScreen();
  };

  const renderMainScreen = () => {
    if (!UserInfo) {
        return <div>사용자 정보를 불러오는 중입니다...</div>;
    }
    switch (activeTab) {
      case "home":
        return (
          <HomeScreen 
            onNavigate={navigateTo} 
            routines={[...personalRoutines, ...getGroupRoutinesWithOverrides()]}
            onTogglePersonalRoutine={handleTogglePersonalRoutineCompletion}
            streakDays={streakDays}
            userInfo={{...UserInfo, exp: UserInfo.exp ?? 0 }}
            participatingGroups={myGroups}
            onOpenAttendanceModal={handleOpenAttendanceModal}
            onOpenStreakModal={handleOpenStreakModal}
            onOpenBadgeModal={handleOpenBadgeModal}
            userTotalScore={userTotalScore}
          />
        );
      case "routine":
        return <RoutineScreen 
          onNavigate={navigateTo} 
          allRoutines={[...personalRoutines, ...getGroupRoutinesWithOverrides()]}
          recommendedRoutines={recommendedRoutines}
          onTogglePersonalRoutine={handleTogglePersonalRoutineCompletion}
          onAddRecommendedRoutine={handleAddRecommendedRoutine}
          onOpenAttendanceModal={handleOpenAttendanceModal}
          onOpenStreakModal={handleOpenStreakModal}
          onOpenBadgeModal={handleOpenBadgeModal}
          initialUserInfo={UserInfo} 
          participatingGroups={myGroups} 
          allGroups={groups}
        />;
      case "group":
        return <GroupScreen 
                  onNavigate={navigateTo} 
                  groups={groups} 
                  myGroups={myGroups}   
                  onNewGroup={() => navigateTo("create-group")}
                  onJoinGroup={handleJoinGroupRequest}
                />
      case "ranking":{
        console.log('그룹 목록 (랭킹):', groups);
        console.log('개인 랭킹 데이터 (랭킹):', personalRankingData);
        return <RankingScreen 
                  groups={groups}
                  personalRankingData={personalRankingData}
                  groupRankingData={groupRankingData} 
                  userTotalScore={userTotalScore} 
                  loadingGroupRanking={loadingGroupRanking} 
                  loadingUserTotalScore={loadingUserTotalScore}
                />}
      case "mypage":
        return (
          <MyPageScreen
            onNavigate={navigateTo}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            onToggleAlarm={handleToggleAlarm}
            user={{
              ...UserInfo, 
              isAlarmOn: UserInfo.isAlarmOn ?? true,
              streakDays: streakDays 
            }}
            onLogout={handleLogout}
            attendanceDates={attendanceDates}
            earnedBadges={earnedBadges}
            routineCompletionCount={routineCompletionCount}
            userTotalScore={userTotalScore}
          />
        );
      
      default:
        return (
          <HomeScreen 
            onNavigate={navigateTo} 
            routines={personalRoutines}
            onTogglePersonalRoutine={handleTogglePersonalRoutineCompletion}
            streakDays={streakDays}
            userInfo={{...UserInfo, exp: UserInfo.exp ?? 0}}
            participatingGroups={myGroups}   
            onOpenAttendanceModal={handleOpenAttendanceModal}
            onOpenStreakModal={handleOpenStreakModal}
            onOpenBadgeModal={handleOpenBadgeModal}
            userTotalScore={userTotalScore}
            // onAddAuthMessage={handleAddAuthMessage}
            // pendingAuthMessages={pendingAuthMessages}
            // onApproveAuthMessage={handleApproveAuthMessage}
            // onRejectAuthMessage={handleRejectAuthMessage}
             
          />
        );
    }
  };

  //11. 출석, 스트릭, 배지 모달 관련 =============================================================

  const handleOpenAttendanceModal = () => {
    const today = new Date().toDateString();
    
    // 루틴 완료 시 호출
    if (lastCompletionDate !== today) {
    setAttendanceModalOpen(true);
    setLastCompletionDate(today);
    localStorage.setItem('lastCompletionDate', today);
    }
  };

  const handleOpenStreakModal = (streakDays: number) => {
    // 특정 누적일 달성 시 호출
    setStreakModalOpen(true);
  };
  
  const handleOpenBadgeModal = (badgeName: string, badgeImage: string) => {
    // 배지 획득 시 호출
    setBadgeModalOpen(true);
  };

  const handleNextModalSequence = (currentStreak: number, currentAttendance: number) => {
    
    // 1. 스트릭 모달 조건 검사 (누적 출석 모달)
    const streakMilestones = [7, 30, 90, 180, 365];
    if (streakMilestones.includes(currentStreak)) {
        setStreakModalOpen(true);
    } 
    // 2. 배지 모달 조건 검사 (성취 배지 모달)
    else {
        checkAndShowAllBadges(currentStreak, currentAttendance);
    }
  };

  const checkAndShowAllBadges = (currentStreak: number, currentAttendance: number) => {
    const badgesToShow = [];
    const newlyEarned: BadgeType[] = [];

    if (currentAttendance >= 1 && !earnedBadges.includes('첫걸음')) {
    newlyEarned.push('첫걸음');
    }
    if (currentStreak >= 7 && !earnedBadges.includes('7일 연속')) {
      newlyEarned.push('7일 연속');
    }
    if (currentAttendance >= 30 && !earnedBadges.includes('월간 챔피언')) {
      newlyEarned.push('월간 챔피언');
    }

    // 새로 획득한 배지가 있을 경우에만 실행
    if (newlyEarned.length > 0) {
      // 1. 주(main) 상태와 localStorage 업데이트
      setEarnedBadges(prev => {
        const updatedBadges = [...prev, ...newlyEarned];
        localStorage.setItem('earnedBadges', JSON.stringify(updatedBadges));
        return updatedBadges;
      });

      // 2. 모달 띄울 준비
      const badgesToShow = newlyEarned.map(badgeName => ({
        name: badgeName,
        image: badgeInfo[badgeName].image,
      }));

      // 3. 첫 번째 획득 배지 모달 띄우기
      const firstBadge = badgesToShow.shift();
      if (firstBadge) {
        setBadgeName(firstBadge.name);
        setBadgeImage(firstBadge.image);
        setBadgeModalOpen(true);
        // 남은 배지가 있다면 대기열에 추가
        setPendingBadges(badgesToShow);
      }
    }
  };

  const handleCloseAttendanceModal = async () => {
    setAttendanceModalOpen(false);
    
    const todayString = getLocalDateString(new Date()); 
    console.log('1. 모달 닫힘. 오늘 날짜(KST):', todayString);

    try {
    const hasAttendedToday = await checkAttendance(todayString);
    console.log('2. checkAttendance API 결과:', hasAttendedToday);

    if (hasAttendedToday) {
    console.log('3. 출석 인정됨. 연속일 계산 시작.');
    await fetchTotalAttendance();

    const newDates = [...attendanceDates];
    if (!newDates.includes(todayString)) {
      newDates.push(todayString);
      localStorage.setItem('attendanceDates', JSON.stringify(newDates));
      setAttendanceDates(newDates);
    }
    console.log('4. 갱신된 출석 날짜 배열:', newDates);
    let consecutiveCount = 0;
    const dateChecker = new Date(); 

    while (newDates.includes(getLocalDateString(dateChecker))) {
      consecutiveCount++;
      dateChecker.setDate(dateChecker.getDate() - 1); // 어제 날짜로 변경
    }
    console.log('5. 계산된 연속 출석일:', consecutiveCount);
    const currentMaxStreak = UserInfo?.maxStreakDays ?? 0;
    console.log('6. 현재 저장된 최대 연속일 (UserInfo 기준):', currentMaxStreak);
    if (consecutiveCount > currentMaxStreak && UserInfo) {
      console.log(`7. 새로운 기록 달성! (${consecutiveCount} > ${currentMaxStreak}). 상태와 localStorage를 업데이트합니다.`);
      const newMaxStreak = consecutiveCount;
      setUserInfo({ ...UserInfo, maxStreakDays: consecutiveCount });
      
      localStorage.setItem('maxStreakDays', String(newMaxStreak));
    } else {
        console.log(`7. 새로운 기록 아님. (${consecutiveCount} <= ${currentMaxStreak}). 상태 업데이트 없음.`);
      }

    const newAttendanceCount = attendanceCount + 1;
    setAttendanceCount(newAttendanceCount);
    localStorage.setItem('attendanceCount', String(newAttendanceCount));

    handleNextModalSequence(consecutiveCount, newAttendanceCount);
  } else {
      console.log('3. 출석 인정 안 됨. 연속일 계산을 건너뜁니다.');
    }
} catch (error) {
    console.error("오늘 출석 여부 확인 중 에러 발생:", error);
  }
};

  const handleCloseStreakModal = () => {
    setStreakModalOpen(false);
    checkAndShowAllBadges(streakDays, attendanceCount);
  };

  const handleCloseBadgeModal = () => {
    setBadgeModalOpen(false);
    if (pendingBadges.length > 0) {
        const nextBadge = pendingBadges.shift();
        if (nextBadge) {
          setBadgeName(nextBadge.name);
          setBadgeImage(nextBadge.image);
          setBadgeModalOpen(true);
          setPendingBadges(pendingBadges);
        }
    }
  };
  //====================================================================
  return (
    <div
      className={`min-h-screen w-full bg-[var(--root-background)] flex items-center justify-center `}
    >
    
      <div className="min-w-[360px] w-full max-w-none md:max-w-[1000px] lg:max-w-[1280px] h-[850px] bg-background flex flex-col overflow-hidden rounded-lg shadow-2xl border border-border/50">
        {!isLoggedIn ? (
          <div className="w-full h-full">{renderScreen()}</div>
        ) : (
          <>
            {(!currentScreen || currentScreen.screen === 'user-home') && UserInfo && (
              <TopNavBar
                onSearch={handleSearch}
                onNotificationClick={handleNotificationClick}
                onProfileMenuClick={handleProfileMenuClick}
                userInfo={UserInfo}
                notifications={notifications}
                showBackButton={currentScreen?.screen === 'user-home'}
                onBackClick={navigateBack} 
                //pendingAuthMessages={pendingAuthMessages}
              />
            )}

            <main className="flex-1 bg-background flex flex-col overflow-hidden">
              <div className="flex-1 overflow-auto ">
                {renderScreen()}
              </div>

               {!currentScreen && (
              <div className="bg-background border-t border-border">
                <BottomTabNav
                  activeTab={activeTab}
                  onTabChange={(tabName: string) => {
                    if (tabName === 'ranking' && personalRankingData === null && !isLoading) {
                      handleRankingTabClick();
                    }
                    setActiveTab(tabName);
                }}
              />
            </div>
              )}
            </main>
          </>
          
        )}
      </div>
      <LoginModal // 새로 추가된 로그인 모달
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        //onComplete={handleNicknameSetupComplete}
        onComplete={handleLoginComplete}
      />

      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={handleCloseAttendanceModal}
      />

      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={handleCloseStreakModal}
        streakDays={streakDays}
      />

      <AchievementBadgeModal
        isOpen={isBadgeModalOpen}
        onClose={handleCloseBadgeModal}
        badgeName={badgeName}
        badgeImage={badgeImage}
      />

      <MonthlyReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        reviewContent={reviewModalContent.content}
        monthYear={reviewModalContent.monthYear}
      />
    </div>
  );
}