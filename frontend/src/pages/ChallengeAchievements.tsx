import React, { useState, useEffect } from "react";

const styles = `
.challenge-achievements-page {
  background-color: #fdfdf5;
  min-height: 100vh;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: #2e7d32;
  font-weight: 700;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 30px;
}

.tab-container {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-button {
  padding: 12px 30px;
  background: none;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  margin: 0 10px;
}

.tab-button.active {
  color: #1ABC9C;
  border-bottom-color: #1ABC9C;
}

.tab-button:hover {
  color: #1ABC9C;
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

/* Challenge Styles */
.challenge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.challenge-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: left;
  border: 2px solid transparent;
}

.challenge-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  border-color: rgba(26, 188, 156, 0.3);
}

.challenge-card h3 {
  margin-bottom: 12px;
  font-size: 1.4rem;
  color: #1b5e20;
  font-weight: 600;
}

.challenge-card .desc {
  font-size: 1rem;
  color: #555;
  margin-bottom: 20px;
  line-height: 1.5;
}

.progress-section {
  margin: 20px 0;
}

.progress-bar {
  background: #e8f5e8;
  border-radius: 12px;
  height: 12px;
  margin: 15px 0;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  background: linear-gradient(90deg, #66bb6a, #43a047);
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 12px;
}

.progress-text {
  font-size: 0.95rem;
  color: #555;
  font-weight: 600;
  text-align: center;
  margin-top: 8px;
}

.reward {
  font-weight: 600;
  margin: 15px 0;
  color: #1ABC9C;
  font-size: 1rem;
  background: rgba(26, 188, 156, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
}

.join-btn {
  width: 100%;
  margin-top: 15px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #2e7d32, #1b5e20);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.join-btn:hover {
  background: linear-gradient(135deg, #1b5e20, #0d3e0d);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(46, 125, 50, 0.3);
}

/* Achievement Styles */
.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.achievement-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  padding: 25px;
  font-size: 1rem;
  color: #333;
  position: relative;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  text-align: center;
}

.achievement-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.achievement-card.locked {
  opacity: 0.6;
  background: #f8f9fa;
}

.achievement-card.unlocked {
  border-color: rgba(26, 188, 156, 0.3);
  background: linear-gradient(135deg, #ffffff, #f8fff8);
}

.achievement-card h3 {
  color: #1ABC9C;
  margin-bottom: 12px;
  font-size: 1.3rem;
  font-weight: 600;
}

.achievement-card p {
  margin-bottom: 15px;
  line-height: 1.5;
}

.achievement-progress {
  margin: 20px 0;
}

.achievement-progress .progress-bar {
  background: #e8f5e8;
  border-radius: 12px;
  height: 12px;
  margin: 15px 0;
  overflow: hidden;
}

.achievement-progress .progress-fill {
  background: linear-gradient(90deg, #66bb6a, #43a047);
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 12px;
}

.achievement-progress .progress-text {
  font-size: 0.95rem;
  color: #555;
  font-weight: 600;
  text-align: center;
  margin-top: 8px;
}

.date {
  font-size: 0.9rem;
  color: #777;
  background: rgba(26, 188, 156, 0.1);
  padding: 6px 12px;
  border-radius: 6px;
  display: inline-block;
  margin-top: 10px;
}

.status-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 1.5rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  padding: 30px;
  border-radius: 16px;
  max-width: 450px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal h3 {
  color: #1ABC9C;
  margin-bottom: 15px;
  font-size: 1.4rem;
}

.modal p {
  margin-bottom: 10px;
  line-height: 1.5;
}

.modal button {
  margin-top: 20px;
  padding: 10px 20px;
  border: none;
  background: #2e7d32;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.3s ease;
}

.modal button:hover {
  background: #1b5e20;
}

/* Responsive Design */
@media (max-width: 768px) {
  .challenge-achievements-page {
    padding: 20px 15px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .tab-button {
    padding: 10px 20px;
    font-size: 1rem;
    margin: 0 5px;
  }
  
  .challenge-grid,
  .achievement-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .challenge-card,
  .achievement-card {
    padding: 20px;
  }
}
`;

interface ChallengeData {
  id: number;
  title: string;
  description: string;
  progress: number;
  reward: string;
}

interface AchievementData {
  id: number;
  name: string;
  desc: string;
  progress: number;
  unlocked: boolean;
  date?: string;
}

