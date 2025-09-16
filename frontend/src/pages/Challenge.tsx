import React from "react";

const styles = `
.challenge-container {
  background-color: #fdfdf5;
  min-height: 100vh;
  padding: 40px 20px;
}

.challenge-list {
  list-style: none;
  padding: 0;
}

.challenge-item {
  display: flex;
  justify-content: space-between;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
  margin-bottom: 15px;
  font-size: 1rem;
  font-weight: 500;
}

.progress {
  font-weight: bold;
  color: #1ABC9C;
}
`;

const Challenge: React.FC = () => {
  const challenges = [
    { id: 1, title: "🚲 이번 주 따릉이 10km 타기", progress: "60%" },
    { id: 2, title: "🚶 하루 5,000보 걷기", progress: "80%" },
    { id: 3, title: "🚌 대중교통 5회 이용", progress: "100%" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="challenge-container">
        <h2>🔥 나의 챌린지</h2>
        <ul className="challenge-list">
          {challenges.map((c) => (
            <li key={c.id} className="challenge-item">
              <span>{c.title}</span>
              <span className="progress">{c.progress}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Challenge;
