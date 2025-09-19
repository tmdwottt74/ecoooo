import React, { useState, useEffect } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { dataService } from '../services/dataService';
import './DataManager.css';

interface DataManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DataManager: React.FC<DataManagerProps> = ({ isOpen, onClose }) => {
  const { 
    databaseStatus, 
    databaseSummary, 
    userCompleteData,
    isDataSynced,
    lastSyncTime,
    refreshAllData,
    checkDataSync,
    backupData,
    validateDataIntegrity
  } = useAppData();

  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'user' | 'export'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleRefresh = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      await refreshAllData();
      setMessage('✅ 데이터 새로고침 완료');
    } catch (error) {
      setMessage('❌ 데이터 새로고침 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const success = await backupData();
      if (success) {
        setMessage('✅ 데이터 백업 완료');
      } else {
        setMessage('❌ 데이터 백업 실패');
      }
    } catch (error) {
      setMessage('❌ 데이터 백업 오류');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const isValid = await validateDataIntegrity();
      if (isValid) {
        setMessage('✅ 데이터 무결성 검증 통과');
      } else {
        setMessage('⚠️ 데이터 무결성 문제 발견');
      }
    } catch (error) {
      setMessage('❌ 데이터 검증 오류');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="data-manager-overlay">
      <div className="data-manager-modal">
        <div className="data-manager-header">
          <h2>🗄️ 데이터 관리자</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="data-manager-tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            📊 개요
          </button>
          <button 
            className={activeTab === 'tables' ? 'active' : ''}
            onClick={() => setActiveTab('tables')}
          >
            📋 테이블
          </button>
          <button 
            className={activeTab === 'user' ? 'active' : ''}
            onClick={() => setActiveTab('user')}
          >
            👤 사용자
          </button>
          <button 
            className={activeTab === 'export' ? 'active' : ''}
            onClick={() => setActiveTab('export')}
          >
            📤 내보내기
          </button>
        </div>

        <div className="data-manager-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="status-cards">
                <div className="status-card">
                  <h3>🔗 연결 상태</h3>
                  <div className={`status-indicator ${isDataSynced ? 'connected' : 'disconnected'}`}>
                    {isDataSynced ? '연결됨' : '연결 끊김'}
                  </div>
                  {databaseStatus && (
                    <p>타입: {databaseStatus.database_type}</p>
                  )}
                </div>

                <div className="status-card">
                  <h3>👥 사용자</h3>
                  {databaseSummary && (
                    <>
                      <p>총 사용자: {databaseSummary.users.total_count}명</p>
                      <p>활성 사용자: {databaseSummary.users.active_users}명</p>
                    </>
                  )}
                </div>

                <div className="status-card">
                  <h3>💰 크레딧</h3>
                  {databaseSummary && (
                    <>
                      <p>총 적립: {databaseSummary.credits.total_earned.toLocaleString()}C</p>
                      <p>총 사용: {databaseSummary.credits.total_spent.toLocaleString()}C</p>
                      <p>순 잔액: {databaseSummary.credits.net_balance.toLocaleString()}C</p>
                    </>
                  )}
                </div>

                <div className="status-card">
                  <h3>🌿 정원</h3>
                  {databaseSummary && (
                    <>
                      <p>총 정원: {databaseSummary.gardens.total_count}개</p>
                      <p>레벨 수: {databaseSummary.gardens.levels_available}단계</p>
                    </>
                  )}
                </div>
              </div>

              <div className="sync-info">
                <h3>🔄 동기화 정보</h3>
                <p>마지막 동기화: {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : '없음'}</p>
                <p>상태: {isDataSynced ? '✅ 동기화됨' : '❌ 동기화 필요'}</p>
              </div>

              <div className="action-buttons">
                <button onClick={handleRefresh} disabled={isLoading}>
                  {isLoading ? '새로고침 중...' : '🔄 새로고침'}
                </button>
                <button onClick={handleBackup} disabled={isLoading}>
                  💾 백업
                </button>
                <button onClick={handleValidate} disabled={isLoading}>
                  🔍 검증
                </button>
              </div>

              {message && (
                <div className="message">
                  {message}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="tables-tab">
              <h3>📋 데이터베이스 테이블</h3>
              {databaseSummary && (
                <div className="table-list">
                  <div className="table-item">
                    <span className="table-name">users</span>
                    <span className="table-count">{databaseSummary.users.total_count}개 레코드</span>
                  </div>
                  <div className="table-item">
                    <span className="table-name">credits_ledger</span>
                    <span className="table-count">{databaseSummary.credits.transaction_count}개 레코드</span>
                  </div>
                  <div className="table-item">
                    <span className="table-name">user_gardens</span>
                    <span className="table-count">{databaseSummary.gardens.total_count}개 레코드</span>
                  </div>
                  <div className="table-item">
                    <span className="table-name">garden_levels</span>
                    <span className="table-count">{databaseSummary.gardens.levels_available}개 레코드</span>
                  </div>
                  <div className="table-item">
                    <span className="table-name">mobility_logs</span>
                    <span className="table-count">{databaseSummary.mobility.total_logs}개 레코드</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'user' && (
            <div className="user-tab">
              <h3>👤 사용자 상세 정보</h3>
              {userCompleteData && (
                <div className="user-details">
                  <div className="user-info">
                    <h4>기본 정보</h4>
                    <p>이름: {userCompleteData.user.username}</p>
                    <p>이메일: {userCompleteData.user.email}</p>
                    <p>가입일: {new Date(userCompleteData.user.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="user-credits">
                    <h4>크레딧 정보</h4>
                    <p>총 잔액: {userCompleteData.credits.total_balance.toLocaleString()}C</p>
                    <p>거래 수: {userCompleteData.credits.transactions.length}회</p>
                  </div>

                  <div className="user-garden">
                    <h4>정원 정보</h4>
                    {userCompleteData.garden.current_level ? (
                      <>
                        <p>현재 레벨: {userCompleteData.garden.current_level.level_name}</p>
                        <p>물주기: {userCompleteData.garden.waters_count}/{userCompleteData.garden.current_level.required_waters}</p>
                        <p>진행률: {userCompleteData.garden.progress_percent}%</p>
                      </>
                    ) : (
                      <p>정원이 없습니다</p>
                    )}
                  </div>

                  <div className="user-mobility">
                    <h4>모빌리티 활동</h4>
                    <p>총 활동: {userCompleteData.mobility.length}회</p>
                    {userCompleteData.mobility.length > 0 && (
                      <div className="mobility-list">
                        {userCompleteData.mobility.slice(0, 5).map((log, index) => (
                          <div key={index} className="mobility-item">
                            <span>{log.mode}</span>
                            <span>{log.distance_km}km</span>
                            <span>{log.points_earned}C</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="export-tab">
              <h3>📤 데이터 내보내기</h3>
              <div className="export-options">
                <button onClick={handleBackup} disabled={isLoading}>
                  💾 로컬 백업
                </button>
                <button onClick={async () => {
                  try {
                    const data = await dataService.exportAllData();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ecooo_data_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setMessage('✅ 데이터 다운로드 완료');
                  } catch (error) {
                    setMessage('❌ 데이터 다운로드 실패');
                  }
                }}>
                  📥 JSON 다운로드
                </button>
              </div>
              
              <div className="export-info">
                <h4>내보내기 정보</h4>
                {databaseSummary && (
                <p>총 레코드 수: {Object.values(databaseSummary).reduce((sum: number, val: any) => {
                  if (typeof val === 'object' && val !== null) {
                    return sum + Object.values(val).reduce((subSum: number, subVal: any) => 
                      typeof subVal === 'number' ? subSum + subVal : subSum, 0);
                  }
                  return sum;
                }, 0)}개</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataManager;
