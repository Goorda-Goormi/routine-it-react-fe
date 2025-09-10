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
  getUserActivitiesByDay
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

const transformPersonalRoutine = (pr: PersonalRoutineResponse): Routine => {
  return {
    id: pr.routineId,
    name: pr.routineName,
    description: pr.description,
    time: pr.startTime,
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
  const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];
  return daysOfWeek.map(day => frequency.includes(day) ? '1' : '0').join('');
};

const convertAuthDaysToFrequency = (authDays: string): string[] => {
  const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];
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
    ? new Date(apiNotif.createdAt).toLocaleString('ko-KR', dateOptions) // <-- 옵션 적용
    : '시간 정보 없음';

  return {
    id: apiNotif.id,
    message: apiNotif.content,
    category: category,
    date: dateString, // 수정된 날짜 문자열을 사용합니다.
    read: apiNotif.read,
    icon: icon,
    isLocal: false, // 서버에서 온 알림이므로 false
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
    personal: new Set<number>(),
    group: new Set<number>(),
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
  
  const [streakDays, setStreakDays] = useState(() => {
    const savedStreak = localStorage.getItem('streakDays');
    return savedStreak ? Number(savedStreak) : 0;
  });

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
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const isNewUserParam = params.get('isNewUser');
    //const storedToken = localStorage.getItem('accessToken');

    if (accessToken) {
      // accessToken만 localStorage에 저장합니다.
      localStorage.setItem('accessToken', accessToken);
      
      // refreshToken 관련 로직은 모두 제거합니다.
      
      console.log('✅ OAuth login successful, access token saved');
      setIsLoggedIn(true);
      fetchUserInfo();
      fetchGroupData();
        
      if (isNewUserParam === 'true') {
        setIsNewUser(true);
        setIsLoginModalOpen(true);
      }
      // URL에서 토큰 정보를 제거합니다.
      window.history.replaceState({}, document.title, window.location.pathname);
      
    } else {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        setIsLoggedIn(true);
        fetchUserInfo();
        fetchGroupData();
      }
    }
  }, []);

   //groups 상태가 변경될 때마다 groupRoutines 업데이트
  //  useEffect(() => {
  //   const newGroupRoutines: Routine[] = groups.flatMap(group => 
  //     group.routines?.map(routine => ({ ...routine, isGroupRoutine: true })) || []
  //   );
  //   setGroupRoutines(newGroupRoutines);
  // }, [groups]);

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
  const fetchMembers = async () => {
    // 현재 화면이 group-detail이고, groupId가 존재하는지 확인
    if (currentScreen && currentScreen.screen === "group-detail" && currentScreen.params.groupId) {
      const groupId = currentScreen.params.groupId;
      try {
        const members = await getGroupMembers(groupId);
        console.log(`그룹 ID ${groupId}의 멤버:`, members); // ✨ 콘솔 출력 추가
        
        // 상태에 멤버 정보 저장
        setGroupMembers(prevMembers => ({
          ...prevMembers,
          [groupId]: members,
        }));
      } catch (error) {
        console.error("그룹 멤버 조회 실패:", error);
      }
    }
  };

  fetchMembers();
}, [navigationStack, isJoined]);
  

  //5. 사용자/계정 관리 =============================================================

  const handleKakaoLogin = () => {
    startKakaoLogin();
  };


  const handleLogin = (isNew: boolean) => {
    setIsNewUser(isNew);
    if (isNew) {
      setIsLoginModalOpen(true); // 기존 로그인 모달 닫기
      // NicknameModal을 띄우는 로직을 여기에 추가
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
      const personalIds = new Set<number>();
      const groupIds = new Set<number>();

      if (Array.isArray(activities)) {
      activities.forEach((activity: any) => {
        if (activity.activityType === 'PERSONAL_ROUTINE_COMPLETE' && activity.personalRoutineId) {
          personalIds.add(activity.personalRoutineId);
        } else if (activity.activityType === 'GROUP_AUTH_COMPLETE' && activity.groupId) {
          groupIds.add(activity.groupId);
        }
      });
    }

      setCompletedActivityIds({ personal: personalIds, group: groupIds });
    } catch (error) {
      console.error("오늘의 활동 내역 조회 실패:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && UserInfo) {
      fetchUserActivities();
      fetchPersonalRoutines(); 
      fetchUserTotalScore();
    }
  }, [isLoggedIn, UserInfo]);

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
  };

  const fetchPersonalRoutines = async () => {
    if (!UserInfo) return;
    try {
      const routinesFromServer = await getPersonalRoutinesByUser(UserInfo.id as number);
      const transformedRoutines = routinesFromServer.map(pr => {
        const routine = transformPersonalRoutine(pr);
        routine.completed = completedActivityIds.personal.has(routine.id);
        return routine;
      })
      setPersonalRoutines(transformedRoutines);
    } catch (error) {
      console.error("개인 루틴 목록 로딩 실패:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && UserInfo) {
      fetchPersonalRoutines();
    }
  }, [isLoggedIn, UserInfo, completedActivityIds]);

  const getGroupRoutinesWithOverrides = (): Routine[] => {
  return myGroups.map(group => {
      const routine = transformGroupToRoutine(group);
      const override = groupRoutineOverrides[group.groupId];
  
      routine.completed = completedActivityIds.group.has(group.groupId);

    return override ? { ...routine, ...override } : routine;
  });
};

