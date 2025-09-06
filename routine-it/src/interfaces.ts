//모든 파일에서 다 같은 변수 사용하면 그냥 "변수명 : 타입"
//일부 파일에서는 몇 변수가 필요없으면 "변수명? : 타입""
/*export interface AlarmTime {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}*/


export interface Group {
 

//api버전으로 수정한 변수
 groupId: number;
  leaderName: string; 
  groupName: string; 
  groupDescription: string; 
  groupType: 'FREE' | 'REQUIRED'; 
  alarmTime: string; 
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

}


export interface Member {
  id: number;
  nickname: string;
  profileImageUrl: string;
  isCertified?: boolean; 
  //status?: string; // 'JOINED', 'PENDING', 'NOT_JOINED' 등
  //role?: string; // 'LEADER', 'MEMBER', 'NONE' 등
  status?: 'PENDING' | 'JOINED' | 'BLOCKED' | 'LEFT';
  role?: 'LEADER' | 'MEMBER';
}

// API 응답에 정확히 매핑되는 인터페이스
export interface GroupMemberResponse {
  groupMemberId: number;
  groupName: string;
  memberName: string;
  status: 'PENDING' | 'JOINED' | 'BLOCKED' | 'LEFT';
  role: 'LEADER' | 'MEMBER';
  message: string;
  createdAt: string;
  updatedAt: string;
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

export interface UpdateProfilePayload {
  nickname: string;
  profileMessage: string;
  profileImageUrl: string;
  isAlarmOn?: boolean;
  isDarkMode?: boolean;
  // level: number;
  // joinDate: string;
  // exp: number;
  // streakDays: number;
}



//================= 랭킹 관련 인터페이스 =================//
export interface IGroupDetail {
  groupId: number;
  groupName: string;
  groupImageUrl: string;
  groupType: string;
  score: number;
  rankInGroup: number;
  totalMembers: number;
  authCount: number;
  groupWeightMultiplier: number;
}

export interface IPersonalRankingData {
  userId: number;
  nickname: string;
  profileImageUrl: string;
  totalScore: number;
  currentRank: number;
  totalParticipants: number;
  monthYear: string;
  consecutiveDays: number;
  groupDetails: IGroupDetail[];
  updatedAt: string; // ISO 8601 형식의 날짜 문자열
}

export interface IPersonalRankingResponse {
  success: boolean;
  message: string;
  data: IPersonalRankingData[];
}

//==================================================//