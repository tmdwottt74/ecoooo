import React, { useState, useEffect } from "react";
import { useCredits } from "../contexts/CreditsContext";
import { useAppData } from "../contexts/AppDataContext";
import { useLoading } from "../contexts/LoadingContext";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
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
  eco_credits_earned: number; // 오늘 획득 크레딧
  garden_level: number; // 정원 레벨
  total_saved: number; // 누적 절약량 (kg)
  total_points: number; // 누적 크레딧
  last7days: DailySaving[];
  modeStats: { mode: string; saved_g: number }[];
  challenge: Challenge;
}

const COLORS = ["#1abc9c", "#16a085", "#f39c12", "#e74c3c"];

// ✅ 데모 버전 - 모든 사용자가 동일한 데이터
const DEMO_DATA: DashboardData = {
  co2_saved_today: 1850,
  eco_credits_earned: 185, // 10g당 1크레딧
  garden_level: 3, // 고정 레벨
  total_saved: 18.5,
  total_points: 185, // 고정 크레딧
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
  challenge: { goal: 20, progress: 8.76 }, // 43.8%에 해당하는 안정적인 값
};

const DashboardPage: React.FC = () => {
  const { creditsData } = useCredits();
  const { showLoading, hideLoading } = useLoading();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  // 실시간 크레딧 변경 애니메이션을 위한 상태
  const [creditChange, setCreditChange] = useState<{amount: number, type: 'earn' | 'spend' | null}>({amount: 0, type: null});
  const [showCreditAnimation, setShowCreditAnimation] = useState(false);

  // 크레딧 변경 시 애니메이션 표시
  useEffect(() => {
    const handleCreditUpdate = (event: CustomEvent) => {
      const { change } = event.detail;
      if (change !== 0) {
        setCreditChange({
          amount: Math.abs(change),
          type: change > 0 ? 'earn' : 'spend'
        });
        setShowCreditAnimation(true);
        
        // 3초 후 애니메이션 숨기기
        setTimeout(() => {
          setShowCreditAnimation(false);
          setCreditChange({amount: 0, type: null});
        }, 3000);
      }
    };

    window.addEventListener('creditUpdated', handleCreditUpdate as EventListener);
    return () => window.removeEventListener('creditUpdated', handleCreditUpdate as EventListener);
  }, []);

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  const userId = 1; // 실제 로그인 사용자 ID로 대체 필요

  // ✅ 데이터 불러오기
  useEffect(() => {
    // 페이지 진입 시 스크롤을 최상단으로 이동
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      showLoading('대시보드 데이터를 불러오는 중...');

      try {
        const response = await fetch(`${API_URL}/api/dashboard/${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          console.warn("Dashboard API 응답 없음, 데모 데이터 사용");
          setData(DEMO_DATA);
        }
      } catch (e) {
        console.warn("Dashboard API 연결 실패, 데모 데이터 사용:", e);
        setData(DEMO_DATA);
      } finally {
        setLoading(false);
        hideLoading();
      }
    };

    // 약간의 지연을 두고 데이터 로딩 (로딩 화면을 보여주기 위해)
    const timer = setTimeout(() => {
      fetchData();
    }, 200);

    return () => clearTimeout(timer);
  }, [API_URL, userId, showLoading, hideLoading]);

  // 데모 버전 - 실시간 업데이트 제거

  // ✅ 챗봇으로 이동하는 함수
  const goToChat = () => {
    window.location.href = '/chat';
  };

  // ✅ 상태 처리 - 데이터가 없으면 기본 데이터 사용
  if (!data) {
    // 데이터가 없을 때는 기본 데이터를 사용하여 화면을 표시
    const defaultData = DEMO_DATA;
    return (
      <div className="dashboard-container">
        <PageHeader 
          title="대시보드" 
          subtitle="나의 친환경 활동 현황을 한눈에 확인하세요"
          icon="📊"
        />
        
        {/* 메인 통계 카드 */}
        <div className="dashboard-grid">
          <div className="card main-card">
            <div className="card-icon">🌱</div>
            <div className="card-content">
              <h3>오늘 절약한 탄소</h3>
              <p className="metric">{defaultData.co2_saved_today} g</p>
              <p className="sub-metric">+{defaultData.eco_credits_earned} 크레딧</p>
            </div>
          </div>
          
          <div className="card main-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>누적 절약량</h3>
              <p className="metric">{defaultData.total_saved} kg</p>
              <div className="credit-display-container">
                <p className={`sub-metric ${showCreditAnimation ? 'credit-updated' : ''}`}>
                  총 {defaultData.total_points} 크레딧
                </p>
                {showCreditAnimation && (
                  <div className={`credit-change-animation ${creditChange.type}`}>
                    {creditChange.type === 'earn' ? '+' : '-'}{creditChange.amount}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="card main-card">
            <div className="card-icon">🌿</div>
            <div className="card-content">
              <h3>정원 레벨</h3>
              <p className="metric">Lv.{defaultData.garden_level}</p>
              <p className="sub-metric">다음 레벨까지 {10 - (defaultData.garden_level * 2)}%</p>
            </div>
          </div>
          
          <div className="card main-card">
            <div className="card-icon">🏆</div>
            <div className="card-content">
              <h3>챌린지 진행</h3>
              <p className="metric">{Math.round((defaultData.challenge.progress / defaultData.challenge.goal) * 100)}%</p>
              <p className="sub-metric">{defaultData.challenge.progress}/{defaultData.challenge.goal} kg</p>
            </div>
          </div>
        </div>
        
        {/* 추가 섹션들 */}
        <div className="dashboard-sections">
          <div className="section">
            <h3>📈 최근 7일 탄소 절약</h3>
            <div className="chart-container">
              <div className="chart-bars">
                {defaultData.last7days.map((day: any, index: number) => (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar-fill" 
                      style={{ height: `${(day.saved_g / 2000) * 100}%` }}
                    ></div>
                    <span className="bar-label">{day.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="section">
            <h3>🚌 이동 수단별 절약량</h3>
            <div className="mode-stats">
              {defaultData.modeStats.map((mode: any, index: number) => (
                <div key={index} className="mode-item">
                  <span className="mode-icon">
                    {mode.mode === '지하철' ? '🚇' : 
                     mode.mode === '자전거' ? '🚲' : 
                     mode.mode === '버스' ? '🚌' : '🚶'}
                  </span>
                  <div className="mode-info">
                    <span className="mode-name">{mode.mode}</span>
                    <span className="mode-amount">{mode.saved_g}g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <PageHeader 
        title="대시보드" 
        subtitle="나의 친환경 활동 현황을 한눈에 확인하세요"
        icon="📊"
      />
      
      {/* 요약 카드 */}
      <div
        className="dashboard-grid"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        <Link to="/credit?tab=recent" className="card clickable-card">
          <h4>오늘 절약한 탄소</h4>
          <p className="metric">
            {data.co2_saved_today?.toFixed(2)} <span>g</span>
          </p>
        </Link>
        <Link to="/credit?tab=points" className="card clickable-card">
          <h4>누적 절약량</h4>
          <p className="metric">
            {data.total_saved} <span>kg</span>
          </p>
        </Link>
        <Link to="/credit" className="card clickable-card">
          <h4>에코 크레딧</h4>
          <div className="credit-display-container">
            <p className={`metric ${showCreditAnimation ? 'credit-updated' : ''}`}>
              {data.total_points} <span>C</span>
            </p>
            {showCreditAnimation && (
              <div className={`credit-change-animation ${creditChange.type}`}>
                {creditChange.type === 'earn' ? '+' : '-'}{creditChange.amount}
              </div>
            )}
          </div>
        </Link>
        <Link to="/mygarden" className="card clickable-card">
          <h4>정원 레벨</h4>
          <p className="metric">Lv. {data.garden_level} 🌱</p>
        </Link>
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
            left: "2rem",
            top: "2.5rem",
            height: "180px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            zIndex: 2
          }}>
            {[2000, 1500, 1000, 500, 0].map((value) => (
              <span key={value} style={{ 
                fontSize: "0.75rem", 
                color: "#6b7280",
                fontWeight: "600",
                background: "rgba(255, 255, 255, 0.9)",
                padding: "2px 6px",
                borderRadius: "4px"
              }}>
                {value}g
              </span>
            ))}
          </div>

          {/* Y축 제목 */}
          <div style={{
            position: "absolute",
            left: "0.8rem",
            top: "50%",
            transform: "translateY(-50%) rotate(-90deg)",
            fontSize: "0.85rem",
            color: "#4a5568",
            fontWeight: "700",
            zIndex: 2,
            background: "rgba(255, 255, 255, 0.9)",
            padding: "4px 8px",
            borderRadius: "4px"
          }}>
            탄소 절감량 (g)
          </div>

          {/* 차트 바 */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "end", 
            height: "180px", 
            marginBottom: "1.5rem",
            paddingLeft: "4rem",
            paddingRight: "1rem",
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
                    width: "28px",
                    height: `${height}px`,
                    background: "linear-gradient(to top, #1abc9c, #16a085)",
                    borderRadius: "14px 14px 0 0",
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
                    fontSize: "0.7rem", 
                    color: "#6b7280",
                    fontWeight: "600",
                    textAlign: "center",
                    background: "rgba(255, 255, 255, 0.9)",
                    padding: "2px 4px",
                    borderRadius: "3px",
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
          
          {/* X축 제목 */}
          <div style={{
            textAlign: "center",
            paddingTop: "1rem",
            fontSize: "0.9rem",
            color: "#4a5568",
            fontWeight: "700"
          }}>
            날짜
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
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginTop: "2rem",
        marginBottom: "1.5rem"
      }}>
        <h4 style={{ margin: 0, fontSize: "1.3rem" }}>🚋 교통수단별 절감 비율</h4>
        <Link 
          to="/credit?tab=recent" 
          style={{ 
            color: "#1abc9c", 
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "rgba(26, 188, 156, 0.1)",
            padding: "8px 12px",
            borderRadius: "20px",
            transition: "all 0.3s ease"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(26, 188, 156, 0.2)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(26, 188, 156, 0.1)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          자세히 보기 →
        </Link>
      </div>
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
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "1rem"
        }}>
          <h4 style={{ margin: 0 }}>🔥 챌린지 진행 상황</h4>
          <Link 
            to="/challenge-achievements" 
            style={{ 
              color: "#1abc9c", 
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            자세히 보기 →
          </Link>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)",
          padding: "1.5rem",
          borderRadius: "15px",
          border: "1px solid rgba(26, 188, 156, 0.1)",
          boxShadow: "0 4px 15px rgba(26, 188, 156, 0.1)",
          marginBottom: "1rem"
        }}>
          <div style={{ marginBottom: "1rem" }}>
            <h5 style={{ 
              margin: "0 0 0.5rem 0", 
              color: "#2c3e50",
              fontSize: "1.1rem"
            }}>
              🚇 대중교통 이용 챌린지
            </h5>
            <p style={{ 
              margin: 0, 
              color: "#7f8c8d",
              fontSize: "0.9rem"
            }}>
              {data.challenge.goal}kg 절감 목표 중 {data.challenge.progress}kg 달성!
            </p>
          </div>
          
          <div style={{
            background: "#ecf0f1",
            borderRadius: "10px",
            overflow: "hidden",
            height: "25px",
            position: "relative"
          }}>
            <div
              style={{
                width: `${Math.min((data.challenge.progress / data.challenge.goal) * 100, 100)}%`,
                background: "linear-gradient(90deg, #1abc9c, #16a085)",
                height: "100%",
                textAlign: "center",
                color: "#fff",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                transition: "width 0.3s ease"
              }}
            >
              {Math.round((data.challenge.progress / data.challenge.goal) * 100)}%
            </div>
          </div>
          
          <div style={{ 
            marginTop: "0.8rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ 
              fontSize: "0.8rem", 
              color: "#1abc9c",
              fontWeight: "600"
            }}>
              목표까지 {data.challenge.goal - data.challenge.progress}kg 남음
            </span>
            <span style={{ 
              fontSize: "0.8rem", 
              color: "#7f8c8d"
            }}>
              챌린지&업적 탭과 연동됨
            </span>
          </div>
        </div>
      </div>

      {/* 🤖 AI 챗봇과 연결 */}
      <div style={{ marginTop: "2rem" }}>
        <h4 style={{ fontSize: "1.3rem", marginBottom: "1.5rem" }}>🤖 AI 챗봇과 활동 기록하기</h4>
        <div style={{ 
          background: "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)", 
          padding: "2rem", 
          borderRadius: "20px",
          border: "1px solid rgba(26, 188, 156, 0.1)",
          boxShadow: "0 8px 25px rgba(26, 188, 156, 0.1)"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: "1.5rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #1abc9c, #16a085)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                boxShadow: "0 4px 15px rgba(26, 188, 156, 0.3)"
              }}>
                🤖
              </div>
              <div>
                <h5 style={{ 
                  margin: "0 0 0.5rem 0", 
                  color: "#2c3e50",
                  fontSize: "1.2rem"
                }}>
                  AI 챗봇과 친환경 활동하기
                </h5>
                <p style={{ 
                  margin: 0, 
                  color: "#7f8c8d",
                  fontSize: "0.95rem"
                }}>
                  대화하며 활동을 기록하고 크레딧을 획득하세요!
                </p>
              </div>
            </div>
            <button
              onClick={goToChat}
              style={{ 
                background: "linear-gradient(135deg, #1abc9c, #16a085)",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "20px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(26, 188, 156, 0.3)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(26, 188, 156, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(26, 188, 156, 0.3)";
              }}
            >
              대화 시작하기 →
            </button>
          </div>
          
          <div style={{ 
            display: "flex", 
            gap: "1rem",
            flexWrap: "wrap"
          }}>
            <div style={{
              background: "rgba(26, 188, 156, 0.1)",
              padding: "1rem",
              borderRadius: "12px",
              flex: "1",
              minWidth: "200px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🚇</div>
              <div style={{ 
                fontSize: "0.9rem", 
                fontWeight: "600",
                color: "#2c3e50",
                marginBottom: "0.3rem"
              }}>
                대중교통 이용
              </div>
              <div style={{ 
                fontSize: "0.8rem", 
                color: "#7f8c8d"
              }}>
                +150C 획득
              </div>
            </div>
            <div style={{
              background: "rgba(26, 188, 156, 0.1)",
              padding: "1rem",
              borderRadius: "12px",
              flex: "1",
              minWidth: "200px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🚴</div>
              <div style={{ 
                fontSize: "0.9rem", 
                fontWeight: "600",
                color: "#2c3e50",
                marginBottom: "0.3rem"
              }}>
                자전거 이용
              </div>
              <div style={{ 
                fontSize: "0.8rem", 
                color: "#7f8c8d"
              }}>
                +100C 획득
              </div>
            </div>
            <div style={{
              background: "rgba(26, 188, 156, 0.1)",
              padding: "1rem",
              borderRadius: "12px",
              flex: "1",
              minWidth: "200px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🌱</div>
              <div style={{ 
                fontSize: "0.9rem", 
                fontWeight: "600",
                color: "#2c3e50",
                marginBottom: "0.3rem"
              }}>
                에너지 절약
              </div>
              <div style={{ 
                fontSize: "0.8rem", 
                color: "#7f8c8d"
              }}>
                +50C 획득
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
