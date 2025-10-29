import { EventSourcePolyfill } from 'event-source-polyfill';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * SSE 연결을 관리할 단일 인스턴스
 */
let eventSource: EventSourcePolyfill | null = null;

/**
 * SSE 서비스에 전달할 콜백 함수들의 타입 정의
 */
interface SseCallbacks {
  onOpen: () => void;
  onNotification: (notification: any) => void;
  onError: (error: any) => void;
}

/**
 * SSE 연결을 관리하는 싱글톤 서비스 객체
 */
export const notificationService = {
  /**
   * 서버와 SSE 연결을 시작합니다.
   * @param callbacks - 연결/수신/에러 시 실행할 콜백 함수 객체
   */
  connect: (callbacks: SseCallbacks) => {
    if (eventSource) {
      console.log("SSE connection already exists.");
      return;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error("SSE Connect: No access token found.");
      callbacks.onError({ message: "No access token" });
      return;
    }
    const lastEventId = localStorage.getItem('lastEventId') || "";
    const sseUrl = `${BASE_URL}/notifications/subscribe`; 

    console.log(`🔌 SSE 연결을 시도합니다... (URL: ${sseUrl}, Last-Event-ID: ${lastEventId})`);

    eventSource = new EventSourcePolyfill(sseUrl, {
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Last-Event-ID': lastEventId      
      }
    });

    eventSource.onopen = () => {
      callbacks.onOpen();
    };

    eventSource.addEventListener("notification", (event: any) => {
      try {
        const parsedData = JSON.parse(event.data); //
        
        if (event.lastEventId) {
          localStorage.setItem('lastEventId', event.lastEventId);
        }
        
        callbacks.onNotification(parsedData);
      } catch (e) {
        console.error("SSE data parse error:", e);
      }
    });

    eventSource.onerror = (error: any) => {
      callbacks.onError(error);
      notificationService.disconnect();
    };
  },

  /**
   * SSE 연결을 명시적으로 닫습니다.
   */
  disconnect: () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
      console.log("SSE 연결이 종료되었습니다.");
    }
  }
};