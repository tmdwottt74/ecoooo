import React, { useState, useEffect } from "react";
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
`;

interface ChallengeData {
  id: number;
  title: string;
  description: string;
  progress: number;
  reward: string;
}

const Challenge: React.FC = () => {
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [loading, setLoading] = useState(true);
  const { completeChallenge } = useCredits();

  // localStorage에서 챌린지 상태 복원
  const loadChallengesFromStorage = () => {
    const stored = localStorage.getItem('challenge_progress');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored challenge data:', error);
      }
    }
    return null;
  };

  // 챌린지 상태를 localStorage에 저장
  const saveChallengesToStorage = (challengeData: ChallengeData[]) => {
    localStorage.setItem('challenge_progress', JSON.stringify(challengeData));
  };

  // 챌린지 참여하기 핸들러
  const handleJoinChallenge = async (challenge: ChallengeData) => {
    try {
      // 챌린지 완료 처리
      await completeChallenge(
        challenge.id.toString(),
        'daily',
        parseInt(challenge.reward.replace(/[^0-9]/g, '')), // 숫자만 추출
        challenge.title
      );
      
      // 로컬 상태 업데이트
      const updatedChallenges = challenges.map(c => 
        c.id === challenge.id 
          ? { ...c, progress: Math.min(c.progress + 25, 100) }
          : c
      );
      
      setChallenges(updatedChallenges);
      
      // localStorage에 상태 저장
      saveChallengesToStorage(updatedChallenges);
      
      alert(`${challenge.title} 챌린지에 참여했습니다!`);
    } catch (error) {
      console.error('챌린지 참여 실패:', error);
      alert('챌린지 참여 중 오류가 발생했습니다.');
    }
  };

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

  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

    // 먼저 localStorage에서 저장된 상태 확인
    const storedChallenges = loadChallengesFromStorage();
    if (storedChallenges) {
      setChallenges(storedChallenges);
      setLoading(false);
      return;
    }

    // localStorage에 데이터가 없으면 API에서 가져오기
    fetch(`${API_URL}/challenges/1`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("API 실패");
      })
      .then((data) => {
        setChallenges(data);
        saveChallengesToStorage(data); // 초기 데이터도 저장
      })
      .catch(() => {
        // API 실패 시 더미 데이터 사용
        setChallenges(dummyChallenges);
        saveChallengesToStorage(dummyChallenges); // 더미 데이터도 저장
      })
      .finally(() => {
        setLoading(false);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p>⏳ 로딩 중...</p>;

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

              <button 
                className="join-btn"
                onClick={() => handleJoinChallenge(c)}
              >
                참여하기
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Challenge;
