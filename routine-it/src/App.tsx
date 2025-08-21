import React, { useState, useEffect } from "react";
import { TopNavBar } from "./components/TopNavBar";
import { BottomTabNav } from "./components/BottomTabNav";
import { LoginScreen } from "./components/LoginScreen";
import { HomeScreen } from "./components/HomeScreen";
import { RoutineScreen } from "./components/RoutineScreen";
import { GroupScreen } from "./components/GroupScreen";
import { RankingScreen } from "./components/RankingScreen";
import { MyPageScreen } from "./components/MyPageScreen";
import { RoutineDetailScreen } from "./components/RoutineDetailScreen";
import { GroupDetailScreen } from "./components/GroupDetailScreen";
import { ProfileEditScreen } from "./components/ProfileEditScreen";
import { GroupChatScreen } from "./components/GroupChatScreen";
import { CreateRoutineScreen } from "./components/CreateRoutineScreen";
import { CreateGroupScreen } from "./components/CreateGroupScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { HelpScreen } from "./components/HelpScreen";
import { UserHomeScreen } from "./components/UserHomeScreen";

interface Routine {
  id: string;
  name: string;
  description?: string;
  time: string;
  frequency: string;
  reminder: boolean;
  goal: string;
  category: string; // 카테고리 추가
  completed: boolean;
  streak: number;
  difficulty: string; // 난이도 추가
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

  const [personalRoutines, setPersonalRoutines] = useState<Routine[]>([]);

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

  // 새로운 루틴을 추가하는 함수
  const handleAddRoutine = (newRoutineData: any) => {
    // 임시 ID 및 기본값 설정
    const newRoutine: Routine = {
      ...newRoutineData,
      id: Date.now().toString(),
      completed: false,
      streak: 0,
    };
    setPersonalRoutines(prev => [...prev, newRoutine]);
  };
  
  // 루틴 완료 상태를 토글하는 함수
  const handleToggleCompletion = (routineId: string) => {
    setPersonalRoutines(prev =>
      prev.map(routine =>
        routine.id === routineId ? { ...routine, completed: !routine.completed } : routine
      )
    );
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
            />
          );
        case "group-detail":
          return (
            <GroupDetailScreen
              group={currentScreen.params}
              onBack={navigateBack}
              onNavigate={navigateTo}
            />
          );
        case "profile-edit":
          return <ProfileEditScreen onBack={navigateBack} />;
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
              group={currentScreen.params}
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
        return <HomeScreen onNavigate={navigateTo} />;
      case "routine":
        return <RoutineScreen 
          onNavigate={navigateTo} 
          personalRoutines={personalRoutines}
          onToggleCompletion={handleToggleCompletion}
        />;
      case "group":
        return <GroupScreen onNavigate={navigateTo} />;
      case "ranking":
        return <RankingScreen />;
      case "mypage":
        return (
          <MyPageScreen
            onNavigate={navigateTo}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        );
      default:
        return <HomeScreen onNavigate={navigateTo} />;
    }
  };

  return (
    
    <div
      className={`min-h-screen w-full bg-[var(--root-background)] flex items-center justify-center `}
    >
  
      {/* 모바일 앱 컨테이너 */}
      <div className="w-[450px] h-[800px] bg-background flex flex-col overflow-hidden rounded-lg shadow-2xl border border-border/50">
        {/* 로그인 상태가 아닐 때는 전체 화면 사용 */}
        {!isLoggedIn ? (
          <div className="w-full h-full">{renderScreen()}</div>
        ) : (
          <>
            {/* TopNavBar - 서브 화면에서는 숨김 */}
            {!currentScreen && (
              <TopNavBar
                onSearch={handleSearch}
                onNewProject={handleNewProject}
                onProfileMenuClick={handleProfileMenuClick}
              />
            )}

            {/* 본문 영역 */}
            <main className="flex-1 bg-background flex flex-col overflow-hidden">
              {/* 콘텐츠 영역 */}
              <div className="flex-1 overflow-auto ">
                {renderScreen()}
              </div>

              {/* 본문 영역 내 네비게이션 footer - 메인 화면에서만 표시 */}
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