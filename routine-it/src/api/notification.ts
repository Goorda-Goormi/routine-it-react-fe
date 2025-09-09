import { apiFetch } from "./client";
import type { NotificationApiResponse } from "../interfaces"; // 아래에서 정의할 타입

/**
 * 인증된 사용자의 전체 알림을 조회합니다.
 */
export async function getNotifications(): Promise<NotificationApiResponse[]> {
  try {
    const notifications = await apiFetch("/notifications", { method: "GET" });
    return notifications;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    throw new Error("전체 알림 조회 실패");
  }
}

/**
 * 특정 알림을 읽음/읽지 않음으로 처리합니다.
 * @param notificationId - 처리할 알림의 ID
 * @param isRead - 읽음 여부 (true/false)
 */
export async function markNotificationAsRead(notificationId: number, isRead: boolean): Promise<NotificationApiResponse> {
  try {
    const updatedNotification = await apiFetch(`/notifications/${notificationId}/read?isRead=${isRead}`, {
      method: "POST",
      //method: "PUT",
    });
    return updatedNotification;
  } catch (error) {
    console.error(`Failed to mark notification ${notificationId} as read:`, error);
    throw new Error("알림 읽음 처리 실패");
  }
}