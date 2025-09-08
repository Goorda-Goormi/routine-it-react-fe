//모든 파일에서 다 같은 변수 사용하면 그냥 "변수명 : 타입"
//일부 파일에서는 몇 변수가 필요없으면 "변수명? : 타입""
/*export interface AlarmTime {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}*/

export type NotificationCategory = '홈' | '그룹' | '회고';

export interface Notification {
  id: number;
  message: string;
  category: NotificationCategory;
  date: string;
  icon?: React.ReactNode;
  read: boolean;
  relatedId?: number; // 그룹 ID 등 관련 정보
  fullContent?: string; 
  monthYear?: string;
}

export interface Group {
 

//api버전으로 수정한 변수
 groupId: number;
  leaderName: string; 
  groupName: string; 
  //groupDescription: string; 
  description: string;
  groupType: 'FREE' | 'REQUIRED'; 
  alarmTime: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  }; 
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

// 사용자 총 점수 조회 시 필요한 로직 
export interface UserTotalScoreResponse {
  success: boolean;
  message: string;
  data: number; 
}

//===============알림 관련 인터페이스================//

export type NotificationType = 
  | "GROUP_JOIN_REQUEST"
  | "GROUP_MEMBER_STATUS_UPDATED"
  | "GROUP_MEMBER_ROLE_UPDATED"
  | "GROUP_TODAY_AUTH_COMPLETED"
  | "GROUP_TODAY_AUTH_REJECTED"
  | "GROUP_TODAY_AUTH_REQUEST"
  | "MONTHLY_REVIEW";

export interface NotificationApiResponse {
  id: number;
  content: string;
  notificationType: NotificationType;
  senderName: string;
  receiverName: string;
  groupName: string;
  createdAt: string; // "2025-09-08T09:37:03.951Z"
  read: boolean;
}