const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

// Fetch API 헬퍼 함수
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export interface CreditTransaction {
  entry_id: number;
  type: 'EARN' | 'SPEND' | 'ADJUST';
  points: number;
  reason: string;
  created_at: string;
  meta?: any;
}

export interface CreditBalance {
  user_id: number;
  total_points: number;
  recent_earned: number;
  last_updated: string;
}

export interface GardenStatus {
  user_id: number;
  level_number: number;
  level_name: string;
  image_path: string;
  waters_count: number;
  total_waters: number;
  required_waters: number;
  status: string;
}

export interface WateringResponse {
  success: boolean;
  message?: string;
  garden_id: number;
  waters_count: number;
  total_waters: number;
  level_up: boolean;
  new_level: string | null;
  points_spent: number;
  remaining_points: number;
}

export interface ChallengeCompleteResponse {
  success: boolean;
  message: string;
  points_earned: number;
  transaction_id: number;
}

export interface ActivityCompleteResponse {
  success: boolean;
  message: string;
  points_earned: number;
  carbon_saved: number;
  transaction_id: number;
  mobility_log_id: number;
}

class CreditService {
  private getUserId(): number {
    return parseInt(localStorage.getItem('userId') || '1'); // 기본값 1
  }

  // 크레딧 잔액 조회
  async getCreditBalance(): Promise<CreditBalance | null> {
    const userId = this.getUserId();
    try {
      const response = await apiRequest<CreditBalance>(`${API_URL}/api/credits/balance/${userId}`);
      return response;
    } catch (error) {
      console.error("Error fetching credit balance:", error);
      return null;
    }
  }

  // 정원 상태 조회
  async getGardenStatus(): Promise<GardenStatus | null> {
    const userId = this.getUserId();
    try {
      const response = await apiRequest<GardenStatus>(`${API_URL}/api/credits/garden/${userId}`);
      return response;
    } catch (error) {
      console.error("Error fetching garden status:", error);
      return null;
    }
  }

  // 총 포인트 조회
  async getTotalPoints(): Promise<number> {
    const userId = this.getUserId();
    try {
      const response = await apiRequest<{ total_points: number }>(`${API_URL}/api/credits/total/${userId}`);
      return response.total_points;
    } catch (error) {
      console.error("Error fetching total points:", error);
      return 1240; // Fallback to dummy data
    }
  }

