import { authApi } from './auth'; // 인증된 API 호출을 위한 axios 인스턴스

export interface Challenge {
  challenge_id: number;
  title: string;
  description?: string;
  scope: 'PERSONAL' | 'GROUP';
  target_mode: 'ANY' | 'BUS' | 'SUBWAY' | 'BIKE' | 'WALK';
  target_saved_g: number;
  start_at: string; // ISO 8601 형식 문자열
  end_at: string;   // ISO 8601 형식 문자열
  created_by?: number;
  created_at: string;
}

export interface CreateChallengeData {
  title: string;
  description?: string;
  scope?: 'PERSONAL' | 'GROUP';
  target_mode?: 'ANY' | 'BUS' | 'SUBWAY' | 'BIKE' | 'WALK';
  target_saved_g: number;
  start_at: string;
  end_at: string;
}

export interface UpdateChallengeData {
  title?: string;
  description?: string;
  scope?: 'PERSONAL' | 'GROUP';
  target_mode?: 'ANY' | 'BUS' | 'SUBWAY' | 'BIKE' | 'WALK';
  target_saved_g?: number;
  start_at?: string;
  end_at?: string;
}

// 모든 챌린지 조회
export const fetchAllChallenges = async (): Promise<Challenge[]> => {
  const response = await authApi.get<Challenge[]>('/challenges/');
  return response.data;
};

// 특정 챌린지 조회
export const fetchChallengeById = async (challengeId: number): Promise<Challenge> => {
  const response = await authApi.get<Challenge>(`/challenges/${challengeId}`);
  return response.data;
};

// 챌린지 생성
export const createChallenge = async (data: CreateChallengeData): Promise<Challenge> => {
  const response = await authApi.post<Challenge>('/challenges/', data);
  return response.data;
};

// 챌린지 업데이트
export const updateChallenge = async (challengeId: number, data: UpdateChallengeData): Promise<Challenge> => {
  const response = await authApi.put<Challenge>(`/challenges/${challengeId}`, data);
  return response.data;
};

// 챌린지 삭제
export const deleteChallenge = async (challengeId: number): Promise<void> => {
  await authApi.delete(`/challenges/${challengeId}`);
};

// 챌린지 참여
export const joinChallenge = async (challengeId: number): Promise<any> => {
  const response = await authApi.post(`/challenges/${challengeId}/join`);
  return response.data;
};

// 챌린지 탈퇴
export const leaveChallenge = async (challengeId: number): Promise<void> => {
  await authApi.delete(`/challenges/${challengeId}/leave`);
};
