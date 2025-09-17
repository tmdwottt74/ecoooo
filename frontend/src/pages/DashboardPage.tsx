import React, { useState, useEffect } from "react";
import "../App.css";
import "./DashboardPage.css";

// 📌 타입 정의
interface DailySaving {
  date: string;
  saved_g: number;
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

// ✅ 통합된 더미 데이터
const UNIFIED_DATA: DashboardData = {
  co2_saved_today: 1850,
  eco_credits_earned: 185,
  garden_level: 3,
  total_saved: 18.5,
  total_points: 1240,
  last7days: [
    { date: "01/09", saved_g: 1200 },
    { date: "01/10", saved_g: 1500 },
    { date: "01/11", saved_g: 1800 },
    { date: "01/12", saved_g: 1600 },
    { date: "01/13", saved_g: 1900 },
    { date: "01/14", saved_g: 1700 },
    { date: "01/15", saved_g: 1850 },
  ],
  modeStats: [
    { mode: "지하철", saved_g: 8500 },
    { mode: "자전거", saved_g: 4200 },
    { mode: "버스", saved_g: 2800 },
    { mode: "도보", saved_g: 1500 },
  ],
  challenge: { goal: 20, progress: 18.5 },
};

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  const userId = 1; // 실제 로그인 사용자 ID로 대체 필요

