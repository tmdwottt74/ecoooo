import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import "./Credit.css";
import "./CreditPoints.css";

interface CreditPoint {
  id: number;
  amount: number;
  reason: string;
  date: string;
  type: "earn" | "spend";
}

type TotalPointsResponse = { total_points: number };

const CreditPoints: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<number>(0);
  const [creditPoints, setCreditPoints] = useState<CreditPoint[]>([]);
  const [filter, setFilter] = useState<"all" | "earn" | "spend">("all");

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

  // ✅ API 호출 (총 포인트 불러오기)
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${API_URL}/credits/total/prototype_user`);
        if (res.ok) {
          const data: TotalPointsResponse = await res.json();
          setPoints(Number(data.total_points ?? 0));
        } else {
          setPoints(1240); // 실패 시 더미 데이터
        }
      } catch (e) {
        setPoints(1240); // 예외 시 더미 데이터
      } finally {
        setLoading(false);
      }
    };
    run();

    // ✅ 더미 데이터 (내역)
    const dummyData: CreditPoint[] = [
      { id: 1, amount: 50, reason: "지하철 이용", date: "2025-01-15", type: "earn" },
      { id: 2, amount: 30, reason: "자전거 이용", date: "2025-01-15", type: "earn" },
      { id: 3, amount: 10, reason: "정원 물주기", date: "2025-01-14", type: "spend" },
      { id: 4, amount: 20, reason: "도보 이동", date: "2025-01-14", type: "earn" },
      { id: 5, amount: 100, reason: "챌린지 완료", date: "2025-01-13", type: "earn" },
    ];
    setCreditPoints(dummyData);
  }, [API_URL]);

  // ✅ 필터 적용된 내역
  const filteredPoints = creditPoints.filter((point) => {
    if (filter === "all") return true;
    return point.type === filter;
  });

  // ✅ 합계 계산
  const earnedCredits = creditPoints
    .filter((p) => p.type === "earn")
    .reduce((sum, p) => sum + p.amount, 0);

  const spentCredits = creditPoints
    .filter((p) => p.type === "spend")
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="credit-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>포인트 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="credit-container">
      {/* 히어로 섹션 */}
      <section className="credit-hero">
        <div className="hero-content">
          <h1 className="hero-title">💰 포인트 현황</h1>
        </div>
        <div className="hero-decoration">
          <div className="floating-element">💰</div>
          <div className="floating-element">📊</div>
          <div className="floating-element">🎁</div>
        </div>
      </section>

      {/* 페이지 헤더 */}
      <PageHeader
        title="크레딧 포인트"
        subtitle="친환경 활동으로 얻은 크레딧을 확인하세요"
        icon="💰"
      />

      <div className="credit-points-container">
        {/* 크레딧 요약 */}
        <div className="credits-summary">
          <div className="summary-card total">
            <div className="summary-icon">💰</div>
            <div className="summary-content">
              <h3>총 크레딧</h3>
              <p className="summary-amount">{points.toLocaleString()}</p>
            </div>
          </div>

          <div className="summary-card earned">
            <div className="summary-icon">⬆️</div>
            <div className="summary-content">
              <h3>적립</h3>
              <p className="summary-amount">+{earnedCredits.toLocaleString()}</p>
            </div>
          </div>

          <div className="summary-card spent">
            <div className="summary-icon">⬇️</div>
            <div className="summary-content">
              <h3>사용</h3>
              <p className="summary-amount">-{spentCredits.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* 필터 */}
        <div className="credits-filter">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            전체
          </button>
          <button
            className={`filter-btn ${filter === "earn" ? "active" : ""}`}
            onClick={() => setFilter("earn")}
          >
            적립
          </button>
          <button
            className={`filter-btn ${filter === "spend" ? "active" : ""}`}
            onClick={() => setFilter("spend")}
          >
            사용
          </button>
        </div>

        {/* 크레딧 내역 */}
        <div className="credits-history">
          <h3>📊 크레딧 내역</h3>
          <div className="history-list">
            {filteredPoints.map((point) => (
              <div key={point.id} className={`history-item ${point.type}`}>
                <div className="item-icon">
                  {point.type === "earn" ? "⬆️" : "⬇️"}
                </div>
                <div className="item-content">
                  <h4 className="item-reason">{point.reason}</h4>
                  <p className="item-date">{point.date}</p>
                </div>
                <div className={`item-amount ${point.type}`}>
                  {point.type === "earn" ? "+" : "-"}
                  {point.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 크레딧 적립 방법 */}
        <div className="earn-methods">
          <h3>크레딧 적립 방법</h3>
          <div className="methods-grid">
            <div className="method-card">
              <div className="method-icon">🚇</div>
              <div className="method-content">
                <h4>대중교통 이용</h4>
                <p>지하철, 버스 이용 시</p>
                <span className="method-reward">+50 크레딧</span>
              </div>
            </div>

            <div className="method-card">
              <div className="method-icon">🚲</div>
              <div className="method-content">
                <h4>자전거 이용</h4>
                <p>자전거로 이동 시</p>
                <span className="method-reward">+30 크레딧</span>
              </div>
            </div>

            <div className="method-card">
              <div className="method-icon">🚶</div>
              <div className="method-content">
                <h4>도보 이동</h4>
                <p>걸어서 이동 시</p>
                <span className="method-reward">+20 크레딧</span>
              </div>
            </div>

            <div className="method-card">
              <div className="method-icon">🎯</div>
              <div className="method-content">
                <h4>챌린지 완료</h4>
                <p>챌린지 달성 시</p>
                <span className="method-reward">+100 크레딧</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditPoints;


