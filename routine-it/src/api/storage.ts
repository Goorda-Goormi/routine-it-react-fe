// storage.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

type PresignPutResp = { uploadUrl: string; key: string; expiresIn: string };
type PresignGetResp = { url: string };

export function getContentType(filename: string, fileType: string): string {
    if (fileType) {
        return fileType;
    }
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'png':
            return 'image/png';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'gif':
            return 'image/gif';
        default:
            return 'application/octet-stream';
    }
}

function toForm(data: Record<string, string>) {
  const p = new URLSearchParams();
  Object.entries(data).forEach(([k, v]) => p.set(k, v));
  return p;
}

// ✅ 1. 인증 헤더를 추가하는 헬퍼 함수 (재사용을 위함)
async function fetchWithAuth(url: string, options: RequestInit) {
    const accessToken = localStorage.getItem('accessToken');
    
    // ✅ 이 부분을 추가해서 accessToken 값을 확인하세요.
    console.log("현재 accessToken:", accessToken);

    const headers = new Headers(options.headers);
    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    } else {
        // ✅ 토큰이 없거나 유효하지 않으면 이 로그가 출력됩니다.
        console.warn("경고: Authorization 헤더에 토큰이 없습니다.");
    }

    const resp = await fetch(url, { ...options, headers });
    return resp;
}

// --- presign 발급 API (인증 필요) ---
export async function presignProfilePut(userId: number, file: File): Promise<PresignPutResp> {
    const contentType = file.type || "image/jpeg";
    // ✅ 2. fetchWithAuth 적용
    const resp = await fetchWithAuth(
        `${API_BASE}/api/storage/profile/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: toForm({ userId: String(userId), filename: file.name, contentType }),
    });
    if (!resp.ok) throw new Error(`profile presign 실패: ${resp.status} ${await resp.text()}`);
    return resp.json();
}

export async function presignProofShotPut(groupId: number, userId: number, file: File): Promise<PresignPutResp> {
    const contentType = file.type || "image/jpeg";
    // ✅ 2. fetchWithAuth 적용
    const resp = await fetchWithAuth(
        `${API_BASE}/api/storage/proof-shot/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: toForm({ groupId: String(groupId), userId: String(userId), filename: file.name, contentType }),
    });
    if (!resp.ok) throw new Error(`proof-shot presign 실패: ${resp.status} ${await resp.text()}`);
    return resp.json();
}

export async function presignGroupRoomPut(roomId: number, userId: number, file: File): Promise<PresignPutResp> {
    const contentType = getContentType(file.name, file.type);
    
    const resp = await fetchWithAuth(
        `${API_BASE}/api/storage/group-room/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: toForm({ roomId: String(roomId), userId: String(userId), filename: file.name, contentType }),
    });
    if (!resp.ok) throw new Error(`group-room presign 실패: ${resp.status} ${await resp.text()}`);
    return resp.json();
}

// --- 실제 S3 업로드 (인증 불필요) ---
export async function uploadFileToS3(uploadUrl: string, file: Blob, contentType: string): Promise<void> {
  console.log("S3 업로드 시도:", { uploadUrl, contentType, size: file.size });
  
  const resp = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType, // presign 발급 시 지정한 것과 동일해야 함
      "Cache-Control": "no-cache"
    },
    body: file,
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`S3 업로드 실패: ${resp.status} ${errorText}`);
  }
}

// --- 조회용 presign GET (인증 필요) ---
export async function presignGet(key: string, as: "inline" | "download" = "inline"): Promise<PresignGetResp> {
    // ✅ 2. fetchWithAuth 적용
    const resp = await fetchWithAuth(
        `${API_BASE}/api/storage/presign-get?key=${encodeURIComponent(key)}&as=${as}`, {
        method: "GET",
    });
    if (!resp.ok) throw new Error(`presign-get 실패: ${resp.status} ${await resp.text()}`);
    return resp.json();
}