import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useCredits } from '../contexts/CreditsContext';
import PageHeader from '../components/PageHeader';
import "./Credit.css";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UserCredit {
  totalPoints: number;
  recentEarned: number;
  recentActivity: string;
}

const Credit: React.FC = () => {
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get("preview") === "1";
  const tabParam = new URLSearchParams(location.search).get("tab");
  const { creditsData, getCreditsHistory } = useCredits();

  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [creditsHistory, setCreditsHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [transportHistory, setTransportHistory] = useState<any[]>([]);
  const [transportLoading, setTransportLoading] = useState(false);

  // 실시간 크레딧 변경 애니메이션 상태
  const [creditChange, setCreditChange] = useState<{ amount: number, type: 'earn' | 'spend' | null }>({ amount: 0, type: null });
  const [showCreditAnimation, setShowCreditAnimation] = useState(false);

  // 페이지 진입 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // URL 파라미터에 따라 탭 설정
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // 크레딧 변경 이벤트 → 애니메이션
  useEffect(() => {
    const handleCreditUpdate = (event: CustomEvent) => {
      const { change } = event.detail;
      if (change !== 0) {
        setCreditChange({
          amount: Math.abs(change),
          type: change > 0 ? 'earn' : 'spend'
        });
        setShowCreditAnimation(true);

        setTimeout(() => {
          setShowCreditAnimation(false);
          setCreditChange({ amount: 0, type: null });
        }, 3000);
      }
    };

    window.addEventListener('creditUpdated', handleCreditUpdate as EventListener);
    return () => window.removeEventListener('creditUpdated', handleCreditUpdate as EventListener);
  }, []);

  // 크레딧 내역 가져오기
  const loadCreditsHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const history = await getCreditsHistory();
      setCreditsHistory(history);
      localStorage.setItem('credits_history', JSON.stringify(history)); // localStorage 저장
    } catch (error) {
      console.error('Failed to load credits history:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, [getCreditsHistory]);

  // localStorage에서 복원
  const loadCreditsHistoryFromStorage = () => {
    const stored = localStorage.getItem('credits_history');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored credits history:', error);
      }
    }
    return null;
  };

  // 교통수단 이용내역 가져오기
  const loadTransportHistory = async () => {
    setTransportLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8001/api/transport/history/1');
      if (response.ok) {
        const history = await response.json();
        setTransportHistory(history);
      }
    } catch (error) {
      console.error('Error loading transport history:', error);
    } finally {
      setTransportLoading(false);
    }
  };

  // 탭별 데이터 로드
  useEffect(() => {
    if (activeTab === 'history' || activeTab === 'recent') {
      const storedHistory = loadCreditsHistoryFromStorage();
      if (storedHistory) {
        setCreditsHistory(storedHistory);
      } else {
        loadCreditsHistory();
      }
    }
    if (activeTab === 'transport' || activeTab === 'overview') {
      loadTransportHistory();
    }
  }, [activeTab, loadCreditsHistory]);

  // 통합된 사용자 데이터 (Context에서 가져오기)
  const userInfo = {
    name: "김에코",
    group: "동국대학교",
    totalCredits: creditsData.totalCredits,
    totalSaving: `${creditsData.totalCarbonReduced}kg CO₂`,
  };

  // 미리보기 모드
  if (isPreview) {
    return (
      <div className="credit-preview">
        <div className="preview-header">
          <h3>💰 크레딧 현황</h3>
        </div>
        <div className="preview-user-info">
          <div className="preview-user-avatar">🌱</div>
          <div className="preview-user-details">
            <div className="preview-user-name">{userInfo.name} 님</div>
            <div className="preview-user-group">{userInfo.group}</div>
          </div>
        </div>
        <div className="preview-stats">
          <div className="preview-stat">
            <span className="stat-label">누적 크레딧</span>
            <span className="stat-value">{userInfo.totalCredits}P</span>
          </div>
          <div className="preview-stat">
            <span className="stat-label">누적 절감량</span>
            <span className="stat-value">{userInfo.totalSaving}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="credit-container">
      <PageHeader 
        title="Credit" 
        subtitle="나의 크레딧 현황과 탄소 절감 활동을 확인하세요"
        icon="💰"
      />

      {/* 탭 네비게이션 */}
      <div className="credit-tabs">
        <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 전체 현황</button>
        <button className={`tab-button ${activeTab === 'recent' ? 'active' : ''}`} onClick={() => setActiveTab('recent')}>📅 오늘 절약한 탄소</button>
        <button className={`tab-button ${activeTab === 'points' ? 'active' : ''}`} onClick={() => setActiveTab('points')}>📈 누적 절약량</button>
        <button className={`tab-button ${activeTab === 'transport' ? 'active' : ''}`} onClick={() => setActiveTab('transport')}>🚌 교통수단 이용내역</button>
        <button className={`tab-button ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>📋 최근 크레딧 내역</button>
      </div>

      {/* 사용자 요약 카드 */}
      <div className="user-summary-card">
        <div className="user-info-simple">
          <div className="user-avatar-simple">🌱</div>
          <div className="user-details">
            <h2 className="user-name-simple">{userInfo.name} 님</h2>
            <p className="user-group-simple">{userInfo.group}</p>
          </div>
        </div>
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-label-simple">누적 크레딧</span>
            <div className="credit-display-container">
              <span className={`stat-value-simple ${showCreditAnimation ? 'credit-updated' : ''}`}>
                {userInfo.totalCredits}C
              </span>
              {showCreditAnimation && (
                <div className={`credit-change-animation ${creditChange.type}`}>
                  {creditChange.type === 'earn' ? '+' : '-'}{creditChange.amount}
                </div>
              )}
            </div>
          </div>
          <div className="summary-stat">
            <span className="stat-label-simple">누적 절감량</span>
            <span className="stat-value-simple">{userInfo.totalSaving}</span>
          </div>
        </div>
      </div>

      {/* 탭별 콘텐츠 */}
      {activeTab === 'overview' && (
        <div className="overview-tab">
          <h3>📊 전체 현황</h3>
          <div className="summary-cards">
            <div className="summary-card">💰 총 크레딧: {creditsData.totalCredits}C</div>
            <div className="summary-card">🌱 총 절약량: {creditsData.totalCarbonReduced.toFixed(1)}kg</div>
            <div className="summary-card">🚌 이동 기록: {transportHistory.length}회</div>
          </div>
        </div>
      )}

      {activeTab === 'recent' && (
        <div className="tab-content">
          <h3>📅 오늘 절약한 탄소</h3>
          {transportHistory.length > 0 ? (
            transportHistory.slice(0, 5).map((trip, index) => (
              <div key={index}>{trip.transport_mode} {Math.round(trip.carbon_saved_kg * 1000)}g</div>
            ))
          ) : (
            <p>오늘의 교통수단 이용내역이 없습니다.</p>
          )}
        </div>
      )}

      {activeTab === 'points' && (
        <div className="tab-content">
          <h3>📈 누적 절약량</h3>
          <p>{creditsData.totalCarbonReduced.toFixed(1)} kg CO₂</p>
        </div>
      )}

      {activeTab === 'transport' && (
        <div className="tab-content">
          <h3>🚌 교통수단 이용내역</h3>
          {transportLoading ? (
            <p>불러오는 중...</p>
          ) : transportHistory.length > 0 ? (
            transportHistory.map((trip) => (
              <div key={trip.id}>
                {trip.transport_mode} - {trip.date} - {trip.distance_km}km - 절감 {trip.carbon_saved_kg}kg - +{trip.points_earned}C
              </div>
            ))
          ) : (
            <p>교통수단 이용내역이 없습니다.</p>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="tab-content">
          <h3>📋 최근 크레딧 내역</h3>
          <button 
            onClick={loadCreditsHistory} 
            disabled={historyLoading}
            className="refresh-button"
          >
            {historyLoading ? "새로고침 중..." : "🔄 새로고침"}
          </button>
          {creditsHistory.length > 0 ? (
            creditsHistory.map((item) => (
              <div key={item.entry_id}>
                {item.reason} - {item.points > 0 ? `+${item.points}` : item.points}C ({new Date(item.created_at).toLocaleString()})
              </div>
            ))
          ) : (
            <p>크레딧 내역이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Credit;
