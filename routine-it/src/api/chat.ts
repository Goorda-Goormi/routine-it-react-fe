import axios from 'axios';

export const leaveGroup = async (roomId) => {
  try {
    const response = await axios.delete(`/api/chat/rooms/${roomId}/leave`);
    return response.data;
  } catch (error) {
    console.error("그룹 탈퇴 오류:", error);
    throw error;
  }
};