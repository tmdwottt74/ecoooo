import React from 'react';
import "./Credit.css";

interface UserCredit {
  totalPoints: number;
  recentEarned: number;
  recentActivity: string;
}

const fetchPoints = async () => {
  const res = await fetch("http://127.0.0.1:8000/credits/total/prototype_user");
  const data = await res.json();
  alert(`총 포인트: ${data.total_points} P`);
};

const fetchRecentActivity = async () => {
  const res = await fetch("http://127.0.0.1:8000/mobility/recent/prototype_user");
  const data = await res.json();
  alert(`최근 활동: ${data.mode} ${data.distance_km}km`);
};

const Credit: React.FC = () => {
  const username = "김규리"; // 추후 백엔드에서 props로 가져오기

    // 샘플 데이터 (임시 UI용)
  const userInfo = {
    name: "김에코",
    group: "동국대학교",
    totalPoints: 1240,
    totalSaving: "18.5kg CO₂",
  };

  const creditHistory = [
    { id: 1, date: "2025-09-10", desc: "버스 이용 5km", points: "+20" },
    { id: 2, date: "2025-09-11", desc: "따릉이 3km", points: "+15" },
    { id: 3, date: "2025-09-12", desc: "도보 2km", points: "+10" },
    { id: 4, date: "2025-09-13", desc: "카본페이 포인트 사용", points: "-30" },
  ];

 return (
    <div className="credit-container">
      {/* 상단 사용자 환영 메시지 */}
      <h2 className="welcome-msg">
        {username} 님! 오늘도 녹색생활 이어나가봐요 🌱
      </h2>

      {/* 사용자 정보 카드 */}
      <div className="user-card">
        <h2 className="user-name">{userInfo.name} 님</h2>
        <p className="user-group">소속: {userInfo.group}</p>
        <div className="user-stats">
          <p>누적 포인트 🌱 {userInfo.totalPoints}P</p>
          <p>누적 절감량 🌍 {userInfo.totalSaving}</p>
        </div>
      </div>

      {/* API 버튼 기능 */}
      <div className="api-actions">
        <div>
          <h3>총 포인트</h3>
          <button onClick={fetchPoints}>포인트 조회하기</button>
        </div>
        <div>
          <h3>최근 활동</h3>
          <button onClick={fetchRecentActivity}>최근 대중교통 이용 내역 조회</button>
        </div>
      </div>

      {/* 크레딧 내역 */}
      <div className="credit-history">
        <h3>📋 최근 크레딧 내역</h3>
        <ul>
          {creditHistory.map((item) => (
            <li key={item.id} className="credit-item">
              <span className="credit-date">{item.date}</span>
              <span className="credit-desc">{item.desc}</span>
              <span
                className={`credit-points ${
                  item.points.startsWith("+") ? "positive" : "negative"
                }`}
              >
                {item.points}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Credit;