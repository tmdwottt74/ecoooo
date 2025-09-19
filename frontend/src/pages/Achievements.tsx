import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import "./Achievements.css";

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  reward: string;
}

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    // 더미 데이터
    const dummyAchievements: Achievement[] = [
      {
        id: 1,
        title: "첫 걸음",
        description: "첫 번째 친환경 활동을 완료하세요",
        icon: "🌱",
        isUnlocked: true,
        unlockedAt: "2025-01-15",
        progress: 1,
        maxProgress: 1,
        reward: "10 크레딧",
      },
      {
        id: 2,
        title: "대중교통 마스터",
        description: "대중교통을 10번 이용하세요",
        icon: "🚇",
        isUnlocked: true,
        unlockedAt: "2025-01-16",
        progress: 10,
        maxProgress: 10,
        reward: "50 크레딧",
      },
      {
        id: 3,
        title: "자전거 라이더",
        description: "자전거를 5번 이용하세요",
        icon: "🚲",
        isUnlocked: false,
        progress: 3,
        maxProgress: 5,
        reward: "30 크레딧",
      },
      {
        id: 4,
        title: "탄소 절약왕",
        description: "총 100kg의 탄소를 절약하세요",
        icon: "🌍",
        isUnlocked: false,
        progress: 45,
        maxProgress: 100,
        reward: "200 크레딧",
      },
    ];
    setAchievements(dummyAchievements);
  }, []);

  const categories = [
    { id: "all", name: "전체", icon: "🏆" },
    { id: "transport", name: "교통", icon: "🚇" },
    { id: "garden", name: "정원", icon: "🌱" },
    { id: "challenge", name: "챌린지", icon: "🎯" },
    { id: "carbon", name: "탄소절약", icon: "🌍" },
  ];

  const filteredAchievements = achievements.filter(() => {
    if (selectedCategory === "all") return true;
    return true; // 카테고리별 로직은 추후 추가
  });

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;

  const selectedAchievement = achievements.find((a) => a.id === selectedId);

  return (
    <div className="achievements-page">
      <PageHeader
        title="업적"
        subtitle="친환경 활동을 통해 다양한 업적을 달성해보세요!"
        icon="🏆"
      />

      <div className="achievements-container">
        {/* 진행률 요약 */}
        <div className="achievements-summary">
          <div className="summary-card">
            <div className="summary-icon">🏆</div>
            <div className="summary-content">
              <h3>업적 진행률</h3>
              <p>
                {unlockedCount} / {totalCount} 완료
              </p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(unlockedCount / totalCount) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="category-filter">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${
                selectedCategory === category.id ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>

        {/* 업적 목록 */}
        <div className="achievements-grid">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`achievement-card ${
                achievement.isUnlocked ? "unlocked" : "locked"
              }`}
              onClick={() => setSelectedId(achievement.id)}
            >
              <div className="achievement-icon">{achievement.icon}</div>

              <div className="achievement-content">
                <h3 className="achievement-title">{achievement.title}</h3>
                <p className="achievement-description">
                  {achievement.description}
                </p>

                <div className="achievement-progress">
                  <div className="progress-info">
                    <span>
                      {achievement.progress} / {achievement.maxProgress}
                    </span>
                    <span className="reward">{achievement.reward}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${
                          (achievement.progress / achievement.maxProgress) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {achievement.isUnlocked && achievement.unlockedAt && (
                  <div className="unlocked-info">
                    <span className="unlocked-date">
                      {new Date(achievement.unlockedAt).toLocaleDateString()} 달성
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 모달 */}
      {selectedAchievement && (
        <div className="modal-overlay" onClick={() => setSelectedId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedAchievement.title}</h3>
            <p>{selectedAchievement.description}</p>
            <p>
              진행도: {selectedAchievement.progress} /{" "}
              {selectedAchievement.maxProgress}
            </p>
            <p>보상: {selectedAchievement.reward}</p>
            {selectedAchievement.isUnlocked ? (
              <p>✅ 이미 달성한 업적입니다!</p>
            ) : (
              <p>🔒 아직 달성하지 못했습니다.</p>
            )}
            {selectedAchievement.unlockedAt && (
              <p>📅 달성일: {selectedAchievement.unlockedAt}</p>
            )}
            <button onClick={() => setSelectedId(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;


