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

export interface Routine {
  id: number;
  name: string;
  description?: string;
  time: string;
  frequency: string[];
  reminder: boolean;
  goal: string;
  category: string;
  completed: boolean;
  streak: number;
  difficulty: string;
  isGroupRoutine?: boolean;
}

export interface Group {
  id: number;
    name: string;
    description: string;
    members: number;
    type: string;
    progress?: number;
    isOwner?: boolean;
    time: string;
    category: string;
    recentMembers?: Member[];
    owner?: string;
    routines?: Routine[];
    isJoined?: boolean;
}

export interface Member {
  id: number;
  name: string;
  avatar: string;
}

interface NavigationState {
  screen: string;
  params?: any;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [navigationStack, setNavigationStack] = useState<
    NavigationState[]
  >([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "true";
    }
    return false;
  });
  const [UserInfo, setUserInfo] = useState({
      name: '구르미',
      email: 'goormida@example.com',
      avatar: '/profile.jpg',
      joinDate: '2024년 1월',
      level: 15,
      exp: 2450,
      maxExp: 3000,
      streakDays: 28,
      bio: '우리 함께 습관을 만들어봐요!'
    });

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
    recentMembers: [
        { id: 1, name: '김민수', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
        { id: 2, name: '이지영', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b95fcebf?w=40&h=40&fit=crop&crop=face' },
        { id: 3, name: '박철수', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' }
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
            { id: 4, name: '정수현', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
            { id: 5, name: '최영호', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face' }
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

  /*
  const handleJoinGroup = () => {
    // 임시로 가상의 그룹 루틴을 추가하는 로직
    const newGroupRoutine: Routine = {
      id: Math.random(), // 고유 ID 생성
      name: '',
      description: '',
      time: '08:00',
      frequency: ["월", "화", "수", "목", "금", "토", "일"],
      reminder: true,
      goal: "30",
      category: "생활",
      completed: false,
      streak: 0,
      difficulty: "쉬움",
      isGroupRoutine: true
    };
    
    setGroupRoutines(prevRoutines => [...prevRoutines, newGroupRoutine]);
    navigateTo('routine', {});
  };*/
  const handleJoinGroup = (groupId: number) => {
  setGroups(prevGroups =>
    prevGroups.map(group =>
      group.id === groupId ? { ...group, isJoined: true } : group
    )
  );
};

  
  // 모든 루틴을 합치는 배열
  //const allRoutines = [...personalRoutines, ...groupRoutines];
/*
  const allRoutines = React.useMemo(() => {
  return [
    ...personalRoutines,
    ...groups.flatMap(group =>
      group.routines?.map(r => ({ ...r, isGroupRoutine: true })) || []
    )
  ];
}, [personalRoutines, groups]);*/

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

  const handleLogin = () => {
    setIsLoggedIn(true);
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
    };
    setPersonalRoutines(prev => [...prev, newRoutine]);
  };
  
  // 그룹을 추가하는 함수
  const handleAddGroup = (newGroupData: any) => {
  const newGroup = {
    ...newGroupData,
    id: Date.now(),
    members: 1,
    progress: 0,
    isOwner: true,
    isJoined: true,
    time: newGroupData.time, // 이 부분은 이미 잘 적용되고 있습니다.
    owner: UserInfo.name,
    recentMembers: [
      { id: Date.now(), name: UserInfo.name, avatar: UserInfo.avatar }
    ],
    routines: [ // 새로운 그룹에 기본 루틴 추가
      {
        id: Date.now(),
        name: newGroupData.name,
        description: newGroupData.description,
        time: newGroupData.time, // 그룹의 루틴에도 time 적용
        frequency: newGroupData.selectedDays, // 'frequency'로 변경
        reminder: newGroupData.hasAlarm, // 'reminder'에 hasAlarm 적용
        goal: newGroupData.goal, // goal 필드 추가 필요
        category: newGroupData.category,
        completed: false,
        streak: 0,
        difficulty: newGroupData.difficulty,
        isGroupRoutine: true,
      }
    ]
  };
  setGroups(prev => [newGroup, ...prev]);
};


const handleUpdateGroup = (updatedGroup: Group) => {
  setGroups(prevGroups =>
    prevGroups.map(group =>
      group.id === updatedGroup.id ? { ...group, ...updatedGroup } : group
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
    if (isGroupRoutine) {
        setGroups(prevGroups => 
          prevGroups.map(group => ({
            ...group,
            routines: group.routines?.map(routine =>
            routine.id === routineId ? { ...routine, completed: !routine.completed } : routine
            ),
          }))
        );
    } else {
        setPersonalRoutines(prev =>
          prev.map(routine =>
            routine.id === routineId ? { ...routine, completed: !routine.completed } : routine
          )
        );
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
    };

    setPersonalRoutines(prevRoutines => [...prevRoutines, newRoutine]);
  };


  const handleSaveProfile = (updatedInfo: any) => {
      setUserInfo(prev => ({ ...prev, ...updatedInfo }));
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
      return <LoginScreen onLogin={handleLogin} />;
    }

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
    />
  );
        case "profile-edit":
          return (
            <ProfileEditScreen 
              onBack={navigateBack} 
              onNavigate={navigateTo}
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
              initialUserInfo={UserInfo}
              onSaveProfile={handleSaveProfile} 
            />
          );
        case "group-chat":
          return (
            <GroupChatScreen
              group={currentScreen.params}
              onBack={navigateBack}
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
    switch (activeTab) {
      case "home":
        return (
          <HomeScreen 
            onNavigate={navigateTo} 
            personalRoutines={personalRoutines}
            onToggleCompletion={handleToggleCompletion}
            initialUserInfo={{
                name: UserInfo.name,
                username: UserInfo.email.split('@')[0],
                profileImage: UserInfo.avatar,
                bio: UserInfo.bio,
            }} 
            participatingGroups={groups}   
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
        />;
      case "group":
        return <GroupScreen 
                  onNavigate={navigateTo} 
                  groups={groups} 
                  myGroups={groups}   // 임시로 참여중 그룹 = 전체 그룹
                  onNewGroup={handleAddGroup} 
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
          />
        );
      default:
        return (
          <HomeScreen 
            onNavigate={navigateTo} 
            personalRoutines={personalRoutines}
            onToggleCompletion={handleToggleCompletion}
            initialUserInfo={{
                name: UserInfo.name,
                username: UserInfo.email.split('@')[0],
                profileImage: UserInfo.avatar,
                bio: UserInfo.bio,
            }} 
            participatingGroups={groups}   
          />
        );
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
            {!currentScreen && (
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
    </div>
  );
}