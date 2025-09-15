import React from 'react';

interface UserCredit {
  totalPoints: number;
  recentEarned: number;
  recentActivity: string;
}

const Credit: React.FC = () => {
  const username = "김규리"; // 추후 백엔드에서 props로 가져오기

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ color: "#1abc9c" }}>
        {username} 님! 오늘도 녹색생활 이어나가봐요 🌱
      </h2>
      <div style={{ marginTop: "2rem" }}>
        <h3>총 포인트</h3>
        <button>포인트 조회하기</button>
      </div>
      <div style={{ marginTop: "2rem" }}>
        <h3>최근 활동</h3>
        <button>최근 대중교통 이용 내역 조회</button>
      </div>
    </div>
  );
};

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

export default Credit;
