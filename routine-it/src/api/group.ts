import api from "./api";

export interface GroupRequest {
  groupName: string;
  groupDescription: string;
  groupType: "FREE" | "REQUIRED";
  alarmTime: { hour: number; minute: number; second: number; nano: number };
  authDays: string; // ^[01]{7}$ 패턴
  category: string;
  imageUrl: string;
  maxMembers: number;
}

//그룹 생성
export async function createGroup(data: GroupRequest) {
  const response = await api.post("/groups", data);
  return response.data; // 서버 반환값
}

//그룹 편집
export async function updateGroup(groupId: number, data: GroupRequest) {
  const response = await api.put(`/groups/${groupId}`, data);
  return response.data; // 서버 반환값
}