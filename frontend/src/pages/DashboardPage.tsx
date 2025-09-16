import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../App.css";
import "./DashboardPage.css";

// 📌 타입 정의
interface DailySaving {
  date: string;
  saved_g: number;
}

interface ModeStat {
  name: string;
  value: number;
}

interface Challenge {
  goal: number;
  progress: number;
}

interface DashboardData {
  co2_saved_today: number; // 오늘 절약량 (g)
  eco_credits_earned: number; // 오늘 획득 포인트
  garden_level: number; // 정원 레벨
  total_saved: number; // 누적 절약량 (kg)
  total_points: number; // 누적 포인트
  last7days: DailySaving[];
  modeStats: { mode: string; saved_g: number }[];
  challenge: Challenge;
}

const COLORS = ["#1abc9c", "#16a085", "#f39c12", "#e74c3c"];

// ✅ 샘플 데이터 (컴포넌트 바깥으로 이동)
const SAMPLE: DashboardData = {
  co2_saved_today: 0,
  eco_credits_earned: 0,
  garden_level: 1,
  total_saved: 0,
  total_points: 0,
  last7days: [],
  modeStats: [],
  challenge: { goal: 10, progress: 0 },
};

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [dailySaving, setDailySaving] = useState<DailySaving[]>([]);
  const [modeStats, setModeStats] = useState<ModeStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  const userId = 1; // 실제 로그인 사용자 ID로 대체 필요

  // ✅ 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/dashboard/${userId}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);

          if (result.last7days) {
            setDailySaving(
              result.last7days.map((item: any) => ({
                date: new Date(item.date).toLocaleDateString("ko-KR", {
                  month: "2-digit",
                  day: "2-digit",
                }),
                saved_g: Number(item.saved_g) || 0,
              }))
            );
          }

          if (result.modeStats) {
            setModeStats(
              result.modeStats.map((item: any) => ({
                name: item.mode,
                value: Number(item.saved_g) || 0,
              }))
            );
          }
        } else {
          console.warn("Dashboard API 응답 없음, 샘플 데이터 사용");
          setData(SAMPLE);   // 응답 실패 시 샘플 사용
          setError(null);
        }
      } catch (e) {
        console.error("Dashboard API fetch error:", e);
        setData(SAMPLE);     // 네트워크 실패 시 샘플 사용
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]); // ✅ SAMPLE은 의존성 배열에 넣을 필요 없음

  // ✅ 활동 기록 버튼
  const handleLogActivity = async (activityType: "subway" | "bike") => {
    try {
      const response = await fetch(`${API_URL}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          activity_type: activityType,
        }),
      });

      if (!response.ok) throw new Error("활동 기록 실패");
      const result = await response.json();
      setData(result); // 새로운 데이터 반영
    } catch (error) {
      console.error("Error logging activity:", error);
      setError("활동 기록에 실패했습니다.");
    }
  };

  // ✅ 상태 처리
  if (loading) return <p>불러오는 중...</p>;
  if (error) return <p>{error}</p>;
  if (!data) {
    return (
      <div className="dashboard-container">
        <h2>🌍 나의 에코 대시보드</h2>
        <p>데이터를 불러오지 못했습니다. (샘플 보기)</p>
        {/* 샘플 카드 */}
        <div className="dashboard-grid">
          <div className="card"><h4>오늘 절약한 탄소</h4><p className="metric">2.3 g</p></div>
          <div className="card"><h4>누적 절약량</h4><p className="metric">56.7 kg</p></div>
          <div className="card"><h4>에코 크레딧</h4><p className="metric">1,240 P</p></div>
          <div className="card"><h4>정원 레벨</h4><p className="metric">Lv.3 🌱</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ padding: "2rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
        🌍 나의 에코 대시보드
      </h2>
      
      {/* 요약 카드 */}
      <div
        className="dashboard-grid"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        <div className="card">
          <h4>오늘 절약한 탄소</h4>
          <p className="metric">
            {data.co2_saved_today?.toFixed(2)} <span>g</span>
          </p>
        </div>
        <div className="card">
          <h4>누적 절약량</h4>
          <p className="metric">
            {data.total_saved} <span>kg</span>
          </p>
        </div>
        <div className="card">
          <h4>에코 크레딧</h4>
          <p className="metric">
            {data.eco_credits_earned} <span>P</span>
          </p>
        </div>
        <div className="card">
          <h4>정원 레벨</h4>
          <p className="metric">Lv. {data.garden_level}</p>
        </div>
      </div>

      {/* 📈 최근 7일 절감량 */}
      <div style={{ marginTop: "2rem" }}>
        <h4>📈 최근 7일 절감량 추이</h4>
        {dailySaving.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySaving}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="saved_g"
                stroke="#82ca9d"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>일별 절감량 데이터가 없습니다.</p>
        )}
      </div>

      {/* 🚋 교통수단 비율 */}
      <h3 style={{ marginTop: "2rem" }}>🚋 교통수단별 절감 비율</h3>
      {modeStats.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={modeStats}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {modeStats.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p>교통수단 데이터가 없습니다.</p>
      )}

      {/* 🌱 AI 피드백 */}
      <div
        className="ai-feedback"
        style={{
          marginTop: "2rem",
          fontSize: "1.2rem",
          background: "#f8f9fa",
          padding: "1rem",
          borderRadius: "10px",
          textAlign: "center",
        }}
      >
        {data.co2_saved_today > 5
          ? "이번 주 아주 잘하고 있어요 👏"
          : "조금 더 노력해볼까요? 🌱"}
        <br />
        목표까지 200g 남았어요 💪
      </div>

      {/* 🔥 챌린지 진행 상황 */}
      <div style={{ marginTop: "2rem" }}>
        <h4>🔥 챌린지 진행 상황</h4>
        <div
          style={{
            background: "#ecf0f1",
            borderRadius: "10px",
            overflow: "hidden",
            height: "20px",
          }}
        >
          <div
            style={{
              width: `${
                (data.challenge.progress / data.challenge.goal) * 100
              }%`,
              background: "#1abc9c",
              height: "100%",
              textAlign: "center",
              color: "#fff",
              fontSize: "0.8rem",
            }}
          >
            {Math.round(
              (data.challenge.progress / data.challenge.goal) * 100
            )}
            %
          </div>
        </div>
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.9rem",
            color: "#7f8c8d",
          }}
        >
          그룹 챌린지: {data.challenge.goal}kg 절감 목표 중{" "}
          {data.challenge.progress}kg 달성!
        </p>
      </div>

      {/* 🚀 활동 기록 버튼 */}
      <div
        className="activity-logger"
        style={{ marginTop: "2rem", textAlign: "center" }}
      >
        <h4>활동 기록하기</h4>
        <button
          onClick={() => handleLogActivity("subway")}
          style={{ margin: "0 10px", padding: "10px 16px" }}
        >
          지하철 타기 (+150P)
        </button>
        <button
          onClick={() => handleLogActivity("bike")}
          style={{ margin: "0 10px", padding: "10px 16px" }}
        >
          자전거 타기 (+80P)
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
