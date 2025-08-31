//모든 파일에서 다 같은 변수 사용하면 그냥 "변수명 : 타입"
//일부 파일에서는 몇 변수가 필요없으면 "변수명? : 타입""

export interface Member {
  id: number;
  name: string;
  nickname: string;
  avatar: string;
  isCertified?: boolean; 
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

}



export interface AuthMessage {
  id: number;
  user: string;
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


export interface User {
  id: number;
  name: string;
  nickname: string;
  avatar: string;
  bio?: string;
  email?: string;
  level?: number;
  streak?: number;
  streakDays: number;
  //아마 여긴 더미에서만 필요한 속성이 아닐까
  totalPoints: number;
  joinDate?: string;
  //위에 두 개. userhome
}
