import React, { useState, useEffect, useRef } from "react";
import { useAuth } from '../contexts/AuthContext';
import { useCredits } from '../contexts/CreditsContext';
import { getAuthHeaders } from '../contexts/CreditsContext';
import "./Chat.css";

// Type definitions
interface Message { sender: "user" | "bot"; text: string; }
interface DashboardData { total_saved: number; total_points: number; garden_level: number; challenge: { goal: number; progress: number; }; }
interface ProposedChallenge { title: string; description: string; reward: number; target_mode?: 'BUS' | 'SUBWAY' | 'BIKE' | 'WALK' | 'CAR' | 'ANY'; target_saved_g?: number; target_distance_km?: number; }

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [proposedChallenge, setProposedChallenge] = useState<ProposedChallenge | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const { user } = useAuth();
  const { addCredits } = useCredits();
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  const userInfo = { name: user?.name || "김에코" };

  // Scroll to bottom of messages
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  // Fetch initial dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`${API_URL}/api/dashboard`, { headers: getAuthHeaders() });
        if (response.ok) setDashboardData(await response.json());
      } catch (error) { console.error("대시보드 데이터 API 연결 실패:", error); }
    };
    fetchDashboardData();
  }, [user, API_URL]);

  const recommendedQuestions = [
    "내가 절약한 탄소량은?", "내가 모은 포인트는?", "내 정원 레벨은?",
    "챌린지 진행 상황 알려줘", "탄소 절감 방법 알려줘", "포인트 적립 방법은?",
    "정원 관리 팁 주세요", "챌린지 추천해줘"
  ];

  // Handle standard, data-driven questions
  const getStandardResponse = (question: string): string | null => {
    if (!dashboardData) return "데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.";
    switch (question) {
      case "내가 절약한 탄소량은?": return `현재까지 총 ${dashboardData.total_saved.toFixed(2)} kg의 탄소를 절약하셨어요. 🌱`;
      case "내가 모은 포인트는?": return `지금까지 ${dashboardData.total_points} 포인트를 모으셨네요. 💰`;
      case "내 정원 레벨은?": return `현재 정원 레벨은 Lv.${dashboardData.garden_level} 입니다. 🌳`;
      case "챌린지 진행 상황 알려줘":
        const { goal, progress } = dashboardData.challenge;
        const percentage = goal > 0 ? Math.round((progress / goal) * 100) : 0;
        return `🔥 현재 '대중교통 이용 챌린지'는 ${percentage}% 진행 중입니다. (목표 ${goal}kg 중 ${progress.toFixed(1)}kg 달성)`;
      case "탄소 절감 방법 알려줘": return "대중교통 이용, 자전거 타기, 걷기, 에너지 절약, 친환경 제품 사용 등을 실천할 수 있습니다.";
      case "포인트 적립 방법은?": return "포인트는 친환경 이동수단 이용, 챌린지 참여, 정원 가꾸기 활동 등을 통해 적립할 수 있습니다.";
      case "정원 관리 팁 주세요": return "매일 정원에 방문하여 물을 주면 포인트를 얻고 식물도 성장시킬 수 있습니다.";
      default: return null;
    }
  };

  // Handle activity verification via API
  const handleActivityVerification = async (text: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/verify-activity`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ message: text }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || '활동 확인 중 오류 발생');
      setMessages(prev => [...prev, { sender: "bot", text: result.message }]);
      if (result.verified && result.bonus_credits > 0) {
        await addCredits(result.bonus_credits, "챗봇 활동 보너스");
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: "bot", text: error instanceof Error ? error.message : "활동을 확인하지 못했습니다." }]);
    } finally { setIsLoading(false); }
  };

  // Propose a new manual challenge
  const handleChallengeProposal = () => {
    const simpleChallenges: ProposedChallenge[] = [
      { title: "집안 분리수거하기", description: "재활용품을 올바르게 분리수거하여 환경 보호에 기여하세요.", reward: 10, target_mode: 'ANY', target_saved_g: 0, target_distance_km: 0 },
      { title: "개인 텀블러 사용하기", description: "오늘 하루, 일회용 컵 대신 개인 텀블러나 컵을 사용해보세요.", reward: 15, target_mode: 'ANY', target_saved_g: 0, target_distance_km: 0 },
      { title: "자전거 5km 타기", description: "자전거로 5km를 이동하여 탄소를 절감하세요.", reward: 50, target_mode: 'BIKE', target_distance_km: 5 }, // New auto-trackable example
    ];
    const proposal = simpleChallenges[Math.floor(Math.random() * simpleChallenges.length)];
    setProposedChallenge(proposal);
    setMessages(prev => [...prev, { sender: "bot", text: `이런 챌린지는 어떠세요? '${proposal.title}' (보상: ${proposal.reward}C). 참여하시겠어요? (네/아니오)` }]);
  };

  // Handle user accepting a proposed challenge
  const handleChallengeAcceptance = async () => {
    if (!proposedChallenge) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/ai-challenges/create-and-join`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(proposedChallenge) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || '챌린지 생성 실패');
      setMessages(prev => [...prev, { sender: "bot", text: "챌린지가 생성되었습니다! 챌린지 페이지에서 확인해보세요." }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: "bot", text: `오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` }]);
    } finally {
      setProposedChallenge(null);
      setIsLoading(false);
    }
  };

  // Main message handler
  const handleUserMessage = (text: string) => {
    if (!text.trim()) return;
    const userMessage: Message = { sender: "user", text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    if (proposedChallenge) {
      if (['네', '응', '좋아요', 'yes', 'y'].includes(text.toLowerCase())) {
        handleChallengeAcceptance();
      } else {
        setMessages(prev => [...prev, { sender: "bot", text: "알겠습니다. 다른 도움이 필요하시면 말씀해주세요." }]);
        setProposedChallenge(null);
      }
      return;
    }
    
    if (text.includes("챌린지 추천")) {
        handleChallengeProposal();
        return;
    }

    const standardResponse = getStandardResponse(text);
    if (standardResponse) {
      setIsLoading(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: "bot", text: standardResponse }]);
        setIsLoading(false);
      }, 500);
    } else {
      handleActivityVerification(text);
    }
  };

  // Voice input handler
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("죄송합니다. 이 브라우저는 음성 인식을 지원하지 않습니다.");
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => console.error("음성인식 오류", e.error);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInputValue(transcript);
      if (e.results[0].isFinal) {
        handleUserMessage(transcript);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <div className="chat-icon">🤖</div>
          <div className="chat-title-text">
            <h3>에코 AI 챗봇</h3>
            <p>환경 친화적인 생활을 위한 AI 어시스턴트</p>
          </div>
        </div>
      </div>
      <div className="message-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-avatar">{msg.sender === "user" ? "👤" : "🤖"}</div>
            <div className="message-content">
              <div className="message-bubble">
                <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot"><div className="message-avatar">🤖</div><div className="message-bubble loading"><div className="typing-indicator"><span></span><span></span><span></span></div></div></div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="quick-questions-section">
        <h4>💡 추천 질문</h4>
        <div className="quick-questions">
          {recommendedQuestions.map((q, idx) => (
            <button key={idx} onClick={() => handleUserMessage(q)} className="quick-question-btn">{q}</button>
          ))}
        </div>
      </div>
      <div className="input-area">
        <div className="input-container wide">
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleUserMessage(inputValue)} placeholder={isListening ? "음성 입력 중..." : "오늘의 활동을 알려주세요..."} className="message-input" disabled={isListening} />
          <button onClick={handleVoiceInput} className={`voice-button ${isListening ? 'listening' : ''}`} title="음성 입력">{isListening ? '🔴' : '🎤'}</button>
          <button onClick={() => handleUserMessage(inputValue)} disabled={isLoading || !inputValue.trim()} className="send-button"><span>전송</span><div className="send-icon">📤</div></button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
