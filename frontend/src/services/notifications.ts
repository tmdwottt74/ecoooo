import { authApi } from './auth'; // 인증된 API 호출을 위한 axios 인스턴스

export interface Notification {
  notification_id: number;
  user_id: number;
  title: string;
  body?: string;
  status: 'PENDING' | 'SENT' | 'READ';
  created_at: string;
  read_at?: string;
}

// 사용자별 알림 조회
export const fetchMyNotifications = async (): Promise<Notification[]> => {
  const response = await authApi.get<Notification[]>('/notifications/my');
  return response.data;
};

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId: number): Promise<Notification> => {
  const response = await authApi.put<Notification>(`/notifications/${notificationId}/read`);
  return response.data;
};

// 알림 삭제
export const deleteNotification = async (notificationId: number): Promise<void> => {
  await authApi.delete(`/notifications/${notificationId}`);
};
