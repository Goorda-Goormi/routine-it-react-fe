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
import type { AuthMessage,Routine,Group,Member,PendingAuthMap,UserProfile } from "./interfaces";
import { LoginModal } from './components/modules/LoginModal';
import { LoadingSpinner } from "./components/ui/loading-spinner";
import { startKakaoLogin, getUserInfo } from "./api/login"; 

interface NavigationState {
  screen: string;
  params?: any;
}

type BadgeType = '첫걸음' | '7일 연속' | '루틴 마스터' | '월간 챔피언';
//type PendingAuthMap = { [groupId: number]: AuthMessage[] };
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [pendingAuthMessages, setPendingAuthMessages] = useState<PendingAuthMap>({});
  const [navigationStack, setNavigationStack] = useState<NavigationState[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "true";
    }
    return false;
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

  const [routineCompletionCount, setRoutineCompletionCount] = useState<number>(() => {
    return Number(localStorage.getItem('routineCompletionCount')) || 0;
  });
  const [attendanceCount, setAttendanceCount] = useState(() => {
    const savedCount = localStorage.getItem('attendanceCount');
    return savedCount ? Number(savedCount) : 0;
  });
  const [earnedBadges, setEarnedBadges] = useState<BadgeType[]>(() => {
    const storedBadges = localStorage.getItem('earnedBadges');
    return storedBadges ? JSON.parse(storedBadges) : [];
  });
  
  const [streakDays, setStreakDays] = useState(() => {
    const savedStreak = localStorage.getItem('streakDays');
    return savedStreak ? Number(savedStreak) : 0;
  });

  const [UserInfo, setUserInfo] = useState<UserProfile | null>(null); // 초기 상태를 null로 변경
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const isNewUserParam = params.get('isNewUser');

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      setIsLoggedIn(true);
      fetchUserInfo(); // 로그인 성공 시 사용자 정보 즉시 불러오기
        
      if (isNewUserParam === 'true') {
        setIsNewUser(true);
        setIsLoginModalOpen(true);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
      
    } else {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        setIsLoggedIn(true);
        fetchUserInfo(); // 로컬 스토리지에 토큰이 있을 경우 사용자 정보 불러오기
      }
    }
  }, []);

  const handleKakaoLogin = () => {
    startKakaoLogin();
  };

  // 루틴 인증 메시지를 추가하는 함수에 groupId 추가
  const handleAddAuthMessage = (
  groupId: number, 
  data: { description: string; image: File | null; isPublic: boolean }, 
  nickname: string,
  userId: string | number, // userId 추가
  routineId: number // routineId 추가
) => {
  const newAuthMessage: AuthMessage = {
    id: Date.now(),
    nickname: nickname,
    userId: userId, // userId 저장
    message: data.description,
    imageUrl: data.image ? URL.createObjectURL(data.image) : null,
    routineId: routineId, // routineId 저장
  };
  
  setPendingAuthMessages(prevMessages => ({
    ...prevMessages,
    [groupId]: [...(prevMessages[groupId] || []), newAuthMessage]
  }));
  
  console.log('인증 데이터 제출:', data);
  alert('인증이 제출되었습니다!');
};

  // 루틴 인증을 승인하는 함수에 groupId 추가
  const handleApproveAuthMessage = (groupId: number, id: number) => {
  // 1. 승인할 인증 메시지 찾기
  const messageToApprove = pendingAuthMessages[groupId]?.find(msg => msg.id === id);

  if (!messageToApprove) {
    console.log("승인할 인증 메시지를 찾을 수 없습니다.");
    return;
  }
  
  // 2. 그룹 상태를 업데이트하는 로직
  setGroups(prevGroups => 
    prevGroups.map(group => {
      // 해당 그룹인지 확인
      if (group.id === groupId) {
        // 그룹 내에서 해당 루틴 찾기
        const updatedRoutines = group.routines?.map(routine => {
          if (routine.id === messageToApprove.routineId) {
            return {
              ...routine,
              // 루틴 완료 상태 업데이트 (예: isCertified를 true로 설정)
              completed: true, // 또는 별도의 인증 상태 필드 사용
            };
          }
          return routine;
        });

        // 멤버 상태 업데이트 (예: '인증' 뱃지 표시)
        const updatedMembers = group.recentMembers?.map(member => {
          if (member.id === messageToApprove.userId) {
            return {
              ...member,
              isCertified: true, // 인증 상태를 나타내는 필드 추가
            };
          }
          return member;
        });

        return { 
          ...group, 
          routines: updatedRoutines,
          recentMembers: updatedMembers 
        };
      }
      return group;
    })
  );

  // 3. pendingAuthMessages 상태에서 승인된 메시지 제거
  setPendingAuthMessages(prevMessages => ({
    ...prevMessages,
    [groupId]: (prevMessages[groupId] || []).filter(msg => msg.id !== id)
  }));
  
  console.log(`${id}번 인증을 승인했습니다.`);
  alert(`${id}번 인증이 승인되었습니다.`);
};

  // 루틴 인증을 거절하는 함수에 groupId 추가
  const handleRejectAuthMessage = (groupId: number, id: number) => {
    setPendingAuthMessages(prevMessages => ({
      ...prevMessages,
      [groupId]: (prevMessages[groupId] || []).filter(msg => msg.id !== id)
    }));
    console.log(`${id}번 인증을 거절했습니다.`);
    alert(`${id}번 인증이 거절되었습니다.`);
  };

  const [personalRoutines, setPersonalRoutines] = useState<Routine[]>([
    {
      id: 1,
      name: '아침 식단 챙기기',
      description: '건강한 아침 식사를 통해 하루를 시작해보세요',
      time: '08:00',
      frequency: ["월", "화", "수", "목", "금", "토", "일"],
      reminder: true,
      goal: "30",
      category: "건강",
      completed: false,
      streak: 5,
      difficulty: "쉬움",
    },
    {
      id: 2,
      name: '오후 산책',
      description: '점심 후 15분 산책으로 소화를 돕고 기분 전환하기',
      time: '13:00',
      frequency: ["월", "화", "수", "목", "금"],
      reminder: true,
      goal: "14",
      category: "운동",
      completed: false,
      streak: 10,
      difficulty: "보통",
    },
    {
      id: 3,
      name: '자기 전 책 읽기',
      description: '자기 전 30분 책 읽기로 마음의 양식 쌓기',
      time: '21:00',
      frequency: ["월", "수", "금", "일"],
      reminder: true,
      goal: "60",
      category: "학습",
      completed: false,
      streak: 20,
      difficulty: "어려움",
    },
  ]);

  const [groups, setGroups] = useState<Group[]>([
    // GroupScreen에서 옮겨온 데이터
    {
      id: 101,
      name: '아침 기상 챌린지',
      description: '일찍 일어나서 하루를 길게 사용하기',
      members: 5,
      type: '의무참여',
      time: '05:30',
      category: 'lifestyle',
      owner: '임시소유자',
      isJoined: false,
      isMandatory: true,
    },
    {
      id: 102,
      name: '매일 1시간 운동',
      description: '집에서 꾸준히 운동하기',
      members: 8,
      type: '자유참여',
      time: '19:00',
      category: 'exercise',
      owner: '임시소유자',
      isJoined: true,
      isMandatory: false,
    },
    {
    id: 1,
    name: '아침 운동 챌린지',
    description: '매일 아침 운동하고 인증하기',
    members: 12,
    type: '의무참여',
    progress: 80,
    isOwner: true,
    isJoined: false,
    time: '06:00-09:00',
    category: 'exercise',
    isMandatory: true,
    recentMembers: [
        { id: 1, nickname: '민수민수', profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
        { id: 2, nickname: '지영쓰', profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b95fcebf?w=40&h=40&fit=crop&crop=face' },
        { id: 3, nickname: '철수박', profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' }
    ],
    routines: [ // Example group routine
      {
        id: 1001,
        name: '아침 운동 인증',
        description: '6시-9시 사이에 운동 인증샷 올리기',
        time: '06:00',
        frequency: ["월", "화", "수", "목", "금", "토", "일"],
        reminder: true,
        goal: "30",
        category: "exercise",
        completed: false,
        streak: 12,
        difficulty: "보통",
        isGroupRoutine: true,
      }
    ]
  },
    {
        id: 2,
        name: '독서 모임',
        description: '책 읽고 후기 공유하기',
        members: 8,
        type: '자유참여',
        progress: 65,
        isOwner: false,
        isJoined: true,
        time: '언제든',
        category: 'study',
        recentMembers: [
            { id: 4,  nickname: '수현', profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
            { id: 5,  nickname: '영호호호', profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face' }
        ]
    }
  ]);

  const [groupRoutines, setGroupRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    const newGroupRoutines: Routine[] = groups.flatMap(group => 
      group.routines?.map(routine => ({ ...routine, isGroupRoutine: true })) || []
    );
    setGroupRoutines(newGroupRoutines);
  }, [groups]);

  
  const handleJoinGroup = (groupId: number) => {
  setGroups(prevGroups =>
    prevGroups.map(group =>
      group.id === groupId ? { ...group, isJoined: true } : group
    )
  );
};

  
  const [recommendedRoutines, setRecommendedRoutines] = useState([
    {
      id: 7,
      name: '스트레칭',
      description: '매일 10분 스트레칭으로 몸의 긴장을 풀어보세요',
      time: '08:00',
      frequency: ['월', '화', '수', '목', '금', '토', '일'],
      reminder: true,
      goal: '30',
      category: '운동',
      completed: false,
      streak: 0,
      difficulty: '쉬움',
      isGroupRoutine: false
    },
    {
      id: 8,
      name: '감사 일기',
      description: '하루에 감사한 일 3가지를 적어보세요',
      time: '08:00',
      frequency: ['월', '화', '수', '목', '금', '토', '일'],
      reminder: true,
      goal: '30',
      category: '기타',
      completed: false,
      streak: 0,
      difficulty: '쉬움',
      isGroupRoutine: false
    },
    {
      id: 9,
      name: '물 마시기',
      description: '하루 2L 물 마시기로 건강한 습관을 만들어보세요',
      time: '08:00',
      frequency: ['월', '화', '수', '목', '금', '토', '일'],
      reminder: true,
      goal: '30',
      category: '건강',
      completed: false,
      streak: 0,
      difficulty: '보통',
      isGroupRoutine: false
    },
    {
      id: 10,
      name: '단어 암기',
      description: '매일 새로운 영어 단어 10개를 학습하세요',
      time: '08:00',
      frequency: ['월', '화', '수', '목', '금', '토', '일'],
      reminder: true,
      goal: '30',
      category: '학습',
      completed: false,
      streak: 0,
      difficulty: '보통',
      isGroupRoutine: false
    },
    {
      id: 11,
      name: '5분 청소하기',
      description: '하루 5분만 투자해 내 주변자리를 정돈해보세요',
      time: '08:00',
      frequency: ['월', '화', '수', '목', '금', '토', '일'],
      reminder: true,
      goal: '30',
      category: '생활',
      completed: false,
      streak: 0,
      difficulty: '쉬움',
      isGroupRoutine: false
    }
  ]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", isDarkMode.toString());
  }, [isDarkMode]);

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

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
  };

  // 닉네임 설정 완료 후 호출될 함수
  const handleNicknameSetupComplete = async (nickname: string) => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('accessToken');

    if (!token) {
    console.error("인증 토큰이 없습니다.");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nickname: nickname })
    });

    if (!response.ok) {
      throw new Error('회원가입 실패');
    }

    const result = await response.json();
    const updatedUserInfo = result.data;

    // API 응답으로 받은 전체 사용자 정보로 상태 업데이트
    setUserInfo(updatedUserInfo);

    setIsLoggedIn(true);
    setIsNewUser(false);
    alert('회원가입이 완료되었습니다.');

  } catch (error) {
    console.error("회원가입 에러:", error);
    alert('회원가입에 실패했습니다.');
  }
};

  const handleLogout = async() => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const token = localStorage.getItem('accessToken');
  if (!token) {
    console.error("인증 토큰이 없어 로그아웃을 진행할 수 없습니다.");
    setIsLoggedIn(false); // 토큰이 없으므로 클라이언트 상태만 초기화
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('로그아웃 실패');
    }

    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 클라이언트 상태 초기화
    setIsLoggedIn(false);
    setActiveTab("home");
    setNavigationStack([]);
    
    alert('로그아웃 되었습니다.');

  } catch (error) {
    console.error("로그아웃 에러:", error);
    alert('로그아웃에 실패했습니다.');
  }
};

  const handleDeleteAccount = () => {
    const isConfirmed = window.confirm("계정 탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다. 정말로 탈퇴하시겠습니까?");
    if (isConfirmed) {
      // 실제 API 호출 로직은 여기에 추가
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
      setPendingAuthMessages({});
      setLastCompletionDate(null);
      setRoutineCompletionCount(0);
      setAttendanceCount(0);
      setEarnedBadges([]);
      setStreakDays(0);

      localStorage.clear();
      
      alert("계정이 성공적으로 탈퇴되었습니다.");
    }
  };

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

  const navigateTo = (screen: string, params?: any) => {
    const tabs = [
      "home",
      "routine",
      "group",
      "ranking",
      "mypage",
    ];
    if (tabs.includes(screen)) {
      setActiveTab(screen);
      setNavigationStack([]);
      return;
    }

    setNavigationStack([
      ...navigationStack,
      { screen, params },
    ]);
  };

  const navigateBack = () => {
    setNavigationStack(navigationStack.slice(0, -1));
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleAddRoutine = (newRoutineData: any) => {
    const newRoutine = {
      ...newRoutineData,
      id: Date.now(),
      completed: false,
      streak: 0,
       isGroupRoutine: false,
    };
    setPersonalRoutines(prev => [...prev, newRoutine]);
  };
  
  // 그룹을 추가하는 함수
 const handleAddGroup = (newGroupData: any) => {
  console.log('새로운 그룹 생성 시 :', newGroupData);
 setGroups((prev) => [newGroupData, ...prev]);
};



const handleUpdateGroup = (updatedGroup: Group) => {
  const isMandatory = updatedGroup.type === '의무참여';
  setGroups(prevGroups =>
    prevGroups.map(group =>
      group.id === updatedGroup.id 
      ? { 
        ...group, 
        ...updatedGroup, 
        isMandatory: isMandatory, 
      }
       : group
    )
  );

  
};


  const handleUpdateRoutine = (updatedRoutine: Routine) => {
    if (updatedRoutine.isGroupRoutine) {
      setGroups(prevGroups => 
            prevGroups.map(group => {
                if (group.routines && Array.isArray(group.routines)) {
                    const groupHasRoutine = group.routines.some(r => r.id === updatedRoutine.id);
                    if (groupHasRoutine) {
                        return {
                            ...group,
                            routines: group.routines.map(r => r.id === updatedRoutine.id ? updatedRoutine : r)
                        };
                    }
                }
                return group;
            })
        );
    } else {
      setPersonalRoutines(prevRoutines =>
        prevRoutines.map(routine =>
          routine.id === updatedRoutine.id ? updatedRoutine : routine
        )
      );
    }

    setNavigationStack(prevStack =>
      prevStack.map(navItem =>
        navItem.screen === 'routine-detail' && navItem.params.id === updatedRoutine.id
          ? { ...navItem, params: updatedRoutine }
          : navItem
      )
    );
  };

  const handleToggleCompletion = (routineId: number, isGroupRoutine?: boolean) => {
    let isCompleted = false;

    if (isGroupRoutine) {
    setGroups(prevGroups => {
      const updatedGroups = prevGroups.map(group => ({
        ...group,
        routines: group.routines?.map(routine => {
          if (routine.id === routineId) {
            // 루틴 완료 상태를 확인하여 변수에 저장
            isCompleted = !routine.completed;
            return { ...routine, completed: !routine.completed };
          }
          return routine;
        }),
      }));
      if (isCompleted) {
          // 루틴 완료 횟수 증가 및 localStorage 업데이트
          const newRoutineCount = routineCompletionCount + 1;
          setRoutineCompletionCount(newRoutineCount);
          localStorage.setItem('routineCompletionCount', String(newRoutineCount));

      }
      return updatedGroups;
    });
    } else {
    setPersonalRoutines(prev => {
      const updatedRoutines = prev.map(routine => {
        if (routine.id === routineId) {
          // 루틴 완료 상태를 확인하여 변수에 저장
          isCompleted = !routine.completed;
          return { ...routine, completed: !routine.completed };
        }
        return routine;
      });
      // 루틴 완료 시에만 상태를 업데이트하고, isCompleted를 true로 설정합니다.
      if (isCompleted) {
        // AttendanceModal을 띄우는 함수 호출
        handleOpenAttendanceModal();

        // 루틴 완료 횟수 증가 및 localStorage 업데이트
        const newRoutineCount = routineCompletionCount + 1;
        setRoutineCompletionCount(newRoutineCount);
        localStorage.setItem('routineCompletionCount', String(newRoutineCount));
      }
      return updatedRoutines;
    });
  }
};

  const handleAddRecommendedRoutine = (recommendedRoutine: RecommendedRoutine) => {
    // 추천 루틴 데이터를 기반으로 새로운 루틴 객체 생성
    const newRoutine = {
        id: Math.random(),
        name: recommendedRoutine.name,
        description: recommendedRoutine.description,
        category: recommendedRoutine.category,
        difficulty: recommendedRoutine.difficulty,
        time: '09:00',
        frequency: ["월", "화", "수", "목", "금"],
        reminder: true,
        goal: '30',
        completed: false,
        streak: 0,
         isGroupRoutine: false,
    };

    setPersonalRoutines(prevRoutines => [...prevRoutines, newRoutine]);
  };

  const handleSaveProfile = async () => {
    await fetchUserInfo();
  };


  const handleDeleteRoutine = (routineId: number, isGroupRoutine?: boolean) => {
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
      // 개인 루틴 삭제
      setPersonalRoutines(prevRoutines =>
        // 삭제할 루틴의 ID를 제외하고 새로운 배열 생성
        prevRoutines.filter(routine => routine.id !== routineId)
      );
    }
    // 삭제 후 이전 화면으로 돌아가기
    navigateBack();
  };

  const currentScreen =
    navigationStack.length > 0
      ? navigationStack[navigationStack.length - 1]
      : null;

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
            />
          );
        case "group-detail":
          return (
            <GroupDetailScreen
              groupId={currentScreen.params.id}  // group 객체 대신 id만 전달
              groups={groups}                   // 전체 그룹 전달
              onBack={navigateBack}
              onNavigate={navigateTo}
              onUpdateGroup={handleUpdateGroup}
              onJoinGroup={handleJoinGroup}
              pendingAuthMessages={pendingAuthMessages}
              onAddAuthMessage={handleAddAuthMessage}
              onApproveAuthMessage={handleApproveAuthMessage}
              onRejectAuthMessage={handleRejectAuthMessage}
              currentUser={UserInfo} 
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
        case "group-chat":
          return (
            <GroupChatScreen
              group={currentScreen.params}
              onBack={navigateBack}
               onAddAuthMessage={handleAddAuthMessage}
            />
          );
        case "create-routine":
          return (
            <CreateRoutineScreen 
              onBack={navigateBack} 
              onCreateRoutine={handleAddRoutine}
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
              user={currentScreen.params}
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
            personalRoutines={personalRoutines}
            onToggleCompletion={handleToggleCompletion}
            streakDays={streakDays}
            userInfo={UserInfo}
            participatingGroups={groups}
            onOpenAttendanceModal={handleOpenAttendanceModal}
            onOpenStreakModal={handleOpenStreakModal}
            onOpenBadgeModal={handleOpenBadgeModal}
            onAddAuthMessage={handleAddAuthMessage}
            pendingAuthMessages={pendingAuthMessages}
            onApproveAuthMessage={handleApproveAuthMessage}
            onRejectAuthMessage={handleRejectAuthMessage}
          />
        );
      case "routine":
        return <RoutineScreen 
          onNavigate={navigateTo} 
          //allRoutines={allRoutines}
          allRoutines={[...personalRoutines, ...groups.flatMap(g => g.routines || [])]}
          recommendedRoutines={recommendedRoutines}
          onToggleCompletion={handleToggleCompletion}
          onAddRecommendedRoutine={handleAddRecommendedRoutine}
          onOpenAttendanceModal={handleOpenAttendanceModal}
          onOpenStreakModal={handleOpenStreakModal}
          onOpenBadgeModal={handleOpenBadgeModal}
          onAddAuthMessage={handleAddAuthMessage} 
          initialUserInfo={UserInfo} 
          participatingGroups={groups} 
          allGroups={groups}
          pendingAuthMessages={pendingAuthMessages} 
        />;
      case "group":
        return <GroupScreen 
                  onNavigate={navigateTo} 
                  groups={groups} 
                  myGroups={groups}   // 임시로 참여중 그룹 = 전체 그룹
                  onNewGroup={() => navigateTo("create-group")}
                  onJoinGroup={handleJoinGroup}
                />
      case "ranking":
        return <RankingScreen 
                  groups={groups}
                />;
      case "mypage":
        return (
          <MyPageScreen
            onNavigate={navigateTo}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            user={UserInfo}
            onLogout={handleLogout}
          />
        );
      
      default:
        return (
          <HomeScreen 
            onNavigate={navigateTo} 
            personalRoutines={personalRoutines}
            onToggleCompletion={handleToggleCompletion}
            streakDays={streakDays}
            userInfo={UserInfo}
            participatingGroups={groups}   
            onOpenAttendanceModal={handleOpenAttendanceModal}
            onOpenStreakModal={handleOpenStreakModal}
            onOpenBadgeModal={handleOpenBadgeModal}
            onAddAuthMessage={handleAddAuthMessage}
            pendingAuthMessages={pendingAuthMessages}
            onApproveAuthMessage={handleApproveAuthMessage}
            onRejectAuthMessage={handleRejectAuthMessage}
             
          />
        );
    }
  };

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
    
    // 첫걸음 배지 조건 (첫 출석)
    if (currentAttendance === 1) {
        badgesToShow.push({ name: '첫걸음', image: '/images/badges/first-step.png' });
    }
    
    // 7일 연속 배지 조건
    if (currentStreak === 7) {
        badgesToShow.push({ name: '7일 연속', image: '/images/badges/seven-day-streak.png' });
    }
    
    // 월간 챔피언 배지 조건
    if (currentAttendance === 30) {
        badgesToShow.push({ name: '월간 챔피언', image: '/images/badges/monthly-champion.png' });
    }
    
    // 만약 보여줄 배지가 있다면
    if (badgesToShow.length > 0) {
        // 첫 번째 배지 정보를 상태에 저장하고 모달을 엽니다.
        const firstBadge = badgesToShow.shift();
        if (firstBadge) {
          setBadgeName(firstBadge.name);
          setBadgeImage(firstBadge.image);
          setBadgeModalOpen(true);
          
          // 다음 배지들이 있다면, 상태에 저장해 둡니다. (이후에 사용할 수 있도록)
          setPendingBadges(badgesToShow);
        }
    }
  };

  const handleCloseAttendanceModal = () => {
    setAttendanceModalOpen(false);

    // 출석 인증 횟수 증가 및 localStorage 업데이트
    const newAttendanceCount = attendanceCount + 1;
    setAttendanceCount(newAttendanceCount);
    localStorage.setItem('attendanceCount', String(newAttendanceCount));

    // 스트릭 일수 증가 및 localStorage 업데이트
    const newStreakDays = streakDays + 1;
    setStreakDays(newStreakDays);
    localStorage.setItem('streakDays', String(newStreakDays));

    handleNextModalSequence(newStreakDays, newAttendanceCount);
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
                onNewProject={handleNewProject}
                onProfileMenuClick={handleProfileMenuClick}
                userInfo={UserInfo}
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
                    onTabChange={setActiveTab}
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
        onLoginSuccess={handleNicknameSetupComplete}
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
    </div>
  );
}