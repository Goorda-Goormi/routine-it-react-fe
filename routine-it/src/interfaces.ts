//모든 파일에서 다 같은 변수 사용하면 그냥 "변수명 : 타입"
//일부 파일에서는 몇 변수가 필요없으면 "변수명? : 타입""
export interface AlarmTime {
  hour: number;
  minute: number;
  second: number;
  nano: number;
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
  isMandatory?: boolean;

/*api버전으로 수정한 변수
 groupId: number;
  leaderName: string; 
  groupName: string; 
  groupDescription: string; 
  groupType: 'FREE' | 'REQUIRED'; 
  alarmTime: AlarmTime; 
  authDays: string; 
  category: string;
  groupImageUrl: string; 
  maxMembers: number;
  currentMemberCount: number; 
  createdAt: string; 
  updatedAt: string; 
  active: boolean; 

  // API 응답에는 없지만, 앱 로직에서 필요한 변수
  progress?: number;
  isOwner?: boolean;
  isJoined?: boolean;
  recentMembers?: Member[];
  routines?: Routine[];
*/
}


export interface Member {
  id: number;
  nickname: string;
  profileImageUrl: string;
  isCertified?: boolean; 
}

export interface AuthMessage {
  id: number;
  //user: string;
  nickname: string;
  message: string;
  imageUrl: string | null;
  routineId: number; 
  userId: string | number;
}

export interface Routine {
  id: number;
  name: string;
  category: string;
  time: string;
  completed: boolean;
  streak: number;
  difficulty?: string;
  isGroupRoutine?: boolean;
  frequency?: string[];
  type?: string;
  isOwner?: boolean;
  reminder?: string | boolean;
  goal?: string;
  description?: string;


}

export interface PendingAuthMap {
  [groupId: number]: AuthMessage[];
}


export interface UserProfile {
  id: number;
  nickname: string;
  email?: string;
  profileMessage?: string;
  profileImageUrl: string;
  isAlarmOn?: boolean;
  isDarkMode?: boolean;
  joinDate?: string;
  level?: number;
  exp?: number;
  maxExp?: number;
  maxStreakDays?: number;
  streakDays: number;
}

// export interface User {
//   id: number;
//   nickname: string;
//   profileImageUrl: string;
//   profileMessage?: string;
//   email?: string;
//   level?: number;
//   streak?: number;
//   streakDays: number;
//   //아마 여긴 더미에서만 필요한 속성이 아닐까
//   totalPoints: number;
//   joinDate?: string;
//   //위에 두 개. userhome
// }
