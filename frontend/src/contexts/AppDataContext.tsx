import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { creditService, CreditBalance, GardenStatus } from '../services/creditService';
import { dashboardService, DashboardStats, MobilityLog, DailyStats } from '../services/dashboardService';
import { sessionService } from '../services/sessionService';
import { dataService, DatabaseSummary, UserCompleteData, DatabaseStatus } from '../services/dataService';
import { useLoading } from './LoadingContext';

interface AppDataContextType {
  // 데이터베이스 상태
  databaseStatus: DatabaseStatus | null;
  databaseSummary: DatabaseSummary | null;
  userCompleteData: UserCompleteData | null;
  
  // 크레딧 데이터
  creditBalance: CreditBalance | null;
  gardenStatus: GardenStatus | null;
  totalPoints: number;
  
  // 대시보드 데이터
  dashboardStats: DashboardStats | null;
  recentActivities: MobilityLog[];
  dailyStats: DailyStats[];
  
  // 로딩 상태
  isLoading: boolean;
  isRefreshing: boolean;
  
  // 데이터 동기화 상태
  isDataSynced: boolean;
  lastSyncTime: string | null;
  
  // 액션 함수들
  refreshAllData: () => Promise<void>;
  updateCreditBalance: (newBalance: CreditBalance) => void;
  updateGardenStatus: (newStatus: GardenStatus) => void;
  updateDashboardStats: (newStats: DashboardStats) => void;
  addRecentActivity: (activity: MobilityLog) => void;
  
  // 실시간 업데이트
  startRealTimeUpdates: () => void;
  stopRealTimeUpdates: () => void;
  
  // 데이터 관리
  checkDataSync: () => Promise<void>;
  backupData: () => Promise<boolean>;
  validateDataIntegrity: () => Promise<boolean>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

interface AppDataProviderProps {
  children: ReactNode;
}

export const AppDataProvider: React.FC<AppDataProviderProps> = ({ children }) => {
  const { showLoading, hideLoading } = useLoading();
  
  // 데이터베이스 상태
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null);
  const [databaseSummary, setDatabaseSummary] = useState<DatabaseSummary | null>(null);
  const [userCompleteData, setUserCompleteData] = useState<UserCompleteData | null>(null);
  
  // 크레딧 데이터
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [gardenStatus, setGardenStatus] = useState<GardenStatus | null>(null);
  const [totalPoints, setTotalPoints] = useState<number>(0); // 서버에서만 가져옴
  
