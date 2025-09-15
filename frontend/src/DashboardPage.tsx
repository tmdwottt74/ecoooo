// DashboardPage.tsx
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
import "./App.css";
import "./DashboardPage.css";

interface DashboardData {
  co2_saved_today: number;
  eco_credits_earned: number;
  garden_level: number;
  total_saved: number; // 누적 절약량
  total_points: number; // 누적 포인트
  last7days: { date: string; saved_g: number }[];
}

interface DailySaving {
  ymd: string;
  saved_g: number;
}

const COLORS = ["#1abc9c", "#16a085", "#f39c12", "#e74c3c"];

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [dailySaving, setDailySaving] = useState<DailySaving[]>([]);
  const [modeStats, setModeStats] = useState<{ name: string; value: number }[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  const userId = 1; // 예시 user_id

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 📌 요약 데이터
        const response = await fetch(`${API_URL}/dashboard/${userId}`);
        if (response.ok) {
          const result = await response.json();
          setData({
            ...result,
            total_saved: result.total_saved || 123.4, // 누적 절약량 (임시 기본값)
          });
        }

        // 📌 일별 절감량 (추가 API가 있다면 호출)
        const dailyRes = await fetch(
          `${API_URL}/mobility/stats/daily/${userId}`
        );
        if (dailyRes.ok) {
          const rows: DailySaving[] = await dailyRes.json();
          setDailySaving(
            rows.map((r) => ({
              ...r,
              ymd: new Date(r.ymd).toLocaleDateString("ko-KR", {
                month: "2-digit",
                day: "2-digit",
              }),
            }))
          );
        }

        // 📌 교통수단별 절감 비율 (현재는 더미 데이터)
        setModeStats([
          { name: "지하철", value: 60 },
          { name: "버스", value: 25 },
          { name: "자전거", value: 10 },
          { name: "도보", value: 5 },
        ]);
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  if (loading) return <p>불러오는 중...</p>;
  if (!data) return <p>데이터 불러오기 실패</p>;

  return (
    <div className="dashboard-container" style={{ padding: "2rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
        🌍 나의 에코 대시보드
      </h2>

      {/* 🌱 나만의 정원 카드 */}
      <div className="card garden-preview-card">
        <h4>🌱 나만의 정원</h4>
        <div className="garden-preview">
          <div className="garden-circle">
            <div className="garden-plant"></div>
          </div>
          <div className="garden-stats">
            <p>총 절감량: {data.total_saved} kg</p>
            <p>정원 레벨: Lv.{data.garden_level}</p>
          </div>
        </div>
        <p style={{ textAlign: "center", marginTop: "0.5rem" }}>
          <a
            href="/mygarden"
            style={{ color: "var(--primary-green)", fontWeight: 600 }}
          >
            👉 정원 보러가기
          </a>
        </p>
      </div>

      {/* 요약 카드 */}
      <div
        className="dashboard-grid"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        <div className="card">
          <h4>오늘 절약한 탄소</h4>
          <p className="metric">
            {data.co2_saved_today.toFixed(2)} <span>g</span>
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
      <h3 style={{ marginTop: "2rem" }}>📈 최근 7일 절감량 추이</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data.last7days}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="saved_g"
            stroke="#1abc9c"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* 🚋 교통수단 비율 */}
      <h3 style={{ marginTop: "2rem" }}>🚋 교통수단별 절감 비율</h3>
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
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      {/* AI 피드백 */}
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
              width: "65%",
              background: "#1abc9c",
              height: "100%",
              textAlign: "center",
              color: "#fff",
              fontSize: "0.8rem",
            }}
          >
            65%
          </div>
        </div>
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.9rem",
            color: "#7f8c8d",
          }}
        >
          그룹 챌린지: 100kg 절감 목표 중 65kg 달성!
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
