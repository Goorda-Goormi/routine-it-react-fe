import React, { useState, useEffect, useRef } from "react";
import { EventSourcePolyfill } from 'event-source-polyfill';
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
import { createGroup, getAllGroups,getJoinedGroups,getGroupMembers, requestJoinGroup, updateGroupMemberAlarm } from "./api/group";
import { updateRankingScore, getPersonalRankings, getUserTotalScore, getGlobalGroupRanking } from "./api/ranking";
import { getMonthlyReview } from './api/review';
import type { IPersonalRankingResponse, UserTotalScoreResponse, IPersonalRankingData } from './interfaces';
import type { GlobalGroupRankingData } from "./pages/Ranking/RankingScreen";import { toggleDarkMode as toggleDarkModeAPI, toggleAlarm as toggleAlarmAPI } from './api/setting';
import { getNotifications, markNotificationAsRead } from "./api/notification";
import { notificationService } from "./api/sse";
import type { NotificationApiResponse, NotificationType } from "./interfaces";
import { User, Bell, Camera, Clock } from 'lucide-react'
import { Provider } from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';
import { store, type RootState, type AppDispatch } from './store/store';
import { login, logout } from './store/authSlice';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface NavigationState {
  screen: string;
  params?: any;
}

interface UserLoginData {
  userId: string;
  nickname: string;
}

type PersonalRankingPaginationObject = {
  content: IPersonalRankingData[];
  last: boolean;
  empty: boolean;
  first: boolean;
  number: number;
  numberOfElements: number;
  pageable: any; 
  size: number;
  sort: any; 
  totalElements: number;
  totalPages: number;
}

// 랭킹 API가 페이지네이션으로 응답할 때의 전체 응답 타입입니다.
type PaginatedPersonalRankingResponse = {
  success: boolean;
  message: string;
  data: PersonalRankingPaginationObject;
}

const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 로컬 스토리지 백업 유틸리티 함수들
const saveCompletedRoutinesToLocal = (personalMap: Map<number, number>, groupMap: Map<number, number>) => {
  try {
    const today = getLocalDateString(new Date());
    const data = {
      date: today,
      personal: Array.from(personalMap.entries()),
      group: Array.from(groupMap.entries()),
      timestamp: Date.now()
    };
    localStorage.setItem('completedRoutines', JSON.stringify(data));
    //console.log('완료된 루틴을 로컬 스토리지에 백업했습니다:', data);
  } catch (error) {
    console.error('로컬 스토리지 백업 실패:', error);
  }
};

const loadCompletedRoutinesFromLocal = (): { personal: Map<number, number>, group: Map<number, number> } | null => {
  try {
    const today = getLocalDateString(new Date());
    const stored = localStorage.getItem('completedRoutines');
    
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    
    if (data.date !== today) {
      localStorage.removeItem('completedRoutines');
      return null;
    }
    
    if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('completedRoutines');
      return null;
    }
    
    const personalMap = new Map<number, number>(data.personal || []);
    const groupMap = new Map<number, number>(data.group || []);
    
    return { personal: personalMap, group: groupMap };
  } catch (error) {
    console.error('로컬 스토리지에서 완료 루틴 로드 실패:', error);
    localStorage.removeItem('completedRoutines');
    return null;
  }
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
    goal: pr.goal,
    category: pr.category, 
  };
};

type RoutineOverride = Partial<Pick<Routine, 'time' | 'frequency' | 'reminder' | 'goal'>>;

/**
 * { hour: 8, minute: 0 } 형태의 alarmTime 객체를 '08:00' 형태의 문자열로 변환합니다.
 */
const convertAlarmTimeToTimeString = (alarmTime: string | null | undefined): string => {
  
  if (typeof alarmTime === 'string' && alarmTime.includes(':')) {
    
    return alarmTime.slice(0, 5);
  }
  return '09:00';
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
    id: group.groupId,
    name: group.groupName,
    description: group.description,
    category: group.category,
    isGroupRoutine: true, 

    time: convertAlarmTimeToTimeString(group.alarmTime),
    frequency: convertAuthDaysToFrequency(group.authDays),
    type: group.groupType === 'REQUIRED' ? '의무참여' : '자유참여',

    completed: false, 
    streak: 0,
    goal: '30',
    reminder: group.membershipSettings?.isAlarmOn ?? true,
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
  let relatedId: number | undefined = undefined; 
  let monthYear: string | undefined = undefined; 

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
    relatedId: relatedId, 
    monthYear: monthYear,
  };
};


