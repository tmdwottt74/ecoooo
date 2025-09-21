// 대시보드 관리 서비스
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export interface DashboardStats {
  user_id: number;
  total_points: number;
  total_co2_saved: number;
  recent_activities: number;
  garden_level: number;
  garden_progress: number;
}

export interface MobilityLog {
  log_id: number;
  mode: string;
  distance_km: number;
  started_at: string;
  ended_at: string;
  co2_saved_g: number;
  points_earned: number;
  description?: string;
  start_point?: string;
  end_point?: string;
}

export interface DailyStats {
  date: string;
  co2_saved: number;
  points_earned: number;
  activities_count: number;
}

class DashboardService {
  private userId: string;

  constructor() {
    this.userId = localStorage.getItem('userId') || '1';
  }

  // 대시보드 통계 조회
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/stats/${this.userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('대시보드 통계 조회 실패:', error);
      // 기본값 반환
      return {
        user_id: parseInt(this.userId),
        total_points: 1240,
        total_co2_saved: 18.5,
        recent_activities: 5,
        garden_level: 3,
        garden_progress: 8
      };
    }
  }

  // 최근 활동 조회
  async getRecentActivities(limit: number = 10): Promise<MobilityLog[]> {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/activities/${this.userId}?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('최근 활동 조회 실패:', error);
      return [];
    }
  }

  // 일일 통계 조회
  async getDailyStats(days: number = 7): Promise<DailyStats[]> {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/daily-stats/${this.userId}?days=${days}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('일일 통계 조회 실패:', error);
      // 기본값 반환
      const today = new Date();
      return Array.from({ length: days }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          co2_saved: Math.random() * 2 + 0.5,
          points_earned: Math.floor(Math.random() * 100) + 50,
          activities_count: Math.floor(Math.random() * 5) + 1
        };
      }).reverse();
    }
  }

  // 활동 기록 (이동 로그 생성)
  async logActivity(activityData: {
    mode: string;
    distance_km: number;
    start_point?: string;
    end_point?: string;
    description?: string;
  }): Promise<MobilityLog> {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/log-activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(this.userId),
          ...activityData
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('활동 기록 실패:', error);
      throw error;
    }
  }

  // 대시보드 데이터 새로고침 (모든 탭에서 사용)
  async refreshDashboardData(): Promise<{
    stats: DashboardStats;
    recentActivities: MobilityLog[];
    dailyStats: DailyStats[];
  }> {
    try {
      const [stats, recentActivities, dailyStats] = await Promise.all([
        this.getDashboardStats(),
        this.getRecentActivities(),
        this.getDailyStats()
      ]);

      return {
        stats,
        recentActivities,
        dailyStats
      };
    } catch (error) {
      console.error('대시보드 데이터 새로고침 실패:', error);
      throw error;
    }
  }

  // 실시간 데이터 업데이트 (WebSocket 또는 폴링)
  async startRealTimeUpdates(callback: (data: any) => void, interval: number = 30000): Promise<NodeJS.Timeout> {
    const updateData = async () => {
      try {
        const data = await this.refreshDashboardData();
        callback(data);
      } catch (error) {
        console.error('실시간 업데이트 실패:', error);
      }
    };

    // 즉시 한 번 실행
    await updateData();

    // 주기적으로 업데이트
    return setInterval(updateData, interval);
  }

  // 실시간 업데이트 중지
  stopRealTimeUpdates(intervalId: NodeJS.Timeout): void {
    clearInterval(intervalId);
  }
}

export const dashboardService = new DashboardService();