const handleToggleRoutinePublic = async (routineId: number) => {
    try {
      // API를 호출하여 서버의 상태를 변경합니다.
      const updatedRoutineFromServer = await toggleRoutinePublic(routineId);
      const transformedRoutine = transformPersonalRoutine(updatedRoutineFromServer);

      // UI 상태를 즉시 업데이트합니다. (전체 목록을 다시 불러오지 않아 효율적입니다)
      setPersonalRoutines(prevRoutines =>
        prevRoutines.map(r => (r.id === routineId ? transformedRoutine : r))
      );

      setNavigationStack(prevStack =>
        prevStack.map(navItem =>
          navItem.screen === 'routine-detail' && navItem.params.id === routineId
            ? { ...navItem, params: transformedRoutine }
            : navItem
        )
      );
    } catch (error) {
      console.error("루틴 공개 여부 변경 실패:", error);
      alert("설정 변경에 실패했습니다.");
    }
  };

  const handleToggleRoutineAlarm = async (routineId: number) => {
    try {
      const updatedRoutineFromServer = await toggleRoutineAlarm(routineId);
      const transformedRoutine = transformPersonalRoutine(updatedRoutineFromServer);
      
      setPersonalRoutines(prevRoutines =>
        prevRoutines.map(r => (r.id === routineId ? transformedRoutine : r))
      );

      setNavigationStack(prevStack =>
        prevStack.map(navItem =>
          navItem.screen === 'routine-detail' && navItem.params.id === routineId
            ? { ...navItem, params: transformedRoutine }
            : navItem
        )
      );
    } catch (error) {
      console.error("루틴 알림 설정 변경 실패:", error);
      alert("설정 변경에 실패했습니다.");
    }
  };

  const handleCompletePersonalRoutine = async (routineId: number) => {
    try {
    // 1. 서버에 '개인 루틴 완료' 활동 생성 요청
    await createPersonalActivity(routineId);

    // 2. 성공 시, 최신 활동 내역을 다시 불러와 화면에 반영
    await fetchUserActivities();

    // 3. ✨ 여기에 루틴 완료 횟수 및 배지 획득 로직을 추가합니다. ✨
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

  } catch (error) {
    alert("루틴 완료 처리에 실패했습니다.");
    console.error("개인 루틴 완료 처리 실패:", error);
  }
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
      
      alert(`'${recommendedRoutine.name}' 루틴이 추가되었습니다.`);

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

  // 루틴 인증 메시지를 추가하는 함수에 groupId 추가
//   const handleAddAuthMessage = (
//   groupId: number, 
//   data: { description: string; image: File | null; isPublic: boolean }, 
//   nickname: string,
//   userId: string | number, // userId 추가
//   routineId: number // routineId 추가
// ) => {
//   const newAuthMessage: AuthMessage = {
//     id: Date.now(),
//     nickname: nickname,
//     userId: userId, // userId 저장
//     message: data.description,
//     imageUrl: data.image ? URL.createObjectURL(data.image) : null,
//     routineId: routineId, // routineId 저장
//   };
  
//   setPendingAuthMessages(prevMessages => ({
//     ...prevMessages,
//     [groupId]: [...(prevMessages[groupId] || []), newAuthMessage]
//   }));
  
//   console.log('인증 데이터 제출:', data);
//   alert('인증이 제출되었습니다!');
// };

  // 루틴 인증을 승인하는 함수에 groupId 추가
  // const handleApproveAuthMessage = (groupId: number, authId: number) => {
  //   // 1. 승인할 인증 메시지 찾기
  //   const messageToApprove = pendingAuthMessages[groupId]?.find(msg => msg.id === authId);
  //   if (!messageToApprove) return;

  //   // 인증을 요청한 사용자에게 보낼 알림 생성
  //   addNotification({
  //     message: `그룹 루틴 인증이 승인되었습니다. (+20점)`,
  //     category: '그룹',
  //     relatedId: groupId,
  //   });  

  //   setPendingAuthMessages(prevMessages => ({
  //     ...prevMessages,
  //     [groupId]: (prevMessages[groupId] || []).filter(msg => msg.id !== authId)
  //   }));

  //모든 루틴 목록에서 승인된 루틴 정보를 찾습니다.
  // const allRoutines = [...personalRoutines, ...groupRoutines];
  // const approvedRoutine = allRoutines.find(r => r.id === messageToApprove.routineId);

  // if (approvedRoutine && UserInfo) {
  //     const score = calculateScoreByDifficulty(approvedRoutine.difficulty);
  //     const memberId = Number(messageToApprove.userId); // 인증을 올린 멤버의 ID

  //     // 4. 랭킹 점수 업데이트 API 호출 (groupId 포함)
  //     updateRankingScore(memberId, score, groupId)
  //       .then(response => {
  //         console.log(`그룹 루틴 인증 (${messageToApprove.nickname}님): ${score}점 획득 성공`, response);
          
  //         // 만약 내 인증이 승인된 것이라면, 화면의 총점을 즉시 업데이트합니다.
  //         if (memberId === UserInfo.id) {
  //           fetchUserTotalScore();
  //         }
  //       })
  //       .catch(error => {
  //         console.error("그룹 루틴 점수 업데이트 실패:", error);
  //       });
  //   }

//   // 2. 그룹 상태를 업데이트하는 로직
//   setGroups(prevGroups => 
//     prevGroups.map(group => {
//       // 해당 그룹인지 확인
//       if (group.groupId === groupId) {
//         // 그룹 내에서 해당 루틴 찾기
//         const updatedRoutines = group.routines?.map(routine => {
//           if (routine.id === messageToApprove.routineId) {
//             return {
//               ...routine,
//               // 루틴 완료 상태 업데이트 (예: isCertified를 true로 설정)
//               completed: true, // 또는 별도의 인증 상태 필드 사용
//             };
//           }
//           return routine;
//         });

//         // 멤버 상태 업데이트 (예: '인증' 뱃지 표시)
//         const updatedMembers = group.recentMembers?.map(member => {
//           if (member.id === messageToApprove.userId) {
//             return {
//               ...member,
//               isCertified: true, // 인증 상태를 나타내는 필드 추가
//             };
//           }
//           return member;
//         });

//         return { 
//           ...group, 
//           routines: updatedRoutines,
//           recentMembers: updatedMembers 
//         };
//       }
//       return group;
//     })
//   );

//   // pendingAuthMessages 상태에서 승인된 메시지 제거
//   setPendingAuthMessages(prevMessages => ({
//     ...prevMessages,
//     [groupId]: (prevMessages[groupId] || []).filter(msg => msg.id !== authId)
//   }));
  
//   console.log(`${authId}번 인증을 승인했습니다.`);
//   alert(`${authId}번 인증이 승인되었습니다.`);
// };

  // 루틴 인증을 거절하는 함수에 groupId 추가
  // const handleRejectAuthMessage = (groupId: number, authId: number) => {
  //   const messageToReject = pendingAuthMessages[groupId]?.find(msg => msg.id === authId);
  //   if (!messageToReject) {
  //     console.error("거절할 인증 메시지를 찾을 수 없습니다.");
  //     return;
  //   }

  //   addNotification({
  //     message: `아쉽지만, '${messageToReject.message}' 루틴 인증이 반려되었습니다.`,
  //     category: '그룹',
  //     relatedId: groupId
  //   });


  //   setPendingAuthMessages(prevMessages => ({
  //     ...prevMessages,
  //     [groupId]: (prevMessages[groupId] || []).filter(msg => msg.id !== authId)
  //   }));
  //   console.log(`${authId}번 인증을 거절했습니다.`);
  //   alert(`${authId}번 인증이 거절되었습니다.`);
  // };

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

  //const currentScreen =
    //navigationStack.length > 0
      //? navigationStack[navigationStack.length - 1]
      //: null;

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
        //const groupId = currentScreen.params.groupId;
        //const members = groupMembers[groupId] || [];
        //const myId = UserInfo?.id; 
        //const isJoined = myGroups.some(joinedGroup => joinedGroup.groupId === groupId);
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
            // pendingAuthMessages={pendingAuthMessages}
            // onAddAuthMessage={handleAddAuthMessage}
            // onApproveAuthMessage={handleApproveAuthMessage}
            // onRejectAuthMessage={handleRejectAuthMessage}
            currentUser={UserInfo} 
            groupMembers={members}
            onDeleteGroupSuccess={handleDeleteGroupSuccess}
            myid={myId ?? 0}
            onGroupJoined={fetchGroupData}
            isJoined={isJoined}
           
          />
        );
      } 
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
               //onAddAuthMessage={handleAddAuthMessage}
               //groupMembers={groupMembers}
                onLeaveGroup={handleLeaveGroup}
                userInfo={UserInfo}
                onDataRefresh={handleDataRefresh}
                //streakDays={streakDays}
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
            />
          );
        case "help":
          return <HelpScreen onBack={navigateBack} />;
        case "user-home":
          return (
            <UserHomeScreen
              user={currentScreen.params as { id: number; nickname: string }}
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
            onCompletePersonalRoutine={handleCompletePersonalRoutine}
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
          onCompletePersonalRoutine={handleCompletePersonalRoutine}
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
                  groupRankingData={groupRankingData} // props로 전달
                  userTotalScore={userTotalScore} // props로 전달
                  loadingGroupRanking={loadingGroupRanking} // props로 전달
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
            onCompletePersonalRoutine={handleCompletePersonalRoutine}
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

  const handleCloseAttendanceModal = () => {
    setAttendanceModalOpen(false);
    const todayString = new Date().toISOString().split('T')[0];

    // --- 1. 누적 출석일 (streakDays) 업데이트 ---
    // 이제 streakDays는 초기화되지 않고 항상 1씩 증가합니다.
    const newCumulativeStreak = streakDays + 1;
    setStreakDays(newCumulativeStreak);
    localStorage.setItem('streakDays', String(newCumulativeStreak));

    // --- 2. 출석 날짜 배열 업데이트 ---
    const newDates = [...attendanceDates];
    if (!newDates.includes(todayString)) {
      newDates.push(todayString);
      localStorage.setItem('attendanceDates', JSON.stringify(newDates));
      setAttendanceDates(newDates);
    }
    
    // --- 3. 현재 '연속 출석일' 계산 및 '최고 기록' 업데이트 ---
    let consecutiveCount = 0;
    const dateChecker = new Date(); // 오늘부터 시작

    // 출석 기록에 날짜가 있는지 확인하며 하루씩 뒤로 갑니다.
    while (newDates.includes(dateChecker.toISOString().split('T')[0])) {
      consecutiveCount++;
      dateChecker.setDate(dateChecker.getDate() - 1); // 어제 날짜로 변경
    }

    const currentMaxStreak = UserInfo?.maxStreakDays ?? 0;
    if (consecutiveCount > currentMaxStreak && UserInfo) {
      const newMaxStreak = consecutiveCount;
      setUserInfo({ ...UserInfo, maxStreakDays: consecutiveCount });
      
      localStorage.setItem('maxStreakDays', String(newMaxStreak));
    }

    // --- 4. 기존 출석 처리 및 다음 모달 호출 로직 (그대로 유지) ---
    const newAttendanceCount = attendanceCount + 1;
    setAttendanceCount(newAttendanceCount);
    localStorage.setItem('attendanceCount', String(newAttendanceCount));

    handleNextModalSequence(consecutiveCount, newAttendanceCount);
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
    
      <div className="min-w-[360px] w-[450px] min-h-[704px] h-[800px] bg-background flex flex-col overflow-hidden rounded-lg shadow-2xl border border-border/50">
        {!isLoggedIn ? (
          <div className="w-full h-full">{renderScreen()}</div>
        ) : (
          <>
            {!currentScreen && UserInfo && (
              <TopNavBar
                onSearch={handleSearch}
                onNotificationClick={handleNotificationClick}
                onProfileMenuClick={handleProfileMenuClick}
                userInfo={UserInfo}
                notifications={notifications}
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
        onComplete={handleNicknameSetupComplete}
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