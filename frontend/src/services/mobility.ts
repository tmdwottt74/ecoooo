import { authApi } from './auth'; // 인증된 API 호출을 위한 axios 인스턴스

export interface MobilityLog {
  log_id?: number;
  user_id: number;
  source_id?: number;
  mode: 'BUS' | 'SUBWAY' | 'BIKE' | 'WALK' | 'CAR';
  distance_km: number;
  started_at: string; // ISO 8601 형식 문자열
  ended_at: string;   // ISO 8601 형식 문자열
  raw_ref_id?: string;
  co2_baseline_g?: number;
  co2_actual_g?: number;
  co2_saved_g?: number;
  created_at?: string;
}

export interface CreateMobilityLogData {
  user_id: number;
  source_id?: number;
  mode: 'BUS' | 'SUBWAY' | 'BIKE' | 'WALK' | 'CAR';
  distance_km: number;
  started_at: string;
  ended_at: string;
  raw_ref_id?: string;
}

export interface UpdateMobilityLogData {
  user_id?: number;
  source_id?: number;
  mode?: 'BUS' | 'SUBWAY' | 'BIKE' | 'WALK' | 'CAR';
  distance_km?: number;
  started_at?: string;
  ended_at?: string;
  raw_ref_id?: string;
}

// 이동 기록 생성
export const createMobilityLog = async (data: CreateMobilityLogData): Promise<MobilityLog> => {
  const response = await authApi.post<MobilityLog>('/mobility_logs/', data);
  return response.data;
};

// 사용자별 이동 기록 조회
export const fetchMyMobilityLogs = async (): Promise<MobilityLog[]> => {
  const response = await authApi.get<MobilityLog[]>('/mobility_logs/my');
  return response.data;
};

// 특정 이동 기록 조회
export const fetchMobilityLogById = async (logId: number): Promise<MobilityLog> => {
  const response = await authApi.get<MobilityLog>(`/mobility_logs/${logId}`);
  return response.data;
};

// 이동 기록 업데이트
export const updateMobilityLog = async (logId: number, data: UpdateMobilityLogData): Promise<MobilityLog> => {
  const response = await authApi.put<MobilityLog>(`/mobility_logs/${logId}`, data);
  return response.data;
};

// 이동 기록 삭제
export const deleteMobilityLog = async (logId: number): Promise<void> => {
  await authApi.delete(`/mobility_logs/${logId}`);
};
