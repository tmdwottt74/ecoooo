import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getAuthHeaders } from "../contexts/CreditsContext";

const styles = `
.challenge-page { padding: 2rem; text-align: center; background-color: #fdfdf5; min-height: 100vh; }
.challenge-title { font-size: 2rem; margin-bottom: 0.5rem; color: #2e7d32; }
.challenge-subtitle { font-size: 1rem; margin-bottom: 2rem; color: #555; }
.challenge-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
.challenge-card { background: #ffffff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); transition: transform 0.2s ease; text-align: left; }
.challenge-card:hover { transform: translateY(-5px); }
.challenge-card h3 { margin-bottom: 0.5rem; font-size: 1.3rem; color: #1b5e20; }
.challenge-card .desc { font-size: 0.95rem; color: #444; margin-bottom: 1rem; }
.progress-bar { background: #e0e0e0; border-radius: 8px; height: 10px; margin: 1rem 0; overflow: hidden; }
.progress-fill { background: linear-gradient(90deg, #66bb6a, #43a047); height: 100%; transition: width 0.3s ease; }
.progress-text { font-size: 0.9rem; color: #444; }
.reward { font-weight: bold; margin: 1rem 0; color: #1abc9c; }
.action-btn { margin-top: 0.5rem; padding: 0.7rem 1.2rem; color: white; border: none; border-radius: 8px; cursor: pointer; transition: background 0.2s ease; width: 100%; font-size: 1rem; font-weight: 600; }
.join-btn { background: #2e7d32; }
.join-btn:hover { background: #1b5e20; }
.complete-btn { background: #3498db; }
.complete-btn:hover { background: #2980b9; }
.action-btn:disabled { background: #9e9e9e; cursor: not-allowed; }
`;

interface ChallengeData {
  id: number;
  title: string;
  description: string;
  progress: number;
  reward: string;
  is_joined: boolean;
  completion_type: 'AUTO' | 'MANUAL';
  completed_at: string | null;
}

const Challenge: React.FC = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentUserId = user?.id;
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

  const fetchChallenges = async () => {
    if (!currentUserId) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/challenges/`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('챌린지 정보 로딩 실패');
      const data = await response.json();
      setChallenges(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [currentUserId]);

  const handleJoinChallenge = async (challengeId: number) => {
    // ... (join logic remains the same)
  };

  const handleCompleteChallenge = async (challengeId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/challenges/${challengeId}/complete`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || '챌린지 완료에 실패했습니다.');
      }
      alert(result.message);
      fetchChallenges(); // Refresh challenges list
    } catch (error) {
      alert(error instanceof Error ? error.message : '챌린지 완료 중 오류 발생');
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
        <p className="challenge-subtitle">목표를 달성하면 Eco 크레딧과 뱃지를 획득할 수 있어요!</p>
        <div className="challenge-grid">
          {challenges.map((c) => (
            <div key={c.id} className="challenge-card">
              <h3>{c.title}</h3>
              <p className="desc">{c.description}</p>
              
              {c.completion_type === 'MANUAL' ? (
                <div className="manual-challenge-section">
                  <p className="reward">🎁 보상: {c.reward}</p>
                  {c.completed_at ? (
                    <button className="action-btn" disabled>완료됨</button>
                  ) : (
                    <button className="action-btn complete-btn" onClick={() => handleCompleteChallenge(c.id)}>완료하기</button>
                  )}
                </div>
              ) : (
                <div className="auto-challenge-section">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${c.progress.toFixed(1)}%` }}/>
                  </div>
                  <p className="progress-text">{c.progress.toFixed(1)}% 달성</p>
                  <p className="reward">🎁 보상: {c.reward}</p>
                </div>
              )}

              {!c.is_joined && c.completion_type === 'AUTO' && (
                 <button className="action-btn join-btn" onClick={() => handleJoinChallenge(c.id)}>참여하기</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Challenge;
