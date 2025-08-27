
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