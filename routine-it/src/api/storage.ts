import { apiFetch } from './client'; 

const API_BASE = import.meta.env.VITE_API_BASE_URL;

type PresignPutResp = { uploadUrl: string; key: string };
type PresignGetResp = { url: string };

// 1. 업로드용 URL 요청 함수
export async function presignProfilePut(userId: number, filename: string, mime: string): Promise<PresignPutResp> {
  const qs = new URLSearchParams({
    userId: String(userId),
    filename,
    contentType: mime || "application/octet-stream",
  }).toString();
  const response = await apiFetch(`/api/storage/profile/presign?${qs}`);

  if (response.success && response.data) {
    return response.data;
  } else {
    throw new Error(response.message || '업로드 URL을 받아오는데 실패했습니다.');
  }
}

// 2. 조회용 URL 요청 함수 (업로드 후 미리보기에 사용)
export async function presignProfileGet(key: string): Promise<string> {
  const response = await apiFetch(`/api/storage/profile/presign-get?key=${encodeURIComponent(key)}`);
  
  if (response.success && response.data.url) {
    return response.data.url;
  } else {
    throw new Error(response.message || '조회용 URL을 받아오는데 실패했습니다.');
  }
}