type BadgeType = '첫걸음' | '7일 연속' | '루틴 마스터' | '월간 챔피언';
//type PendingAuthMap = { [groupId: number]: AuthMessage[] };
export default function App() {
  
  //1. 상태관리 변수===================================================
  
  const { isLoggedIn, userId } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
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
  const [remindersSent0minToday, setRemindersSent0minToday] = useState<Record<number, boolean>>({});

  const [currentDate, setCurrentDate] = useState(new Date().toDateString());
  
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  
  useEffect(() => {
    // 10분마다 현재 날짜를 확인합니다.
    const checkDateTimer = setInterval(() => {
      const today = new Date().toDateString();
      if (today !== currentDate) {
        // 날짜가 변경되었으면 (자정이 지났으면)
        console.log("자정이 지났습니다. 알림 전송 상태를 초기화합니다.");
        setCurrentDate(today); // 현재 날짜를 갱신
        setRemindersSentToday({}); // 5분 전 알림 상태 초기화
        setRemindersSent0minToday({}); // 0분 전 알림 상태 초기화
      }
    }, 1000 * 60 * 10); // 10분(600000ms)에 한 번씩 날짜 체크

    return () => clearInterval(checkDateTimer);
  }, [currentDate]);
  
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewModalContent, setReviewModalContent] = useState({ content: '', monthYear: '' });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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

  const syncTodaysAttendance = async () => {
    if (!isLoggedIn) return;
    
    const todayString = getLocalDateString(new Date());

    // 이미 로컬에 오늘 출석 기록이 있으면 추가 작업을 하지 않습니다.
    if (attendanceDates.includes(todayString)) {
      return;
    }

    try {
      // 서버에 오늘 활동 기록이 있는지 물어봅니다.
      const todaysActivities = await getUserActivitiesByDay(todayString);
      
      // 활동 기록이 하나라도 있다면 (출석으로 인정)
      if (todaysActivities && todaysActivities.length > 0) {
        // 로컬 데이터에 오늘 날짜를 추가하고 저장합니다.
        const newDates = [...attendanceDates, todayString];
        setAttendanceDates(newDates);
        localStorage.setItem('attendanceDates', JSON.stringify(newDates));
        console.log('✅ 오늘 출석 기록을 서버에서 확인하여 로컬에 동기화했습니다.');
      }
    } catch (error) {
      console.error("오늘 출석 기록 동기화 실패:", error);
    }
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
      category: 'lifestyle',
      completed: false,
      streak: 0,
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
      isGroupRoutine: false,
      isPublic: true
    }
  ]);

  const fetchTotalAttendance = async () => {
    //if (!isLoggedIn) return;
    try {
      // targetUserId 없이 호출하여 '내' 누적 출석일을 가져옵니다.
      const totalDays = await getTotalAttendanceDays();
      //console.log('✅ [App.tsx] fetchTotalAttendance API 응답:', totalDays);
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
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error("인증 토큰이 없습니다.");
      setIsLoading(false); // 로딩 상태 해제
      return;
    }
      
    try {
      const userInfoData = await getUserInfo();
      setUserInfo(prevUserInfo => ({
        ...prevUserInfo,
        ...userInfoData,
      }));
    } catch (error) {
      console.error("사용자 정보 조회 에러:", error);
      localStorage.removeItem('accessToken');
      isLoggedIn;
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
      console.log("서버에서 받은 그룹 목록:", joinedGroupsFromServer);

      const transformedJoinedGroups: Group[] = joinedGroupsFromServer.map((group: any) => {
        const transformedMembers: Member[] = (group.recentMembers || []).map(
          (apiMember: GroupMemberResponse) => ({
            id: apiMember.userId, 
            nickname: apiMember.nickname,
            profileImageUrl: apiMember.profileImageUrl,
          })
        );
        return { ...group, recentMembers: transformedMembers };
      });

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
  const checkAuthAndFetchUser = async () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('accessToken');
  const isNew = params.get('isNewUser') === 'true';
  let shouldFetchUser = false;

  try {
    if (token) {
      localStorage.setItem('accessToken', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      shouldFetchUser = true; 
      
      if (isNew) {
        setIsNewUser(true);
        setIsLoginModalOpen(true);
        return; 
      }

    } else if (localStorage.getItem('accessToken')) {
      shouldFetchUser = true; 
    }

    if (shouldFetchUser) {
      await fetchUserInfo();
    }

  } catch (error) {
    console.error("인증 또는 사용자 정보 로딩 실패. 로그아웃 처리:", error);
    localStorage.removeItem('accessToken');
    dispatch(logout()); 
    setUserInfo(null);
  }
};

useEffect(() => {
  checkAuthAndFetchUser();
}, []);

useEffect(() => {
    if (UserInfo && !isLoggedIn) {
        
        dispatch(login({
            nickname: UserInfo.nickname, 
            userId: String(UserInfo.id), 
        }));
        
        setIsLoginModalOpen(false);
      
    }
}, [UserInfo, isLoggedIn, dispatch]);


useEffect(() => {
  if (isLoggedIn && UserInfo) {
    syncTodaysAttendance();

    const fetchRemainingData = async () => {
      // 먼저 로컬 스토리지에서 완료 상태를 복원 시도
      const localData = loadCompletedRoutinesFromLocal();
      if (localData) {
        //console.log('앱 초기화: 로컬 스토리지에서 완료 상태를 먼저 복원했습니다.');
        setCompletedActivityIds(localData);
      }
      
      // 그 다음 서버에서 최신 데이터를 가져와 동기화
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
    fetchMonthlyReview(); 
  }
}, [isLoggedIn, UserInfo]);

  useEffect(() => {
    if (isLoggedIn && (activeTab === 'home' || activeTab === 'routine')) {
      console.log(`탭이 '${activeTab}'(으)로 변경되어 데이터를 새로고침합니다.`);
      handleDataRefresh(); 
    }
  }, [activeTab]);

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

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [navigationStack, activeTab]); 


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
      isLoggedIn;
      setIsLoginModalOpen(false);
    }
  };
  
  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('accessToken', token);
    isLoggedIn;
    setIsLoginModalOpen(false);
  };

  // 닉네임 설정 완료 후 호출될 함수
  const handleNicknameSetupComplete = async (nickname: string) => {
    try { 
      const updatedUserInfo = await completeSignup(nickname);

      setUserInfo(updatedUserInfo);
      isLoggedIn;
      setIsNewUser(false);
      setIsLoginModalOpen(false);
      alert('회원가입이 완료되었습니다.');

    } catch (error) {
    console.error("회원가입 에러:", error);
    alert((error as Error).message);
  }
};

  // const handleLoginComplete = async (nickname: string) => {
  //   await handleNicknameSetupComplete(nickname);
  // };

  const handleLogout = async() => {
    try {
        console.log('🚪 Logging out...');
        
        await fetch(`${BASE_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        });
        
        console.log('✅ Logout request sent to server');
        
    } catch (error) {
        console.error('⚠️ Logout request failed:', error);
    } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken'); 
        
        console.log('✅ Local tokens cleared');
        
        isLoggedIn;
        setUserInfo(null);
        window.location.href = '/login';
    }
  };


  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm("계정 탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다. 정말로 탈퇴하시겠습니까?");
    if (isConfirmed) {
      try {
        await deleteAccount();

        isLoggedIn;
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
          exp: 0,
          maxExp: 1000,
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
  
  const fetchUserActivities = async (retryCount = 0) => {
    if (!isLoggedIn) return;
    
    const today = getLocalDateString(new Date());
    
    try {
      //console.log('사용자 활동 정보를 가져오는 중...', { today, retryCount });
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
      
      // 로컬 스토리지에 백업
      saveCompletedRoutinesToLocal(personalMap, groupMap);
      
      //console.log('✅ 사용자 활동 정보를 성공적으로 가져왔습니다:', { personalMap, groupMap });
    } catch (error) {
      console.error("사용자 활동 정보 조회 실패:", error, { retryCount });
      
      // 재시도 로직 (최대 2번)
      if (retryCount < 2) {
        console.log(`${retryCount + 1}번째 재시도 중...`);
        setTimeout(() => fetchUserActivities(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      // 재시도 실패 시 로컬 스토리지에서 복원 시도
      console.log('재시도 실패. 로컬 스토리지에서 복원을 시도합니다.');
      const localData = loadCompletedRoutinesFromLocal();
      
      if (localData) {
        setCompletedActivityIds(localData);
        //console.log('✅ 로컬 스토리지에서 완료 상태를 복원했습니다.');
      } else {
        console.log('⚠️ 로컬 스토리지에서도 복원할 데이터가 없습니다.');
        // 빈 Map으로 초기화
        setCompletedActivityIds({
          personal: new Map<number, number>(),
          group: new Map<number, number>(),
        });
      }
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
      category: newRoutineData.category,
      goal: newRoutineData.goal,
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
        category: updatedRoutine.category, 
        goal: updatedRoutine.goal,  
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

      // ▼▼▼ [진단용 로그 1] 서버에서 막 받아온 원본 데이터를 확인합니다. ▼▼▼
      console.log("1. [fetchPersonalRoutines] 서버에서 받은 개인 루틴:", routinesFromServer);

      const transformedRoutines = (routinesFromServer || []).map(apiRoutine => {
        const isCompleted = completedActivityIds.personal.has(apiRoutine.routineId);
        const transformed = transformPersonalRoutine(apiRoutine);
        return {
          ...transformed,
          completed: isCompleted,
        };
      });

      // ▼▼▼ [진단용 로그 2] 최종적으로 상태를 업데이트할 데이터를 확인합니다. ▼▼▼
      console.log("2. [fetchPersonalRoutines] 상태를 업데이트할 최종 루틴 목록:", transformedRoutines);

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
      try {
      const newAlarmState = !routine.reminder;
      await updateGroupMemberAlarm(routine.id, newAlarmState);

      // API 호출 성공 시, 화면에 즉시 반영하기 위해 로컬 상태를 업데이트합니다.
      setMyGroups(prevGroups =>
        prevGroups.map(g =>
          g.groupId === routine.id
            ? { 
                ...g, 
                membershipSettings: { 
                  ...g.membershipSettings, 
                  isAlarmOn: newAlarmState 
                } 
              }
            : g
        )
      );
      
      // 상세 화면의 상태도 즉시 업데이트
      setNavigationStack(prevStack =>
        prevStack.map(navItem =>
          navItem.screen === 'routine-detail' && navItem.params.id === routine.id
            ? { ...navItem, params: { ...routine, reminder: newAlarmState } }
            : navItem
        )
      );

    } catch (error) {
      console.error("그룹 루틴 알림 설정 변경 실패:", error);
      alert("알림 설정 변경에 실패했습니다.");
    }
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
        
        setCompletedActivityIds(prev => {
          const newPersonalMap = new Map(prev.personal);
          newPersonalMap.delete(routineId); // 맵에서 해당 루틴 ID 제거
          const newState = { ...prev, personal: newPersonalMap };
          
          // 로컬 스토리지에 백업
          saveCompletedRoutinesToLocal(newPersonalMap, prev.group);
          
          return newState;
        });

        // 완료 횟수 1 감소
        setRoutineCompletionCount(prev => {
          const newCount = Math.max(0, prev - 1);
          localStorage.setItem('routineCompletionCount', String(newCount));
          return newCount;
        });
      }
    } else {
      const response = await createPersonalActivity(routineId);

      const newActivity = response?.data || response;
      const newActivityId = newActivity?.userActivityId;

      if (newActivityId) {
        setCompletedActivityIds(prev => {
          const newPersonalMap = new Map(prev.personal);
          newPersonalMap.set(routineId, newActivityId); // 맵에 (루틴 ID, 새 활동 ID) 추가
          const newState = { ...prev, personal: newPersonalMap };
          
          // 로컬 스토리지에 백업
          saveCompletedRoutinesToLocal(newPersonalMap, prev.group);
          
          return newState;
        });
      } else {
         console.error("활동 생성 응답에서 ID를 받지 못했습니다:", response);
         await fetchUserActivities();
      }
      // 완료 횟수 1 증가
      const newRoutineCount = routineCompletionCount + 1;
      setRoutineCompletionCount(newRoutineCount);
      localStorage.setItem('routineCompletionCount', String(newRoutineCount));

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

  } catch (error) {
    alert("루틴 상태 변경에 실패했습니다.");
    console.error("개인 루틴 완료/취소 처리 실패:", error);
    await fetchUserActivities();
  }
};

const handleGroupRoutineCompletion = (groupId: number, activityId: number) => {
    console.log("🏆 그룹 루틴 완료! 출석 및 통계 처리를 시작합니다.");

    setCompletedActivityIds(prev => {
      const newGroupMap = new Map(prev.group);
      newGroupMap.set(groupId, activityId); // (그룹 ID, 활동 ID)를 맵에 추가
      const newState = { ...prev, group: newGroupMap };
      
      // 로컬 스토리지에도 백업
      saveCompletedRoutinesToLocal(prev.personal, newGroupMap);
      
      return newState;
    });

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

      handleGroupMembersRefresh();
    console.log("✅ 그룹 멤버 데이터 새로고침 완료.");
    }

    // 3. 출석 모달 띄우기
    handleOpenAttendanceModal();

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
      category: recommendedRoutine.category,
      goal: recommendedRoutine.goal,
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

    const date = new Date();
    const currentMonthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const notificationSentKey = `reviewNotificationSent_${currentMonthYear}`;

    if (localStorage.getItem(notificationSentKey)) {
      console.log(`월간 회고 알림(${currentMonthYear})은 이미 생성되었습니다. 건너뜁니다.`);
      return; 
    }

    try {
      date.setMonth(date.getMonth() - 1);
      const lastMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const response = await apiFetch(`/api/reviews/monthly?userId=${UserInfo.id}&monthYear=${lastMonth}`, {
        method: 'POST',
      });

      console.log("서버의 월간 회고 응답:", response);

      if (response.success) {
        addNotification({
          message: `지난 달의 활동을 정리한 ${lastMonth} 월간 회고가 도착했어요.`,
          category: '회고',
          monthYear: lastMonth, 
        });

        localStorage.setItem(notificationSentKey, 'true');
        console.log(`월간 회고 알림(${currentMonthYear})을 생성하고, 생성 기록을 저장했습니다.`);
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
      setNotifications(prevNotifications => {
        const localNotifications = prevNotifications.filter(n => n.isLocal);
        return [...transformedNotifications, ...localNotifications];
      });

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
      // (로컬 알림도 네비게이션이 필요하다면 여기에 로직 추가)
    } else {
      // 2. 서버에 '읽음' 상태 전송 (isLocal이 아닌 경우)
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
    }
    
    if (notification.category === '회고' && UserInfo?.id) {
      try {
        // --- '회고' API 호출 TRY 블록 ---
        const response = await getMonthlyReview(UserInfo.id as number, notification.monthYear);

        if (response.success && response.data) {
          // 성공 시 모달 상태 설정
          setReviewModalContent({
            content: response.data.messageContent, // API 응답의 실제 회고 내용
            monthYear: response.data.monthYear,
          });
          // 모달 열기
          setReviewModalOpen(true);
        } else {
          // API 호출은 성공했으나, 응답 데이터가 실패일 경우
          alert("회고 내용을 불러오는 데 실패했습니다: " + response.message);
        }
      } catch (error) { 
        // --- '회고' API 호출 CATCH 블록 ---
        console.error("월간 회고 조회 API 호출 실패:", error);
        alert("회고 내용을 불러오는 중 오류가 발생했습니다.");
      }
    } 
    else if (notification.category === '그룹' && notification.relatedId) {
      // '그룹' 알림 클릭 시
      const groupToNav = groups.find(g => g.groupId === notification.relatedId);
      
      if (groupToNav) {
        // 그룹 상세 화면으로 이동
        navigateTo('group-detail', groupToNav);
      } else {
        // 일치하는 그룹을 못찾으면 그냥 그룹 탭으로 이동
        console.warn(`알림 관련 그룹(ID: ${notification.relatedId})을 찾을 수 없습니다.`);
        navigateTo('group');
      }
    } 
    else if (notification.category === '홈') {
      // '홈' (개인 루틴) 알림 클릭 시
      // 루틴 탭으로 이동
      navigateTo('routine');
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
  const routineDataRef = useRef({
    personalRoutines,
    myGroups,
    groupRoutineOverrides,
    getGroupRoutinesWithOverrides,
    addNotification,
    remindersSentToday,
    remindersSent0minToday,
  });

  useEffect(() => {
    routineDataRef.current = {
      personalRoutines,
      myGroups,
      groupRoutineOverrides,
      getGroupRoutinesWithOverrides,
      addNotification,
      remindersSentToday,
      remindersSent0minToday,
    };
  }, [
    personalRoutines,
    myGroups,
    groupRoutineOverrides,
    addNotification,
    remindersSentToday,
    remindersSent0minToday,
  ]);

  // 루틴 알림 타이머 (컴포넌트가 마운트될 때 딱 한 번만 실행됩니다)
  useEffect(() => {
    const timer = setInterval(() => {
      const {
        personalRoutines,
        getGroupRoutinesWithOverrides,
        addNotification,
        remindersSentToday,
        remindersSent0minToday,
      } = routineDataRef.current;
      
      const now = new Date();
      const allRoutines = [...personalRoutines, ...getGroupRoutinesWithOverrides()];

      allRoutines.forEach(routine => {
        if (routine.reminder && routine.time) {
          const [hours, minutes] = routine.time.split(':').map(Number);
          const routineTime = new Date();
          routineTime.setHours(hours, minutes, 0, 0);
          const diffInMinutes = (routineTime.getTime() - now.getTime()) / 1000 / 60;
          
          if (diffInMinutes <= 5 && diffInMinutes > 4 && !remindersSentToday[routine.id]) {
            addNotification({
              message: `'${routine.name}' 시작 5분 전입니다.`,
              category: '홈',
              icon: <Clock className="h-4 w-4 text-primary" />,
            });
            setRemindersSentToday(prev => ({ ...prev, [routine.id]: true }));
          }

          if (diffInMinutes <= 0 && diffInMinutes > -1 && !remindersSent0minToday[routine.id]) {
            addNotification({
              message: `'${routine.name}'을(를) 시작할 시간입니다!`,
              category: '홈',
              icon: <Clock className="h-4 w-4 text-primary" />,
            });
            setRemindersSent0minToday(prev => ({ ...prev, [routine.id]: true }));
          }
        }
      });
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, []); 

  useEffect(() => {
    if (isLoggedIn && UserInfo) {
      notificationService.connect({
        onOpen: () => {
          console.log("✅ SSE 연결이 성공적으로 수립되었습니다. (from App.tsx)");
        },
        onNotification: (apiNotif: NotificationApiResponse) => { // 햄의 interface에 맞게 타입 지정
          console.log("🔔 SSE 'notification' 이벤트 수신:", apiNotif);
          const newNotification = transformNotification(apiNotif);
          setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
        },
        onError: (error: any) => {
          console.error("SSE 연결 오류 발생:", error);
          if (error.status === 401 || error.status === 403) {
            console.error("SSE 인증 실패. 연결이 종료되었습니다.");
          }
        }
      });

    } else {
      notificationService.disconnect();
    }
    return () => {
      notificationService.disconnect();
    };
  }, [isLoggedIn, UserInfo]);

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

  
const [chatHistories, setChatHistories] = useState<Record<number, Message[]>>({});

// 메시지를 업데이트하는 함수
const handleUpdateMessages = (roomId: number, newMessages: Message[]) => {
  setChatHistories(prev => ({
    ...prev,
    [roomId]: newMessages,
  }));
};
  


const handleDeleteGroupSuccess = () => {
 
  fetchGroupData();
  setNavigationStack([]);
  //navigateBack();
  setActiveTab("group");
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
  if (!isLoggedIn || !UserInfo) {
    console.log("fetchUserTotalScore: Canceled (no login or UserInfo)");
    return;
  }
  
  setLoadingUserTotalScore(true);
  
  try {
    // 1. RankingScreen처럼 모든 페이지의 랭킹 데이터를 가져옵니다.
    let allRankings: IPersonalRankingData[] = [];
    let page = 0;
    let hasMore = true;
    const pageSize = 50; // 랭킹 스크린과 동일하게 설정

    while (hasMore) {
      // 2. getPersonalRankings를 호출합니다. (userId는 undefined)
      const response = await getPersonalRankings(undefined, undefined, page, pageSize);
      
      // 3. App.tsx에 정의된 PaginatedPersonalRankingResponse 타입으로 캐스팅합니다.
      const paginatedResponse = response as any as PaginatedPersonalRankingResponse;

      if (paginatedResponse && paginatedResponse.data && paginatedResponse.data.content) {
        // `paginatedResponse`를 사용하도록 수정
        allRankings = [...allRankings, ...paginatedResponse.data.content];
        
        // `paginatedResponse`를 사용하도록 수정
        if (paginatedResponse.data.last) { 
          hasMore = false; 
        } else {
          page++; 
        }
      } else {
        hasMore = false; 
      }
    }
    
    // 4. 모든 데이터를 가져온 후, 내 ID로 필터링하고 합산합니다.
    const myTotalScore = allRankings
      .filter(entry => entry.userId === UserInfo.id) 
      .reduce((sum, entry) => sum + entry.totalScore, 0); 
    
    setUserTotalScore(myTotalScore);
    console.log("이번 달 개인 점수 (전체 랭킹 합산):", myTotalScore);
    
  } catch (error) {
    console.error("월별 사용자 점수 데이터를 불러오는데 실패했습니다.", error);
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
        isLoggedIn;
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

    const nextDarkModeState = !UserInfo.isDarkMode;
    setUserInfo({ ...UserInfo, isDarkMode: nextDarkModeState });

    try {
      await toggleDarkModeAPI(nextDarkModeState);
      await fetchUserInfo();

    } catch (error) {
      console.error("다크 모드 변경 실패:", error);
      setUserInfo({ ...UserInfo, isDarkMode: !nextDarkModeState });
      await fetchUserInfo();
      alert("다크 모드 설정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleToggleAlarm = async () => {
    if (!UserInfo) return;

    const nextAlarmState = !UserInfo.isAlarmOn;
    setUserInfo({ ...UserInfo, isAlarmOn: nextAlarmState });

    try {
      await toggleAlarmAPI(nextAlarmState);
      
      await fetchUserInfo();

    } catch (error) {
      console.error("알림 설정 변경 실패:", error);
      setUserInfo({ ...UserInfo, isAlarmOn: !nextAlarmState });
      
      await fetchUserInfo();
      alert("알림 설정에 실패했습니다. 다시 시도해주세요.");
    }
  };

   const handleLeaveGroup = (groupId: number) => {
    
    // 그룹을 떠난 후 그룹 목록 화면으로 바로 이동하도록 합니다.
    //setNavigationStack([]);
    //setActiveTab("group");
    // setMyGroups(prevGroups => prevGroups.filter(group => group.groupId !== groupId));
    fetchGroupData();
    // 2. 채팅방을 네비게이션 스택에서 완전히 제거하고 그룹 화면으로 돌아가기
    // 네비게이션 스택을 빈 배열로 초기화하고, 'group' 탭을 활성화
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
              //onLeaveGroup={handleLeaveGroup}
               onLeaveGroup={() => handleLeaveGroup(groupId)}
              userInfo={UserInfo}
              onDataRefresh={handleDataRefresh}
              onGroupRoutineComplete={handleGroupRoutineCompletion}
              onUpdateMessages={handleUpdateMessages}
              onDeleteGroupSuccess={handleDeleteGroupSuccess}
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
              myid={myId ?? 0}
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
                  userInfo={UserInfo}
                />
      case "ranking":{
        console.log('그룹 목록 (랭킹):', groups);
        console.log('개인 랭킹 데이터 (랭킹):', personalRankingData);
        return <RankingScreen 
                  groups={myGroups}
                  //personalRankingData={personalRankingData}
                  groupRankingData={groupRankingData} 
                  userTotalScore={userTotalScore} 
                  loadingGroupRanking={loadingGroupRanking} 
                  loadingUserTotalScore={loadingUserTotalScore}
                  myid={myId}
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

    try {
    const hasAttendedToday = await checkAttendance(todayString);

    if (hasAttendedToday) {
    await fetchTotalAttendance();

    const newDates = [...attendanceDates];
    if (!newDates.includes(todayString)) {
      newDates.push(todayString);
      localStorage.setItem('attendanceDates', JSON.stringify(newDates));
      setAttendanceDates(newDates);
    }
    let consecutiveCount = 0;
    const dateChecker = new Date(); 

    while (newDates.includes(getLocalDateString(dateChecker))) {
      consecutiveCount++;
      dateChecker.setDate(dateChecker.getDate() - 1);
    }
    const currentMaxStreak = UserInfo?.maxStreakDays ?? 0;
    if (consecutiveCount > currentMaxStreak && UserInfo) {
      const newMaxStreak = consecutiveCount;
      setUserInfo({ ...UserInfo, maxStreakDays: consecutiveCount });
      
      localStorage.setItem('maxStreakDays', String(newMaxStreak));
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
                <div className="flex-1 overflow-auto " ref={scrollContainerRef}> 
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
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
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