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
import { completeSignup, logoutUser, deleteAccount } from './api/auth';
import { createGroup, getAllGroups,getJoinedGroups } from "./api/group";

interface NavigationState {
  screen: string;
  params?: any;
}

type BadgeType = '첫걸음' | '7일 연속' | '루틴 마스터' | '월간 챔피언';
//type PendingAuthMap = { [groupId: number]: AuthMessage[] };
export default function App() {
  
  //1. 상태관리 변수===================================================
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

 const [groups, setGroups] = useState<Group[]>([]);
 const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

  const [groupRoutines, setGroupRoutines] = useState<Routine[]>([]);
  const [error, setError] = useState<string | null>(null);

   
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
      const joinedGroups = await getJoinedGroups();

      setGroups(allGroups);
      setMyGroups(joinedGroups);
      
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
    //const isNewUserParam = params.get('isNewUser');
    const storedToken = localStorage.getItem('accessToken');

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      setIsLoggedIn(true);
      fetchUserInfo(); // 로그인 성공 시 사용자 정보 즉시 불러오기
        
      // if (isNewUserParam === 'true') {
      //   setIsNewUser(true);
      //   setIsLoginModalOpen(true);
      // }
       fetchGroupData();
      setIsNewUser(true);
      setIsLoginModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      
    } else {
      //const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        setIsLoggedIn(true);
        fetchUserInfo(); // 로컬 스토리지에 토큰이 있을 경우 사용자 정보 불러오기
        fetchGroupData();
      }
    }
  }, []);

   //groups 상태가 변경될 때마다 groupRoutines 업데이트
   useEffect(() => {
    const newGroupRoutines: Routine[] = groups.flatMap(group => 
      group.routines?.map(routine => ({ ...routine, isGroupRoutine: true })) || []
    );
    setGroupRoutines(newGroupRoutines);
  }, [groups]);


  //다크 모드 상태 관리
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", isDarkMode.toString());
  }, [isDarkMode]);

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
  
  const handleLoginSuccess = () => {
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
    // 분리된 로그아웃 API 함수를 호출합니다.
    await logoutUser();

    // 클라이언트 상태를 초기화합니다.
    setIsLoggedIn(false);
    setActiveTab("home");
    setNavigationStack([]);
    
    alert('로그아웃 되었습니다.');

  } catch (error) {
    console.error("로그아웃 에러:", error);
    // API 모듈에서 전달된 에러 메시지를 사용자에게 보여줍니다.
    alert((error as Error).message);
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
        setPendingAuthMessages({});
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
    let routineOwner = isGroupRoutine ? 'group' : 'personal';

    const updateCompletionState = (routines: Routine[]) => {
    return routines.map(routine => {
      if (routine.id === routineId) {
        isCompleted = !routine.completed;
        return { ...routine, completed: !routine.completed };
      }
      return routine;
    });
  };

    if (isGroupRoutine) {
      setGroups(prevGroups => prevGroups.map(group => ({
        ...group,
        routines: updateCompletionState(group.routines || [])
      })));
    } else {
      setPersonalRoutines(prev => updateCompletionState(prev));
    }
     if (isCompleted) {
      // 개인 루틴 완료 시에만 출석 모달 호출
      if (routineOwner === 'personal') {
        handleOpenAttendanceModal();
      }

      const newRoutineCount = routineCompletionCount + 1;
      setRoutineCompletionCount(newRoutineCount);
      localStorage.setItem('routineCompletionCount', String(newRoutineCount));

      if (newRoutineCount >= 100 && !earnedBadges.includes('루틴 마스터')) {
      const badgeName: BadgeType = '루틴 마스터';
      // 상태와 로컬스토리지에 즉시 저장
      setEarnedBadges(prev => {
        const newEarned = [...prev, badgeName];
        localStorage.setItem('earnedBadges', JSON.stringify(newEarned));
        return newEarned;
      });
      
      setBadgeName(badgeName);
      setBadgeImage(badgeInfo[badgeName].image);
      setBadgeModalOpen(true);
    }
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

  
   //7.그룹 관련 =============================================================
  
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
      if (group.groupId === groupId) {
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

  // pendingAuthMessages 상태에서 승인된 메시지 제거
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
  };

 

 
// 8. ui/네비게이션 관련 =============================================================
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

 /* const navigateTo = (screen: string, params?: any) => {
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
  };*/
  // navigationStack을 관리하는 부모 컴포넌트 (예: App.tsx)
// ...

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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };


// 9. 화면 렌더링 및 모달 =============================================================

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
              //onJoinGroup={handleJoinGroup}
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
                  myGroups={myGroups}   // 임시로 참여중 그룹 = 전체 그룹
                  onNewGroup={() => navigateTo("create-group")}
                  //onJoinGroup={handleJoinGroup}
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
            attendanceDates={attendanceDates}
            earnedBadges={earnedBadges}
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

  //10. 출석, 스트릭, 배지 모달 관련 =============================================================

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
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 중복 체크 후 출석 날짜 추가 및 localStorage 업데이트
    setAttendanceDates(prevDates => {
      if (!prevDates.includes(todayString)) {
        const newDates = [...prevDates, todayString];
        localStorage.setItem('attendanceDates', JSON.stringify(newDates));
        return newDates;
      }
      return prevDates;
    });

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
    </div>
  );
}