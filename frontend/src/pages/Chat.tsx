import React, { useState, useEffect, useRef } from "react";
<<<<<<< HEAD
import { useAuth } from '../contexts/AuthContext';
import { useCredits } from '../contexts/CreditsContext';
import { getAuthHeaders } from '../contexts/CreditsContext';
=======
import { useLocation } from "react-router-dom";
import { useCredits } from '../contexts/CreditsContext'; // Add this line
import { useAuth } from '../contexts/AuthContext'; // Add this line
import { useUser } from '../contexts/UserContext';
import { getAuthHeaders } from '../contexts/CreditsContext'; // Add this line
>>>>>>> 20cdeef2606b3074ac01baad216e4ea7dbd897d5
import "./Chat.css";
/// <reference lib="dom" />

// Type definitions
interface Message { sender: "user" | "bot"; text: string; }
interface DashboardData { total_saved: number; total_points: number; garden_level: number; challenge: { goal: number; progress: number; }; }
interface ProposedChallenge { title: string; description: string; reward: number; target_mode?: 'BUS' | 'SUBWAY' | 'BIKE' | 'WALK' | 'CAR' | 'ANY'; target_saved_g?: number; target_distance_km?: number; }

// 대시보드 데이터 인터페이스 정의
interface DashboardData {
  co2_saved_today: number; // g
  total_carbon_reduced: number; // kg
  total_credits: number;
  garden_level: number;
  challenge_goal: number;
  challenge_progress: number;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
<<<<<<< HEAD
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

=======
  const [isListening, setIsListening] = useState<boolean>(false); // 음성 인식 상태
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null); // SpeechRecognition 인스턴스 참조
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null); // Timer for silence detection

  const { creditsData, error: creditsError } = useCredits(); // Get creditsData and error from context
  const { user: authUser } = useAuth(); // Get user from context
  const { user } = useUser();
  const currentUserId = authUser?.user_id; // Get current user ID

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 음성 인식 핸들러
  const handleVoiceInput = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      alert("죄송합니다. 이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해 주세요.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = recognitionRef.current || new SpeechRecognition();
    recognition.interimResults = true; // 중간 결과 반환
    recognition.lang = 'ko-KR'; // 한국어 설정
    recognition.continuous = true; // 연속 인식 활성화

    recognition.onstart = () => {
      setIsListening(true);
      setStatusMessage("말씀해주세요...");
      // Clear any previous timeout
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      setInputValue(finalTranscript || interimTranscript); // 최종 결과 또는 중간 결과 표시

      // Reset silence timeout on new speech
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      timeoutIdRef.current = setTimeout(() => {
        recognition.stop(); // Stop recognition after 3 seconds of silence
      }, 3000); // 3 seconds of silence
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("음성 인식 오류:", event.error);
      setIsListening(false);
      setStatusMessage(`음성 인식 오류: ${event.error}`);
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatusMessage("");
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      if (inputValue.trim()) {
        handleSendMessage(); // 인식이 끝나면 메시지 자동 전송
      }
    };

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      recognitionRef.current = recognition; // 인스턴스 저장
    }
  };

  // 상태 메시지 (음성 인식용)
  const [statusMessage, setStatusMessage] = useState<string>("");

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  // const userId = 1; // 예시 사용자 ID - currentUserId로 대체

  const userInfo = {
    name: authUser?.username || "김에코", // 실제 로그인 사용자명으로 교체
  };

  // ✅ 실제 데이터 기반 응답 핸들러
  const handleDashboardReply = async (
    intent: "절약량" | "포인트" | "정원" | "챌린지"
  ) => {
    setIsLoading(true);

    // Intents that can be answered from context
    if (intent === "포인트" || intent === "절약량" || intent === "정원") {
      setTimeout(() => {
        if (creditsError) {
          setMessages((prev) => [...prev, { sender: "bot", text: "서비스 수리 중입니다. 잠시 후 다시 시도해주세요." }]);
        } else {
          let botText = "";
          if (intent === "포인트") {
            const totalPoints = creditsData.totalCredits || 0;
            botText = `현재 보유하고 계신 크레딧은 총 ${totalPoints.toLocaleString()}C 입니다 💰`;
          } else if (intent === "절약량") {
            const totalCarbon = creditsData.totalCarbonReduced || 0;
            botText = `지금까지 총 ${totalCarbon.toFixed(1)} kg의 탄소(CO₂)를 절약하셨어요 🌱`;
          } else { // 정원
            const gardenLevel = user.gardenLevel || 0;
            botText = `현재 정원 레벨은 Lv.${gardenLevel} 입니다 🌳`;
          }
          setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
        }
        setIsLoading(false);
      }, 500);
      return;
    }

    // Fallback to fetch for intents that need it (e.g., 챌린지)
    if (!currentUserId) {
      setMessages((prev) => [...prev, { sender: "bot", text: "사용자 정보를 불러올 수 없습니다." }]);
      setIsLoading(false);
      return;
    }
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/dashboard/`, {
        method: 'GET',
        headers: headers,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const actualData: DashboardData = await response.json();

      let botText = "";
      if (intent === "챌린지") {
        const percent = Math.round((actualData.challenge_progress / actualData.challenge_goal) * 100);
        botText = `🔥 현재 챌린지 진행 상황: 목표 ${actualData.challenge_goal} kg 중 ${actualData.challenge_progress} kg 달성 (${percent}%)\n\n🎉 목표까지 ${(actualData.challenge_goal - actualData.challenge_progress).toFixed(1)} kg 남았어요!`;
      }
      const botMessage: Message = { sender: "bot", text: botText };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "데이터를 불러오는 데 실패했어요. 다시 시도해주세요." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 추천 질문 버튼 클릭
  const handleQuickSend = (text: string) => {
    const userMessage: Message = { sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);

    if (text.includes("챌린지")) {
      handleDashboardReply("챌린지");
    } else if (text.includes("탄소") || text.includes("절약")) {
      handleDashboardReply("절약량");
    } else if (text.includes("포인트")) {
      handleDashboardReply("포인트");
    } else if (text.includes("정원")) {
      handleDashboardReply("정원");
    } else {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "챗봇이 아직 학습 중이에요 🤖" },
      ]);
    }
  };

  // ✅ 추천 질문 리스트
>>>>>>> 20cdeef2606b3074ac01baad216e4ea7dbd897d5
  const recommendedQuestions = [
    "내가 절약한 탄소량은?", "내가 모은 포인트는?", "내 정원 레벨은?",
    "챌린지 진행 상황 알려줘", "탄소 절감 방법 알려줘", "포인트 적립 방법은?",
    "정원 관리 팁 주세요", "챌린지 추천해줘"
  ];

<<<<<<< HEAD
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
=======
  // ✅ 메시지 전송
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(async () => { // Make this async
      let botResponse = "";

      if (inputValue.includes("탄소") || inputValue.includes("절약") || inputValue.includes("CO2")) {
        await handleDashboardReply("절약량"); // Await the reply
      } else if (inputValue.includes("포인트") || inputValue.includes("크레딧")) {
        await handleDashboardReply("포인트"); // Await the reply
      } else if (inputValue.includes("정원") || inputValue.includes("식물")) {
        await handleDashboardReply("정원"); // Await the reply
      } else if (inputValue.includes("챌린지") || inputValue.includes("도전")) {
        await handleDashboardReply("챌린지"); // Await the reply
      } else if (inputValue.includes("안녕") || inputValue.includes("hello") || inputValue.includes("hi")) {
        botResponse = `안녕하세요! ${userInfo.name}님! 🌱\n\n환경 친화적인 생활에 대해 무엇이든 물어보세요. 탄소 절감, 에코 크레딧, 정원 관리 등 다양한 주제로 도움을 드릴게요!`;
      } else if (inputValue.includes("도움") || inputValue.includes("help")) {
        botResponse = `🤖 에코 AI 챗봇 도움말\n\n📋 주요 기능:\n• 탄소 절감 상담\n• 에코 크레딧 안내\n• 정원 관리 팁\n• 챌린지 진행 상황\n\n💡 추천 질문:\n• "내가 절약한 탄소량은?"\n• "포인트 적립 방법 알려줘"\n• "정원 레벨 확인해줘"\n• "챌린지 진행 상황은?"`;
      } else if (inputValue.includes("감사") || inputValue.includes("고마워")) {
        botResponse = `천만에요! 😊\n\n환경을 위해 함께 노력하는 ${userInfo.name}님을 응원해요! 🌍\n\n더 궁금한 것이 있으면 언제든 물어보세요!`;
      } else {
        const responses = [
          "환경 친화적인 생활에 대해 더 구체적으로 물어보시면 도움을 드릴게요! 🌱",
          "탄소 절감, 에코 크레딧, 정원 관리 등에 대해 궁금한 것이 있으시면 말씀해주세요! 💚",
          "환경 보호는 작은 실천에서 시작됩니다. 어떤 부분에 대해 알고 싶으신가요? 🌿",
          "에코 친화적인 생활을 위한 팁이나 정보를 제공해드릴 수 있어요! 무엇이 궁금하신가요? 🌍"
        ];
        botResponse = responses[Math.floor(Math.random() * responses.length)];
      }

      if (botResponse) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: botResponse }
        ]);
      }

      setIsLoading(false);
    }, 1000);
>>>>>>> 20cdeef2606b3074ac01baad216e4ea7dbd897d5
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
<<<<<<< HEAD
        <div className="input-container wide">
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleUserMessage(inputValue)} placeholder={isListening ? "음성 입력 중..." : "오늘의 활동을 알려주세요..."} className="message-input" disabled={isListening} />
          <button onClick={handleVoiceInput} className={`voice-button ${isListening ? 'listening' : ''}`} title="음성 입력">{isListening ? '🔴' : '🎤'}</button>
          <button onClick={() => handleUserMessage(inputValue)} disabled={isLoading || !inputValue.trim()} className="send-button"><span>전송</span><div className="send-icon">📤</div></button>
        </div>
      </div>
=======
  <div className="input-container wide">
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
      placeholder={isListening ? "말씀해주세요..." : "메시지를 입력하세요..."}
      className="message-input"
      disabled={isListening} // Disable input while listening
    />
    <button
      onClick={handleVoiceInput}
      className={`voice-button ${isListening ? 'listening' : ''}`}
      disabled={isLoading}
      title="음성 입력"
    >
      {isListening ? '🔴' : '🎤'}
    </button>
    <button
      onClick={handleSendMessage}
      disabled={isLoading || !inputValue.trim()}
      className="send-button"
    >
      <span>전송</span>
      <div className="send-icon">📤</div>
    </button>
  </div>
</div>



>>>>>>> 20cdeef2606b3074ac01baad216e4ea7dbd897d5
    </div>
  );
};

export default Chat;