const ChallengeAchievements: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'achievements'>('challenges');
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // 더미 데이터
  const dummyChallenges: ChallengeData[] = [
    {
      id: 1,
      title: "9월 대중교통 챌린지",
      description: "이번 달 대중교통으로 10kg CO₂ 절감하기",
      progress: 65,
      reward: "에코 크레딧 200P + 뱃지"
    },
    {
      id: 2,
      title: "자전거 출퇴근 챌린지",
      description: "한 달간 자전거로 출퇴근하여 5kg CO₂ 절감",
      progress: 40,
      reward: "에코 크레딧 150P + 뱃지"
    },
    {
      id: 3,
      title: "도보 생활 챌린지",
      description: "일주일간 1km 이내는 도보로 이동하기",
      progress: 80,
      reward: "에코 크레딧 100P"
    },
    {
      id: 4,
      title: "친환경 이동 30일",
      description: "30일 연속 친환경 교통수단 이용하기",
      progress: 25,
      reward: "에코 크레딧 300P + 특별 뱃지"
    }
  ];

  const dummyAchievements: AchievementData[] = [
    {
      id: 1,
      name: "첫 친환경 이동",
      desc: "첫 번째 친환경 교통수단 이용",
      progress: 100,
      unlocked: true,
      date: "2025-01-10"
    },
    {
      id: 2,
      name: "탄소 절약 마스터",
      desc: "총 10kg CO₂ 절약 달성",
      progress: 100,
      unlocked: true,
      date: "2025-01-12"
    },
    {
      id: 3,
      name: "지하철 애호가",
      desc: "지하철 20회 이용",
      progress: 80,
      unlocked: false
    },
    {
      id: 4,
      name: "자전거 라이더",
      desc: "자전거 50km 주행",
      progress: 60,
      unlocked: false
    },
    {
      id: 5,
      name: "도보의 달인",
      desc: "도보 100km 이동",
      progress: 30,
      unlocked: false
    },
    {
      id: 6,
      name: "연속 출석왕",
      desc: "30일 연속 친환경 이동",
      progress: 25,
      unlocked: false
    },
    {
      id: 7,
      name: "에코 크레딧 수집가",
      desc: "1000P 이상 적립",
      progress: 100,
      unlocked: true,
      date: "2025-01-14"
    },
    {
      id: 8,
      name: "환경 보호자",
      desc: "총 50kg CO₂ 절약 달성",
      progress: 37,
      unlocked: false
    }
  ];

  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

    // 챌린지 데이터 로드
    fetch(`${API_URL}/challenges/1`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("API 실패");
      })
      .then((data) => {
        setChallenges(data);
      })
      .catch(() => {
        setChallenges(dummyChallenges);
      });

    // 업적 데이터 로드
    fetch(`${API_URL}/achievements/1`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("API 실패");
      })
      .then((data) => {
        setAchievements(data);
      })
      .catch(() => {
        setAchievements(dummyAchievements);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#666' }}>
        ⏳ 로딩 중...
      </div>
    );
  }

  const selectedAchievementData = achievements.find(a => a.id === selectedAchievement);

  return (
    <>
      <style>{styles}</style>
      <div className="challenge-achievements-page">
        <div className="page-header">
          <h1 className="page-title">🏆 챌린지 & 업적</h1>
          <p className="page-subtitle">
            목표를 달성하고 업적을 쌓아가며 친환경 생활을 완성해보세요!
          </p>
        </div>

        <div className="tab-container">
          <button
            className={`tab-button ${activeTab === 'challenges' ? 'active' : ''}`}
            onClick={() => setActiveTab('challenges')}
          >
            🔥 챌린지
          </button>
          <button
            className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            🏆 업적
          </button>
        </div>

        {/* 챌린지 탭 */}
        <div className={`tab-content ${activeTab === 'challenges' ? 'active' : ''}`}>
          <div className="challenge-grid">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="challenge-card">
                <h3>{challenge.title}</h3>
                <p className="desc">{challenge.description}</p>

                <div className="progress-section">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${challenge.progress}%` }}
                    />
                  </div>
                  <p className="progress-text">{challenge.progress}% 달성</p>
                </div>

                <div className="reward">🎁 {challenge.reward}</div>
                <button className="join-btn">참여하기</button>
              </div>
            ))}
          </div>
        </div>

        {/* 업적 탭 */}
        <div className={`tab-content ${activeTab === 'achievements' ? 'active' : ''}`}>
          <div className="achievement-grid">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                onClick={() => setSelectedAchievement(achievement.id)}
              >
                <div className="status-badge">
                  {achievement.unlocked ? '✅' : '🔒'}
                </div>
                <h3>{achievement.name}</h3>
                <p>{achievement.desc}</p>

                <div className="achievement-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  <p className="progress-text">{achievement.progress}%</p>
                </div>

                {achievement.unlocked && achievement.date && (
                  <div className="date">획득일: {achievement.date}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 업적 상세 모달 */}
        {selectedAchievementData && (
          <div className="modal-overlay" onClick={() => setSelectedAchievement(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>{selectedAchievementData.name}</h3>
              <p>{selectedAchievementData.desc}</p>
              <p>진척도: {selectedAchievementData.progress}%</p>
              {selectedAchievementData.unlocked ? (
                <p>✅ 이미 달성한 업적입니다!</p>
              ) : (
                <p>🔒 아직 달성하지 못했습니다.</p>
              )}
              {selectedAchievementData.date && (
                <p>📅 달성일: {selectedAchievementData.date}</p>
              )}
              <button onClick={() => setSelectedAchievement(null)}>닫기</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChallengeAchievements;