  // ✅ 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/dashboard/${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          console.warn("Dashboard API 응답 없음, 더미 데이터 사용");
          setData(UNIFIED_DATA);
        }
      } catch (e) {
        console.warn("Dashboard API 연결 실패, 더미 데이터 사용:", e);
        setData(UNIFIED_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, userId]);

  // ✅ 활동 기록 버튼 (더미 데이터로 작동)
  const handleLogActivity = async (activityType: "subway" | "bike") => {
    try {
      const points = activityType === "subway" ? 150 : 80;
      const co2Saved = activityType === "subway" ? 1.5 : 0.8;

      if (data) {
        const updatedData = {
          ...data,
          co2_saved_today: data.co2_saved_today + co2Saved * 1000,
          eco_credits_earned: data.eco_credits_earned + points,
          total_saved: data.total_saved + co2Saved,
          total_points: data.total_points + points,
        };
        setData(updatedData);

        alert(`${activityType === "subway" ? "지하철" : "자전거"} 이용이 기록되었습니다! +${points}P`);
      }
    } catch (err) {
      console.error("Error logging activity:", err);
      setError("활동 기록에 실패했습니다.");
    }
  };

  // ✅ 상태 처리
  if (loading) {
    return (
      <div className="dashboard-container" style={{ padding: "2rem", textAlign: "center" }}>
        <h2>📊 내 대시보드</h2>
        <p style={{ marginTop: "1rem", color: "#6b7280" }}>데이터를 불러오는 중...</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="dashboard-container">
        <h2>📊 내 대시보드</h2>
        <p>데이터를 불러오지 못했습니다. (샘플 보기)</p>
        {/* 샘플 카드 */}
        <div className="dashboard-grid">
        <div className="card"><h4>오늘 절약한 탄소</h4><p className="metric">1.85 g</p></div>
        <div className="card"><h4>누적 절약량</h4><p className="metric">18.5 kg</p></div>
          <div className="card"><h4>에코 크레딧</h4><p className="metric">1,240 P</p></div>
          <div className="card"><h4>정원 레벨</h4><p className="metric">Lv.3 🌱</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ padding: "2rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "3rem" }}>
        📊 내 대시보드
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
            {data.total_points} <span>P</span>
          </p>
        </div>
        <div className="card">
          <h4>정원 레벨</h4>
          <p className="metric">Lv. {data.garden_level}</p>
        </div>
      </div>

      {/* 📈 최근 7일 절감량 */}
      <div style={{ marginTop: "2rem" }}>
        <h4 style={{ fontSize: "1.3rem", marginBottom: "1.5rem" }}>📈 최근 7일 절감량 추이</h4>
        <div style={{ 
          background: "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)", 
          padding: "2.5rem", 
          borderRadius: "20px",
          border: "1px solid rgba(26, 188, 156, 0.1)",
          boxShadow: "0 8px 25px rgba(26, 188, 156, 0.1)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* 차트 배경 그리드 */}
          <div style={{
            position: "absolute",
            top: "2.5rem",
            left: "2.5rem",
            right: "2.5rem",
            height: "180px",
            background: `
              linear-gradient(to right, rgba(26, 188, 156, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(26, 188, 156, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "20px 30px",
            zIndex: 1
          }}></div>
          
          {/* Y축 라벨 */}
          <div style={{
            position: "absolute",
            left: "1.5rem",
            top: "2.5rem",
            height: "180px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            zIndex: 2
          }}>
            {[2000, 1500, 1000, 500, 0].map((value) => (
              <span key={value} style={{ 
                fontSize: "0.7rem", 
                color: "#6b7280",
                fontWeight: "500"
              }}>
                {value}g
              </span>
            ))}
          </div>

          {/* 차트 바 */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "end", 
            height: "180px", 
            marginBottom: "1.5rem",
            paddingLeft: "3.5rem",
            position: "relative",
            zIndex: 3
          }}>
            {data?.last7days?.map((day, index) => {
              const maxValue = Math.max(...data.last7days.map(d => d.saved_g));
              const height = (day.saved_g / maxValue) * 150;
              return (
                <div key={index} style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center",
                  flex: 1,
                  margin: "0 4px",
                  position: "relative"
                }}>
                  {/* 호버 효과를 위한 투명한 영역 */}
                  <div style={{
                    position: "absolute",
                    top: "-10px",
                    left: "-5px",
                    right: "-5px",
                    height: `${height + 20}px`,
                    zIndex: 4
                  }}></div>
                  
                  {/* 차트 바 */}
                  <div style={{
                    width: "24px",
                    height: `${height}px`,
                    background: "linear-gradient(to top, #1abc9c, #16a085)",
                    borderRadius: "12px 12px 0 0",
                    marginBottom: "8px",
                    minHeight: "8px",
                    position: "relative",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(26, 188, 156, 0.3)"
                  }}></div>
                  
                  {/* 데이터 포인트 */}
                  <div style={{
                    width: "8px",
                    height: "8px",
                    background: "#1abc9c",
                    borderRadius: "50%",
                    position: "absolute",
                    top: `${150 - height + 4}px`,
                    left: "50%",
                    transform: "translateX(-50%)",
                    boxShadow: "0 2px 6px rgba(26, 188, 156, 0.4)"
                  }}></div>
                  
                  <span style={{ 
                    fontSize: "0.8rem", 
                    color: "#4b5563",
                    fontWeight: "600",
                    marginBottom: "2px"
                  }}>
                    {day.date}
                  </span>
                  <span style={{ 
                    fontSize: "0.7rem", 
                    color: "#6b7280",
                    fontWeight: "500"
                  }}>
                    {day.saved_g}g
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* 차트 하단 정보 */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(26, 188, 156, 0.1)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <div style={{
                width: "12px",
                height: "12px",
                background: "linear-gradient(135deg, #1abc9c, #16a085)",
                borderRadius: "2px"
              }}></div>
              <span style={{ 
                fontSize: "0.9rem", 
                color: "#4b5563",
                fontWeight: "500"
              }}>
                일일 절감량
              </span>
            </div>
            <span style={{ 
              fontSize: "0.9rem", 
              color: "#1abc9c",
              fontWeight: "700"
            }}>
              평균: {data?.last7days ? Math.round(data.last7days.reduce((sum, day) => sum + day.saved_g, 0) / data.last7days.length) : 0}g
            </span>
          </div>
        </div>
      </div>

      {/* 🚋 교통수단 비율 */}
      <h4 style={{ marginTop: "2rem", fontSize: "1.3rem", marginBottom: "1.5rem" }}>🚋 교통수단별 절감 비율</h4>
      <div style={{ 
        background: "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)", 
        padding: "2rem", 
        borderRadius: "20px",
        border: "1px solid rgba(26, 188, 156, 0.1)",
        boxShadow: "0 8px 25px rgba(26, 188, 156, 0.1)"
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
          {data?.modeStats?.map((mode, index) => {
            const total = data.modeStats.reduce((sum, m) => sum + m.saved_g, 0);
            const percentage = total > 0 ? Math.round((mode.saved_g / total) * 100) : 0;
            return (
              <div key={index} style={{ 
                display: "flex", 
                alignItems: "center", 
                background: "rgba(255, 255, 255, 0.9)",
                padding: "1.2rem",
                borderRadius: "12px",
                border: "1px solid rgba(26, 188, 156, 0.1)",
                flex: "1",
                minWidth: "220px",
                boxShadow: "0 4px 15px rgba(26, 188, 156, 0.1)",
                transition: "all 0.3s ease"
              }}>
                <div style={{
                  width: "16px",
                  height: "16px",
                  background: COLORS[index % COLORS.length],
                  borderRadius: "50%",
                  marginRight: "0.8rem",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)"
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", marginBottom: "0.3rem", fontSize: "1rem", color: "#2c3e50" }}>{mode.mode}</div>
                  <div style={{ fontSize: "0.95rem", color: "#6b7280", fontWeight: "500" }}>
                    {mode.saved_g}g ({percentage}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ 
          textAlign: "center", 
          color: "#1abc9c", 
          margin: "1.5rem 0 0 0",
          fontSize: "1rem",
          fontWeight: "600"
        }}>
          총 절감량: {data?.modeStats ? data.modeStats.reduce((sum, mode) => sum + mode.saved_g, 0) : 0}g
        </p>
      </div>

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
