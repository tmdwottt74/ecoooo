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

export interface DatabaseStatus {
  status: string;
  database_type: string;
  database_url: string;
  timestamp: string;
}

export interface TableInfo {
  name: string;
  record_count: number | string;
  error?: string;
}

export interface DatabaseSummary {
  users: {
    total_count: number;
    active_users: number;
  };
  credits: {
    total_earned: number;
    total_spent: number;
    net_balance: number;
    transaction_count: number;
  };
  gardens: {
    total_count: number;
    levels_available: number;
  };
  mobility: {
    total_logs: number;
  };
  database_info: {
    type: string;
    url: string;
    connected: boolean;
  };
}

export interface UserCompleteData {
  user: {
    user_id: number;
    username: string;
    email: string;
    created_at: string;
  };
  credits: {
    total_balance: number;
    transactions: Array<{
      entry_id: number;
      type: string;
      points: number;
      reason: string;
      created_at: string;
      meta: any;
    }>;
  };
  garden: {
    garden_id: number | null;
    current_level: {
      level_id: number;
      level_number: number;
      level_name: string;
      image_path: string;
      required_waters: number;
    } | null;
    waters_count: number;
    total_waters: number;
    progress_percent: number;
  };
  mobility: Array<{
    log_id: number;
    mode: string;
    distance_km: number;
    started_at: string;
    ended_at: string;
    co2_saved_g: number;
    points_earned: number;
    description: string;
    start_point: string;
    end_point: string;
  }>;
}

export interface ExportData {
  export_timestamp: string;
  total_records: number;
  data: {
    users: any[];
    credits_ledger: any[];
    user_gardens: any[];
    garden_levels: any[];
    mobility_logs: any[];
  };
}

class DataService {
  private getUserId(): number {
    return parseInt(localStorage.getItem('userId') || '1');
  }

  // 데이터베이스 상태 확인
  async getDatabaseStatus(): Promise<DatabaseStatus> {
    try {
      const response = await apiRequest<DatabaseStatus>(`${API_URL}/api/database/status`);
      return response;
    } catch (error) {
      console.error("Error fetching database status:", error);
      throw error;
    }
  }

  // 데이터베이스 테이블 목록
  async getDatabaseTables(): Promise<TableInfo[]> {
    try {
      const response = await apiRequest<{ tables: TableInfo[] }>(`${API_URL}/api/database/tables`);
      return response.tables;
    } catch (error) {
      console.error("Error fetching database tables:", error);
      return [];
    }
  }

  // 데이터베이스 요약 정보
  async getDatabaseSummary(): Promise<DatabaseSummary> {
    try {
      const response = await apiRequest<DatabaseSummary>(`${API_URL}/api/database/summary`);
      return response;
    } catch (error) {
      console.error("Error fetching database summary:", error);
      throw error;
    }
  }

  // 사용자 완전 데이터
  async getUserCompleteData(userId?: number): Promise<UserCompleteData> {
    const targetUserId = userId || this.getUserId();
    try {
      const response = await apiRequest<UserCompleteData>(`${API_URL}/api/database/users/${targetUserId}/complete`);
      return response;
    } catch (error) {
      console.error("Error fetching user complete data:", error);
      throw error;
    }
  }

  // 모든 데이터 내보내기
  async exportAllData(): Promise<ExportData> {
    try {
      const response = await apiRequest<ExportData>(`${API_URL}/api/database/export/all`);
      return response;
    } catch (error) {
      console.error("Error exporting all data:", error);
      throw error;
    }
  }

  // 실시간 데이터 새로고침
  async refreshAllData(): Promise<{
    status: DatabaseStatus;
    summary: DatabaseSummary;
    userData: UserCompleteData;
  }> {
    try {
      const [status, summary, userData] = await Promise.all([
        this.getDatabaseStatus(),
        this.getDatabaseSummary(),
        this.getUserCompleteData()
      ]);

      return { status, summary, userData };
    } catch (error) {
      console.error("Error refreshing all data:", error);
      throw error;
    }
  }

  // 데이터 동기화 상태 확인
  async checkDataSync(): Promise<{
    isConnected: boolean;
    lastSync: string;
    dataIntegrity: boolean;
  }> {
    try {
      const status = await this.getDatabaseStatus();
      const summary = await this.getDatabaseSummary();
      
      return {
        isConnected: status.status === 'connected',
        lastSync: status.timestamp,
        dataIntegrity: summary.users.total_count > 0 && summary.credits.transaction_count > 0
      };
    } catch (error) {
      console.error("Error checking data sync:", error);
      return {
        isConnected: false,
        lastSync: new Date().toISOString(),
        dataIntegrity: false
      };
    }
  }

  // 데이터 백업 (로컬 스토리지)
  async backupToLocal(): Promise<boolean> {
    try {
      const exportData = await this.exportAllData();
      localStorage.setItem('ecooo_backup', JSON.stringify(exportData));
      localStorage.setItem('ecooo_backup_timestamp', new Date().toISOString());
      return true;
    } catch (error) {
      console.error("Error backing up data:", error);
      return false;
    }
  }

  // 로컬 백업에서 복원
  async restoreFromLocal(): Promise<ExportData | null> {
    try {
      const backupData = localStorage.getItem('ecooo_backup');
      const backupTimestamp = localStorage.getItem('ecooo_backup_timestamp');
      
      if (backupData && backupTimestamp) {
        return JSON.parse(backupData);
      }
      return null;
    } catch (error) {
      console.error("Error restoring from local backup:", error);
      return null;
    }
  }

  // 데이터 무결성 검사
  async validateDataIntegrity(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    try {
      const userData = await this.getUserCompleteData();
      const issues: string[] = [];

      // 사용자 데이터 검증
      if (!userData.user.user_id) {
        issues.push("사용자 ID가 없습니다");
      }

      // 크레딧 데이터 검증
      if (userData.credits.total_balance < 0) {
        issues.push("크레딧 잔액이 음수입니다");
      }

      // 정원 데이터 검증
      if (userData.garden.garden_id && userData.garden.waters_count < 0) {
        issues.push("물주기 횟수가 음수입니다");
      }

      return {
        isValid: issues.length === 0,
        issues
      };
    } catch (error) {
      console.error("Error validating data integrity:", error);
      return {
        isValid: false,
        issues: ["데이터 검증 중 오류가 발생했습니다"]
      };
    }
  }
}

export const dataService = new DataService();
