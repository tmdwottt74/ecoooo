import { authApi } from './auth'; // 인증된 API 호출을 위한 axios 인스턴스
import { Challenge } from './challenges'; // Challenge 인터페이스 임포트

// 추천 챌린지 조회
export const fetchRecommendedChallenges = async (limit: number = 5): Promise<Challenge[]> => {
  const response = await authApi.get<Challenge[]>(`/recommendations/challenges?limit=${limit}`);
  return response.data;
};