  // 대시보드 데이터
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<MobilityLog[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // 데이터 동기화 상태
  const [isDataSynced, setIsDataSynced] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  // 실시간 업데이트 상태
  const [realTimeInterval, setRealTimeInterval] = useState<NodeJS.Timeout | null>(null);

  // 모든 데이터 새로고침
  const refreshAllData = async () => {
    try {
      setIsRefreshing(true);
      showLoading('데이터를 새로고침하는 중...');
      
      // 통합 데이터 새로고침
      const { status, summary, userData } = await dataService.refreshAllData();
      
      setDatabaseStatus(status);
      setDatabaseSummary(summary);
      setUserCompleteData(userData);
      
      // 개별 서비스 데이터도 새로고침
      const [creditData, dashboardData] = await Promise.all([
        creditService.refreshCreditData(),
        dashboardService.refreshDashboardData()
      ]);
      
      if (creditData.balance) {
        setCreditBalance(creditData.balance);
        setTotalPoints(creditData.balance.total_points);
      }
      
      if (creditData.garden) {
        setGardenStatus(creditData.garden);
      }
      
      if (dashboardData.stats) {
        setDashboardStats(dashboardData.stats);
      }
      
      if (dashboardData.recentActivities) {
        setRecentActivities(dashboardData.recentActivities);
      }
      
      if (dashboardData.dailyStats) {
        setDailyStats(dashboardData.dailyStats);
      }
      
      setIsDataSynced(true);
      setLastSyncTime(new Date().toISOString());
      
    } catch (error) {
      console.error('데이터 새로고침 오류:', error);
      setIsDataSynced(false);
    } finally {
      setIsRefreshing(false);
      hideLoading();
    }
  };

  // 크레딧 잔액 업데이트
  const updateCreditBalance = (newBalance: CreditBalance) => {
    setCreditBalance(newBalance);
    setTotalPoints(newBalance.total_points);
  };

  // 정원 상태 업데이트
  const updateGardenStatus = (newStatus: GardenStatus) => {
    setGardenStatus(newStatus);
  };

  // 대시보드 통계 업데이트
  const updateDashboardStats = (newStats: DashboardStats) => {
    setDashboardStats(newStats);
  };

  // 최근 활동 추가
  const addRecentActivity = (activity: MobilityLog) => {
    setRecentActivities(prev => [activity, ...prev.slice(0, 9)]); // 최대 10개 유지
  };

  // 실시간 업데이트 시작
  const startRealTimeUpdates = () => {
    if (realTimeInterval) return; // 이미 실행 중이면 무시
    
    const interval = setInterval(async () => {
      try {
        // 데이터 동기화 상태 확인
        const syncStatus = await dataService.checkDataSync();
        setIsDataSynced(syncStatus.isConnected && syncStatus.dataIntegrity);
        setLastSyncTime(syncStatus.lastSync);
        
        // 주기적으로 데이터 새로고침 (5분마다)
        if (Date.now() % (5 * 60 * 1000) < 1000) { // 5분마다
          await refreshAllData();
        }
      } catch (error) {
        console.error('실시간 업데이트 오류:', error);
        setIsDataSynced(false);
      }
    }, 30000); // 30초마다 체크
    
    setRealTimeInterval(interval);
  };

  // 실시간 업데이트 중지
  const stopRealTimeUpdates = () => {
    if (realTimeInterval) {
      clearInterval(realTimeInterval);
      setRealTimeInterval(null);
    }
  };

  // 데이터 동기화 상태 확인
  const checkDataSync = async () => {
    try {
      const syncStatus = await dataService.checkDataSync();
      setIsDataSynced(syncStatus.isConnected && syncStatus.dataIntegrity);
      setLastSyncTime(syncStatus.lastSync);
    } catch (error) {
      console.error('데이터 동기화 확인 오류:', error);
      setIsDataSynced(false);
    }
  };

  // 데이터 백업
  const backupData = async (): Promise<boolean> => {
    try {
      const success = await dataService.backupToLocal();
      if (success) {
        console.log('데이터 백업 완료');
      }
      return success;
    } catch (error) {
      console.error('데이터 백업 오류:', error);
      return false;
    }
  };

  // 데이터 무결성 검증
  const validateDataIntegrity = async (): Promise<boolean> => {
    try {
      const validation = await dataService.validateDataIntegrity();
      if (!validation.isValid) {
        console.warn('데이터 무결성 문제:', validation.issues);
      }
      return validation.isValid;
    } catch (error) {
      console.error('데이터 무결성 검증 오류:', error);
      return false;
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        await refreshAllData();
        
        // 실시간 업데이트 시작
        startRealTimeUpdates();
        
        // 데이터 백업
        await backupData();
        
      } catch (error) {
        console.error('초기 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    // 컴포넌트 언마운트 시 정리
    return () => {
      stopRealTimeUpdates();
    };
  }, []);

  // 크레딧 업데이트 이벤트 리스너
  useEffect(() => {
    const handleCreditUpdate = (event: CustomEvent) => {
      const { newBalance, change, reason } = event.detail;
      
      // 크레딧 잔액 업데이트
      if (creditBalance) {
        const updatedBalance = {
          ...creditBalance,
          total_points: newBalance,
          last_updated: new Date().toISOString()
        };
        updateCreditBalance(updatedBalance);
      }
      
      // 데이터 새로고침 (선택적)
      if (reason && reason.includes('정원')) {
        refreshAllData();
      }
    };

    window.addEventListener('creditUpdated', handleCreditUpdate as EventListener);
    return () => window.removeEventListener('creditUpdated', handleCreditUpdate as EventListener);
  }, [creditBalance]);

  const value: AppDataContextType = {
    // 데이터베이스 상태
    databaseStatus,
    databaseSummary,
    userCompleteData,
    
    // 크레딧 데이터
    creditBalance,
    gardenStatus,
    totalPoints,
    
    // 대시보드 데이터
    dashboardStats,
    recentActivities,
    dailyStats,
    
    // 로딩 상태
    isLoading,
    isRefreshing,
    
    // 데이터 동기화 상태
    isDataSynced,
    lastSyncTime,
    
    // 액션 함수들
    refreshAllData,
    updateCreditBalance,
    updateGardenStatus,
    updateDashboardStats,
    addRecentActivity,
    
    // 실시간 업데이트
    startRealTimeUpdates,
    stopRealTimeUpdates,
    
    // 데이터 관리
    checkDataSync,
    backupData,
    validateDataIntegrity,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};