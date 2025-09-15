import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

// 📌 백엔드 응답 타입 정의
interface DashboardData {
  user_id: number;
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

  // 실제 로그인된 user_id를 받아야 하지만, 지금은 하드코딩
  const userId = 1;

  // ✅ uvicorn 실행 포트 및 URL 통일
  const BACKEND_URL = 'http://127.0.0.1:8000';

  // 데이터 불러오기
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 📌 대시보드 데이터
      const response = await fetch(`${BACKEND_URL}/dashboard/${userId}`);
      if (!response.ok) throw new Error('대시보드 데이터 불러오기 실패');
      const result: DashboardData = await response.json();
      setData(result);

      // 📌 일별 절감량 데이터 (API_URL 대신 BACKEND_URL 사용)
      // 백엔드 엔드포인트는 /v_daily_saving을 가정
      const dailyRes = await fetch(`${BACKEND_URL}/mobility/stats/daily/${userId}`);
      if (dailyRes.ok) {
        const rows = await dailyRes.json();

        // rows: [{ ymd: "2025-09-10", saved_g: 120 }, ...]
        const formattedData: DailySaving[] = rows.map((item: any) => ({
          date: new Date(item.ymd).toLocaleDateString("ko-KR", {
            month: "2-digit",
            day: "2-digit",
          }),
          saved_g: Number(item.saved_g) || 0,
        }));

        setDailySaving(formattedData);
      }
    } catch (e) {
      if (e instanceof Error) {
        setError('데이터를 불러오는 데 실패했습니다. 백엔드 서버 및 DB 연결을 확인하세요.');
      }
      console.error("Failed to fetch dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // 활동 기록 (버튼 클릭 시)
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

      if (!response.ok) throw new Error('활동 기록 실패');
      const result: DashboardData = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 화면 렌더링
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
            <p className="metric">{data.co2_saved_today.toFixed(2)} <span>g</span></p>
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
        <h3 style={{ marginTop: "2rem" }}>📈 최근 7일 절감량 추이</h3>
        {dailySaving && dailySaving.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySaving}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis dataKey="saved_g" />
              <Tooltip />
              <Line type="monotone" dataKey="saved_g" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          // Display a message or a placeholder if no data is available
          <p>데이터가 없습니다.</p>
        )}
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