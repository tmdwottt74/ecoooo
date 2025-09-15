import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

// 백엔드 Pydantic 모델과 일치하도록 user_id 타입을 number로 수정
interface DashboardData {
  user_id: number; // string -> number
  co2_saved_today: number;
  eco_credits_earned: number;
  garden_level: number;
}

interface DailySaving {
  date: string;
  saved_g: number;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [dailySaving, setDailySaving] = useState<DailySaving[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 백엔드 user_id 타입에 맞춰 number로 변경. 실제로는 로그인 상태를 관리하는 로직 필요
  const userId = 1; // Number로 변경

  const BACKEND_URL = 'http://127.0.0.1:8001'; // 백엔드 포트 8001로 수정

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 📌 대시보드 데이터
      const response = await fetch(`${BACKEND_URL}/dashboard/${userId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const result: DashboardData = await response.json();
      setData(result);

      // 📌 일별 절감량 데이터 (백엔드 API 엔드포인트 확인 후 수정)
      const dailyRes = await fetch(`${BACKEND_URL}/mobility_logs/stats/daily/${userId}`);
      if (dailyRes.ok) {
        const rows = await dailyRes.json();
        // 날짜 형식 변환 (예: 2025-09-15T00:00:00 -> 2025-09-15)
        const formattedData = rows.map((item: any) => ({
          date: new Date(item.ymd).toLocaleDateString(),
          saved_g: item.saved_g
        }));
        setDailySaving(formattedData);
      }
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
  }, []);

  const handleLogActivity = async (activityType: 'subway' | 'bike') => {
    try {
      const response = await fetch(`${BACKEND_URL}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          activity_type: activityType,
        }),
      });

      if (!response.ok) throw new Error('Failed to log activity');
      const result: DashboardData = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const renderContent = () => {
    if (isLoading) return <p>데이터를 불러오는 중...</p>;
    if (error) return <p>{error}</p>;
    if (!data) return null;

    return (
      <>
        {/* 요약 카드 */}
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

        {/* 일별 절감량 차트 */}
        <div style={{ marginTop: "2rem" }}>
          <h4>최근 7일 절감량</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySaving}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="saved_g" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI 피드백 */}
        <div className="ai-feedback" style={{ marginTop: "2rem", fontSize: "1.2rem" }}>
          이번 주 {data.co2_saved_today > 5 ? "아주 잘하고 있어요 👏" : "조금 더 노력해볼까요? 🌱"}
        </div>

        {/* 활동 기록 */}
        <div className="activity-logger">
          <h4>활동 기록하기</h4>
          <button onClick={() => handleLogActivity('subway')}>지하철 타기 (+150P)</button>
          <button onClick={() => handleLogActivity('bike')}>자전거 타기 (+80P)</button>
        </div>
      </>
    );
  };

  return (
    <div className="dashboard-container" style={{ padding: "2rem" }}>
      <h3>대시보드</h3>
      {renderContent()}
    </div>
  );
};

export default Dashboard;