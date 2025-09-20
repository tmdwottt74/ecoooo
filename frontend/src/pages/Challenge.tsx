import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCredits } from "../contexts/CreditsContext";

const styles = `
.challenge-page {
  padding: 2rem;
  text-align: center;
  background-color: #fdfdf5;
  min-height: 100vh;
}

.challenge-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #2e7d32;
}

.challenge-subtitle {
  font-size: 1rem;
  margin-bottom: 2rem;
  color: #555;
}

.challenge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.challenge-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  text-align: left;
}

.challenge-card:hover {
  transform: translateY(-5px);
}

.challenge-card h3 {
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
  color: #1b5e20;
}

.challenge-card .desc {
  font-size: 0.95rem;
  color: #444;
  margin-bottom: 1rem;
}

.progress-bar {
  background: #e0e0e0;
  border-radius: 8px;
  height: 10px;
  margin: 1rem 0;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #66bb6a, #43a047);
  height: 100%;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #444;
}

.reward {
  font-weight: bold;
  margin: 0.5rem 0;
  color: #1abc9c;
}

.join-btn {
  margin-top: 0.5rem;
  padding: 0.6rem 1rem;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.join-btn:hover {
  background: #1b5e20;
}

.join-btn:disabled {
  background: #9e9e9e;
  cursor: not-allowed;
}
`;

interface ChallengeData {
  id: number;
  title: string;
  description: string;
  progress: number;
  reward: string;
  is_joined?: boolean;
}

const Challenge: React.FC = () => {
  const { user } = useAuth();
  const { completeChallenge } = useCredits();
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = user?.user_id;
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

  // localStorage helpers
  const loadChallengesFromStorage = () => {
    const stored = localStorage.getItem("challenge_progress");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Error parsing stored challenge data:", error);
      }
    }
    return null;
  };

  const saveChallengesToStorage = (challengeData: ChallengeData[]) => {
    localStorage.setItem("challenge_progress", JSON.stringify(challengeData));
  };

  // fetch challenges
  const fetchChallenges = async () => {
    if (!currentUserId) {
      setLoading(false);
      setError("로그인이 필요합니다.");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/challenges/${currentUserId}`);
      if (!response.ok) throw new Error("챌린지 정보를 불러오는 데 실패했습니다.");
      const data = await response.json();
      setChallenges(data);
      saveChallengesToStorage(data);
    } catch (err) {
      console.error("챌린지 API 실패:", err);
      // fallback 더미 데이터
      const dummyChallenges: ChallengeData[] = [
        {
          id: 1,
          title: "9월 대중교통 챌린지",
          description: "이번 달 대중교통으로 10kg CO₂ 절감하기",
          progress: 65,
          reward: "에코 크레딧 200P + 뱃지",
          is_joined: false,
        },
        {
          id: 2,
          title: "자전거 출퇴근 챌린지",
          description: "한 달간 자전거로 출퇴근하여 5kg CO₂ 절감",
          progress: 40,
          reward: "에코 크레딧 150P + 뱃지",
          is_joined: false,
        },
      ];
      setChallenges(dummyChallenges);
      saveChallengesToStorage(dummyChallenges);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = loadChallengesFromStorage();
    if (stored) {
      setChallenges(stored);
      setLoading(false);
    } else {
      fetchChallenges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // join challenge
  const handleJoinChallenge = async (challenge: ChallengeData) => {
    if (!currentUserId) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      // 서버 반영
      const response = await fetch(`${API_URL}/api/challenges/${challenge.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "챌린지 참여에 실패했습니다.");
      }

      // 크레딧 지급
      await completeChallenge(
        challenge.id.toString(),
        "daily",
        parseInt(challenge.reward.replace(/[^0-9]/g, "")),
        challenge.title
      );

      // 로컬 상태 업데이트
      const updatedChallenges = challenges.map((c) =>
        c.id === challenge.id
          ? { ...c, is_joined: true, progress: Math.min(c.progress + 25, 100) }
          : c
      );
      setChallenges(updatedChallenges);
      saveChallengesToStorage(updatedChallenges);

      alert(`${challenge.title} 챌린지에 참여했습니다!`);
    } catch (error) {
      console.error("챌린지 참여 실패:", error);
      alert(error instanceof Error ? error.message : "챌린지 참여 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <p>⏳ 로딩 중...</p>;
  if (error) return <p>오류: {error}</p>;
  if (!currentUserId) return <p>로그인하여 챌린지에 참여하세요.</p>;

  return (
    <>
      <style>{styles}</style>
      <div className="challenge-page">
        <h2 className="challenge-title">🔥 나의 챌린지</h2>
        <p className="challenge-subtitle">
          목표를 달성하면 Eco 크레딧과 뱃지를 획득할 수 있어요!
        </p>

        <div className="challenge-grid">
          {challenges.map((c) => (
            <div key={c.id} className="challenge-card">
              <h3>{c.title}</h3>
              <p className="desc">{c.description}</p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${c.progress}%` }}
                />
              </div>
              <p className="progress-text">{c.progress}% 달성</p>

              <p className="reward">🎁 보상: {c.reward}</p>

              {c.is_joined ? (
                <button className="join-btn" disabled>
                  참여중
                </button>
              ) : (
                <button className="join-btn" onClick={() => handleJoinChallenge(c)}>
                  참여하기
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Challenge;