  // 크레딧 추가/차감
  async addCredits(amount: number, reason: string): Promise<boolean> {
    const userId = this.getUserId();
    try {
      const response = await apiRequest<{ success: boolean }>(`${API_URL}/api/credits/add`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId.toString(),
          points: amount,
          reason: reason
        })
      });
      
      if (response.success) {
        // 로컬 크레딧 잔액 업데이트
        this.updateLocalBalance(amount);
        
        // 다른 탭에 알림
        window.dispatchEvent(new CustomEvent('creditUpdated', { 
          detail: { 
            newBalance: this.getLocalBalance(), 
            change: amount,
            reason: reason
          } 
        }));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding credits:", error);
      return false;
    }
  }

  // 정원 물주기
  async waterGarden(pointsSpent: number): Promise<WateringResponse> {
    const userId = this.getUserId();
    try {
      const response = await apiRequest<WateringResponse>(`${API_URL}/api/credits/garden/water`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          points_spent: pointsSpent,
        })
      });
      
      if (response.success) {
        // 로컬 크레딧 잔액 업데이트
        this.updateLocalBalance(-pointsSpent);
        
        // 다른 탭에 알림
        window.dispatchEvent(new CustomEvent('creditUpdated', { 
          detail: { 
            newBalance: this.getLocalBalance(), 
            change: -pointsSpent,
            reason: '정원 물주기'
          } 
        }));
      }
      
      return response;
    } catch (error) {
      console.error("Error watering garden:", error);
      return {
        success: false,
        garden_id: 0,
        waters_count: 0,
        total_waters: 0,
        level_up: false,
        new_level: null,
        points_spent: pointsSpent,
        remaining_points: 0,
      };
    }
  }

  // 크레딧 내역 조회
  async getCreditHistory(limit: number = 50): Promise<CreditTransaction[]> {
    const userId = this.getUserId();
    try {
      const response = await apiRequest<CreditTransaction[]>(`${API_URL}/api/credits/history/${userId}?limit=${limit}`);
      return response || [];
    } catch (error) {
      console.error("Error fetching credit history:", error);
      return [];
    }
  }

  // 챌린지 완료
  async completeChallenge(
    challengeId: string, 
    challengeType: string, 
    points: number, 
    challengeName: string
  ): Promise<ChallengeCompleteResponse> {
    const userId = this.getUserId();
    try {
      const response = await apiRequest<ChallengeCompleteResponse>(`${API_URL}/api/credits/challenge/complete`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          challenge_id: challengeId,
          challenge_type: challengeType,
          points: points,
          challenge_name: challengeName
        })
      });
      
      if (response.success) {
        // 로컬 크레딧 잔액 업데이트
        this.updateLocalBalance(points);
        
        // 다른 탭에 알림
        window.dispatchEvent(new CustomEvent('creditUpdated', { 
          detail: { 
            newBalance: this.getLocalBalance(), 
            change: points,
            reason: `챌린지 완료: ${challengeName}`
          } 
        }));
      }
      
      return response;
    } catch (error) {
      console.error("Error completing challenge:", error);
      return {
        success: false,
        message: "챌린지 완료 처리 중 오류가 발생했습니다.",
        points_earned: 0,
        transaction_id: 0
      };
    }
  }

  // 활동 완료
  async completeActivity(
    activityType: string,
    distance: number,
    carbonSaved: number,
    points: number,
    route: string
  ): Promise<ActivityCompleteResponse> {
    const userId = this.getUserId();
    try {
      const response = await apiRequest<ActivityCompleteResponse>(`${API_URL}/api/credits/activity/complete`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          activity_type: activityType,
          distance: distance,
          carbon_saved: carbonSaved,
          points: points,
          route: route
        })
      });
      
      if (response.success) {
        // 로컬 크레딧 잔액 업데이트
        this.updateLocalBalance(points);
        
        // 다른 탭에 알림
        window.dispatchEvent(new CustomEvent('creditUpdated', { 
          detail: { 
            newBalance: this.getLocalBalance(), 
            change: points,
            reason: `${activityType} 활동 완료`
          } 
        }));
      }
      
      return response;
    } catch (error) {
      console.error("Error completing activity:", error);
      return {
        success: false,
        message: "활동 완료 처리 중 오류가 발생했습니다.",
        points_earned: 0,
        carbon_saved: 0,
        transaction_id: 0,
        mobility_log_id: 0
      };
    }
  }

  // 로컬 크레딧 잔액 업데이트
  private updateLocalBalance(amount: number): void {
    const currentBalance = this.getLocalBalance();
    const newBalance = currentBalance + amount;
    
    localStorage.setItem('credit_balance', newBalance.toString());
    localStorage.setItem('credit_last_update', new Date().toISOString());
  }

  // 로컬 크레딧 잔액 조회
  getLocalBalance(): number {
    const stored = localStorage.getItem('credit_balance');
    return stored ? parseInt(stored) : 1240; // 기본값
  }

  // 크레딧 데이터 새로고침
  async refreshCreditData() {
    const [balance, garden, totalPoints] = await Promise.all([
      this.getCreditBalance(),
      this.getGardenStatus(),
      this.getTotalPoints()
    ]);
    
    // 서버 데이터가 있으면 로컬 스토리지 업데이트
    if (balance) {
      localStorage.setItem('credit_balance', balance.total_points.toString());
      localStorage.setItem('credit_last_update', new Date().toISOString());
    }
    
    return { balance, garden, totalPoints };
  }

  // 모든 크레딧 데이터 초기화 (로그아웃 시)
  clearAllCreditData(): void {
    localStorage.removeItem('credit_balance');
    localStorage.removeItem('credit_last_update');
  }
}

export const creditService = new CreditService();