import React from 'react';

interface UserCredit {
  totalPoints: number;
  recentEarned: number;
  recentActivity: string;
}

const Credit: React.FC = () => {
  // 더미 데이터 (추후 백엔드 연동 예정)
  const userCredit: UserCredit = {
    totalPoints: 1250,
    recentEarned: 150,
    recentActivity: "지하철 이용",
  };

  return (
    <div className="dashboard-container" style={{ padding: "2rem" }}>
      <h3>내 크레딧</h3>

      <div className="dashboard-grid">
        <div className="card">
          <h4>총 포인트</h4>
          <p className="metric">
            {userCredit.totalPoints} <span>P</span>
          </p>
        </div>

        <div className="card">
          <h4>최근 적립</h4>
          <p className="metric">
            {userCredit.recentEarned} <span>P</span>
          </p>
        </div>

        <div className="card">
          <h4>최근 활동</h4>
          <p className="metric">{userCredit.recentActivity}</p>
        </div>
      </div>
    </div>
  );
};

export default Credit;
