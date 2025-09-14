import { authApi } from './auth'; // 인증된 API 호출을 위한 axios 인스턴스

export interface Achievement {
  achievement_id: number;
  code: string;
  title: string;
  description: string;
}

export interface UserAchievement {
  user_id: number;
  achievement_id: number;
  granted_at: string;
  achievement?: Achievement; // 관계된 Achievement 객체 포함 (백엔드에서 포함하여 반환할 경우)
}

// 사용자별 획득 업적 조회
export const fetchMyAchievements = async (): Promise<UserAchievement[]> => {
  const response = await authApi.get<UserAchievement[]>('/achievements/my_achievements');
  return response.data;
};

// 모든 업적 조회 (관리자용 또는 정보 제공용)
export const fetchAllAchievements = async (): Promise<Achievement[]> => {
  const response = await authApi.get<Achievement[]>('/achievements/');
  return response.data;
};
