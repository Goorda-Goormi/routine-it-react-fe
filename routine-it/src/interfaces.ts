
export interface Member {
  id: number;
  name: string;
  avatar: string;
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
  category?: string;
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