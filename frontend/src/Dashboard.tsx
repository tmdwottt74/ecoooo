import React, { useState, useEffect } from 'react';
import MyGarden from './MyGarden';

// This should match the Pydantic model in the backend
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

  const userId = 'prototype_user'; // Using a fixed user_id for the prototype

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
  }, []); // The empty dependency array ensures this effect runs only once

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
      setData(result); // Update dashboard with the new data from the backend
    } catch (error) {
      console.error("Error logging activity:", error);
      // Optionally, show an error message to the user
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
          {data && <MyGarden totalCarbonReduced={data.co2_saved_today} />}
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