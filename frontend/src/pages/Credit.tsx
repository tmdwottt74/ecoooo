import React from 'react';
import { useLocation } from 'react-router-dom';
import "./Credit.css";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UserCredit {
  totalPoints: number;
  recentEarned: number;
  recentActivity: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetchPoints = async () => {
  const res = await fetch("http://127.0.0.1:8000/credits/total/prototype_user");
  const data = await res.json();
  alert(`총 포인트: ${data.total_points} P`);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetchRecentActivity = async () => {
  const res = await fetch("http://127.0.0.1:8000/mobility/recent/prototype_user");
  const data = await res.json();
  alert(`최근 활동: ${data.mode} ${data.distance_km}km`);
};

const Credit: React.FC = () => {
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get("preview") === "1";
  const username = "김에코"; // 추후 백엔드에서 props로 가져오기

  // 통합된 사용자 데이터 (Dashboard와 동일)
  const userInfo = {
    name: "김에코",
    group: "동국대학교",
    totalPoints: 1240,
    totalSaving: "18.5kg CO₂",
  };

  const creditHistory = [
    { id: 1, date: "2025-01-15", desc: "지하철 이용 7.5km", points: "+150", co2: "1,132g 절약" },
    { id: 2, date: "2025-01-15", desc: "버스 이용 4.0km", points: "+80", co2: "348g 절약" },
    { id: 3, date: "2025-01-14", desc: "자전거 이용 3.2km", points: "+100", co2: "256g 절약" },
    // ... (생략) ...
    { id: 25, date: "2025-01-03", desc: "지하철 이용 6.7km", points: "+135", co2: "1,010g 절약" },
  ];

  // 미리보기 모드
  if (isPreview) {
    return (
      <div className="credit-preview">
        <div className="preview-header">
          <h3>💰 크레딧 현황</h3>
        </div>
        <div className="preview-user-info">
          <div className="preview-user-avatar">🌱</div>
          <div className="preview-user-details">
            <div className="preview-user-name">{userInfo.name} 님</div>
            <div className="preview-user-group">{userInfo.group}</div>
          </div>
        </div>
        <div className="preview-stats">
          <div className="preview-stat">
            <span className="stat-label">누적 포인트</span>
            <span className="stat-value">{userInfo.totalPoints}P</span>
          </div>
          <div className="preview-stat">
            <span className="stat-label">누적 절감량</span>
            <span className="stat-value">{userInfo.totalSaving}</span>
          </div>
        </div>
        <div className="preview-recent">
          <div className="recent-item">
            <span className="recent-icon">🚌</span>
            <span className="recent-text">지하철 이용 +150P</span>
          </div>
          <div className="recent-item">
            <span className="recent-icon">🚲</span>
            <span className="recent-text">자전거 이용 +80P</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="credit-container">
      <section className="credit-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            🌱 {username} 님! 오늘도 녹색생활 이어나가봐요!
          </h1>
        </div>
        <div className="hero-decoration">
          <div className="floating-element">🌿</div>
          <div className="floating-element">🌱</div>
          <div className="floating-element">🌳</div>
        </div>
      </section>

      <div className="user-card">
        <div className="user-header">
          <div className="user-avatar">🌱</div>
          <div className="user-info">
            <h2 className="user-name">{userInfo.name} 님</h2>
            <p className="user-group">{userInfo.group}</p>
          </div>
        </div>
        <div className="user-stats">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">누적 포인트</div>
              <div className="stat-value">{userInfo.totalPoints}P</div>
            </div>
            <a href="/credit/points" className="stat-arrow">{'>'}</a>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🌍</div>
            <div className="stat-content">
              <div className="stat-label">누적 절감량</div>
              <div className="stat-value">{userInfo.totalSaving}</div>
            </div>
            <a href="/credit/recent" className="stat-arrow">{'>'}</a>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <a href="/credit/points" className="action-btn primary">
          <div className="btn-icon">📊</div>
          <div className="btn-content">
            <div className="btn-title">포인트 조회하기</div>
            <div className="btn-subtitle">상세 내역 확인</div>
          </div>
        </a>
        <a href="/credit/recent" className="action-btn secondary">
          <div className="btn-icon">🚌</div>
          <div className="btn-content">
            <div className="btn-title">최근 대중교통 이용 내역</div>
            <div className="btn-subtitle">이동 기록 조회</div>
          </div>
        </a>
      </div>

      <div className="credit-history">
        <div className="history-header">
          <h3 className="history-title">📋 최근 크레딧 내역</h3>
          <div className="history-badge">{creditHistory.length}건</div>
        </div>
        <div className="history-list">
          {creditHistory.map((item) => (
            <div key={item.id} className={`credit-item ${item.points.startsWith("+") ? "positive" : "negative"}`}>
              <div className="item-icon">
                {item.desc.includes("지하철") ? "🚇" : 
                 item.desc.includes("버스") ? "🚌" : 
                 item.desc.includes("자전거") ? "🚴" : 
                 item.desc.includes("도보") ? "🚶" : 
                 item.desc.includes("보너스") ? "🎁" : 
                 item.desc.includes("물주기") ? "💧" : "📝"}
              </div>
              <div className="item-content">
                <div className="item-desc">{item.desc}</div>
                <div className="item-meta">
                  <span className="item-date">{item.date}</span>
                  <span className="item-co2">{item.co2}</span>
                </div>
              </div>
              <div className={`item-points ${item.points.startsWith("+") ? "positive" : "negative"}`}>
                {item.points}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Credit;
