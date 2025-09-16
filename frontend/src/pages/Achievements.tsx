import React from "react";

const styles = `
.achievements-container {
  background-color: #fdfdf5;
  min-height: 100vh;
  padding: 40px 20px;
  text-align: center;
}

.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.badge-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  padding: 20px;
  font-size: 1rem;
  color: #333;
}

.badge-card h3 {
  color:#1ABC9C;
  margin-bottom: 10px;
}
`;

const Achievements: React.FC = () => {
  const badges = [
    { id: 1, name: "첫걸음 🌱", desc: "첫 1kg CO₂ 절약" },
    { id: 2, name: "에코 워리어 🛡️", desc: "10회 챌린지 달성" },
    { id: 3, name: "교통왕 🚆", desc: "대중교통 100km 이용" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="achievements-container">
        <h2>🏆 나의 업적</h2>
        <div className="badge-grid">
          {badges.map((b) => (
            <div key={b.id} className="badge-card">
              <h3>{b.name}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Achievements;
