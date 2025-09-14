import React, { useState, useEffect } from 'react';

// 이 구조는 백엔드의 Pydantic 모델과 일치해야 합니다
interface DashboardData {
  user_id: string;
  co2_saved_today: number;
  eco_credits_earned: number;
  garden_level: number;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const userId = 'prototype_user'; // 프로토타입을 위해 고정된 user_id 사용

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/dashboard/${userId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result: DashboardData = await response.json();
      setData(result);
    } catch (e) {
      if (e instanceof Error) {
        setError('데이터를 불러오는 데 실패했습니다. 백엔드 서버 및 DB가 실행 중인지 확인해주세요.');
      }
      console.error("Failed to fetch dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // 빈 의존성 배열은 이 effect가 한 번만 실행되도록 보장합니다

  const handleLogActivity = async (activityType: 'subway' | 'bike') => {
    try {
      const response = await fetch('http://127.0.0.1:8000/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          activity_type: activityType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log activity');
      }

      const result: DashboardData = await response.json();
      setData(result); // 백엔드로부터 받은 새 데이터로 대시보드를 업데이트합니다
    } catch (error) {
      console.error("Error logging activity:", error);
      // 필요한 경우 사용자에게 오류 메시지를 표시합니다
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <p>데이터를 불러오는 중...</p>;
    }

    if (error) {
      return <p>{error}</p>;
    }

    if (data) {
      return (
        <>
          <div className="dashboard-grid">
            <div className="card">
              <h4>오늘 절약한 탄소</h4>
              <p className="metric">{data.co2_saved_today.toFixed(2)} <span>kg</span></p>
            </div>
            <div className="card">
              <h4>획득한 에코 크레딧</h4>
              <p className="metric">{data.eco_credits_earned} <span>P</span></p>
            </div>
            <div className="card">
              <h4>나만의 정원 레벨</h4>
              <p className="metric">Lv. {data.garden_level}</p>
            </div>
          </div>
          <div className="activity-logger">
            <h4>활동 기록하기</h4>
            <button onClick={() => handleLogActivity('subway')}>지하철 타기 (+150P)</button>
            <button onClick={() => handleLogActivity('bike')}>자전거 타기 (+80P)</button>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="dashboard-container">
      <h3>대시보드</h3>
      {renderContent()}
    </div>
  );
};

export default Dashboard;