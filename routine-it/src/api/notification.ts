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

// 알림 타입 정의 (API 문서 기반)
export type NotificationType =
  | "GROUP_JOIN_REQUEST"
  | "GROUP_MEMBER_STATUS_UPDATED"
  | "GROUP_MEMBER_ROLE_UPDATED"
  | "GROUP_TODAY_AUTH_COMPLETED"
  | "GROUP_TODAY_AUTH_REJECTED"
  | "GROUP_TODAY_AUTH_REQUEST"
  | "MONTHLY_REVIEW";

/**
 * 인증된 사용자의 알림을 타입별로 조회합니다.
 * @param notificationType - 조회할 알림의 타입
 */
export async function getNotificationsByType(notificationType: NotificationType): Promise<NotificationApiResponse[]> {
  try {
    const notifications = await apiFetch(`/notifications/type?notificationType=${notificationType}`, {
      method: "GET",
    });
    return notifications;
  } catch (error) {
    console.error(`Failed to fetch notifications of type ${notificationType}:`, error);
    throw new Error("알림 타입별 조회 실패");
  }
}