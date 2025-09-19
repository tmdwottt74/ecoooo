import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./Chat.css";
import { sessionService } from "../services/sessionService";
import { useLoading } from "../contexts/LoadingContext";
import { useCredits, getAuthHeaders } from "../contexts/CreditsContext";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";

/// <reference lib="dom" />

// 메시지 타입
interface Message {
  sender: "user" | "bot";
  text: string;
}

// 대시보드 데이터 인터페이스 정의
interface DashboardData {
  co2_saved_today: number;
  total_carbon_reduced: number;
  total_credits: number;
  garden_level: number;
  challenge_goal: number;
  challenge_progress: number;
}

const Chat: React.FC = () => {
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get("preview") === "1";

  const { creditsData } = useCredits();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // 실시간 크레딧 변경 애니메이션
  const [creditChange, setCreditChange] = useState<{amount: number, type: 'earn' | 'spend' | null}>({amount: 0, type: null});
  const [showCreditAnimation, setShowCreditAnimation] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  const currentUserId = user?.id;
  const userInfo = { name: user?.name || "김에코" };

  // 페이지 진입 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 크레딧 변경 애니메이션
  useEffect(() => {
    const handleCreditUpdate = (event: CustomEvent) => {
      const { change } = event.detail;
      if (change !== 0) {
        setCreditChange({
          amount: Math.abs(change),
          type: change > 0 ? 'earn' : 'spend'
        });
        setShowCreditAnimation(true);
        setTimeout(() => {
          setShowCreditAnimation(false);
          setCreditChange({amount: 0, type: null});
        }, 3000);
      }
    };
    window.addEventListener('creditUpdated', handleCreditUpdate as EventListener);
    return () => window.removeEventListener('creditUpdated', handleCreditUpdate as EventListener);
  }, []);

  // 저장된 메시지 복원
  useEffect(() => {
    const loadSavedMessages = async () => {
      if (!isPreview) {
        const savedMessages = await sessionService.getChatMessages();
        if (savedMessages.length > 0) {
          setMessages(savedMessages);
        }
      }
    };
    loadSavedMessages();
  }, [isPreview]);

  // 메시지 자동 저장
  useEffect(() => {
    if (!isPreview && messages.length > 0) {
      sessionService.saveChatMessages(messages);
    }
  }, [messages, isPreview]);

  // 음성 인식
  const handleVoiceInput = () => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      alert("죄송합니다. 음성 인식을 지원하지 않는 브라우저입니다.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = recognitionRef.current || new SpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = "ko-KR";
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsListening(true);
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      setInputValue(finalTranscript || interimTranscript);

      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = setTimeout(() => {
        recognition.stop();
      }, 3000);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("음성 인식 오류:", event.error);
      setIsListening(false);
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (inputValue.trim()) handleSendMessage();
    };

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  // 대시보드 응답
  const handleDashboardReply = async (
    intent: "절약량" | "포인트" | "정원" | "챌린지"
  ) => {
    if (!currentUserId) {
      // 로딩 메시지를 에러 메시지로 교체
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (newMessages[lastIndex].text === "답변을 생성하는 중...") {
          newMessages[lastIndex] = { sender: "bot", text: "사용자 정보를 불러올 수 없습니다." };
        }
        return newMessages;
      });
      setIsLoading(false);
      return;
    }

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/dashboard/`, {
        method: "GET",
        headers: headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
      const actualData: DashboardData = await response.json();

      let botText = "";
      if (intent === "절약량") {
        botText = `오늘은 ${actualData.co2_saved_today} g CO₂ 절약했고, 누적 절약량은 ${actualData.total_carbon_reduced} kg이에요 🌱`;
      } else if (intent === "포인트") {
        botText = `지금까지 총 ${actualData.total_credits} 포인트를 모았어요 💰`;
      } else if (intent === "정원") {
        botText = `현재 정원 레벨은 Lv.${actualData.garden_level} 입니다 🌳`;
      } else if (intent === "챌린지") {
        const percent = Math.round((actualData.challenge_progress / actualData.challenge_goal) * 100);
        botText = `🔥 챌린지 진행: 목표 ${actualData.challenge_goal} 중 ${actualData.challenge_progress} 달성 (${percent}%)`;
      }

      // 로딩 메시지를 실제 답변으로 교체
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (newMessages[lastIndex].text === "답변을 생성하는 중...") {
          newMessages[lastIndex] = { sender: "bot", text: botText };
        }
        return newMessages;
      });
    } catch (error) {
      console.error("Dashboard fetch 실패:", error);
      // 로딩 메시지를 에러 메시지로 교체
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (newMessages[lastIndex].text === "답변을 생성하는 중...") {
          newMessages[lastIndex] = { sender: "bot", text: "데이터 불러오기 실패" };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 추천 질문
  const recommendedQuestions = [
    "내가 절약한 탄소량은?",
    "내가 모은 포인트는?",
    "내 정원 레벨은?",
    "챌린지 진행 상황 알려줘",
    "탄소 절감 방법 알려줘",
    "포인트 적립 방법은?",
    "정원 관리 팁 주세요",
    "환경 친화적인 생활 방법은?",
  ];

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = { sender: "user", text: inputValue };
    const loadingMessage: Message = { sender: "bot", text: "답변을 생성하는 중..." };
    
    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInputValue("");
    setIsLoading(true);

    setTimeout(async () => {
      let botResponse = "";
      if (inputValue.includes("탄소") || inputValue.includes("절약") || inputValue.includes("CO2")) {
        await handleDashboardReply("절약량");
      } else if (inputValue.includes("포인트") || inputValue.includes("크레딧")) {
        await handleDashboardReply("포인트");
      } else if (inputValue.includes("정원") || inputValue.includes("식물")) {
        await handleDashboardReply("정원");
      } else if (inputValue.includes("챌린지") || inputValue.includes("도전")) {
        await handleDashboardReply("챌린지");
      } else {
        botResponse = "환경 관련 질문을 해주세요 🌱";
      }
      
      // 로딩 메시지를 실제 답변으로 교체
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (newMessages[lastIndex].text === "답변을 생성하는 중...") {
          newMessages[lastIndex] = { sender: "bot", text: botResponse };
        }
        return newMessages;
      });
      
      setIsLoading(false);
    }, 300);
  };

  // 미리보기 모드
  if (isPreview) {
    return (
      <div className="chat-preview">
        <div className="preview-header"><h3>🤖 에코 AI 챗봇</h3></div>
        <div className="preview-status">
          <div className="status-indicator"><div className="status-dot"></div><span>온라인</span></div>
        </div>
        <div className="preview-conversation">
          <div className="preview-message bot"><div className="preview-avatar">🤖</div><div className="preview-bubble">안녕하세요! 환경 친화적인 생활에 대해 무엇이든 물어보세요.</div></div>
          <div className="preview-message user"><div className="preview-bubble">탄소 절감 방법 알려줘</div><div className="preview-avatar">👤</div></div>
          <div className="preview-message bot"><div className="preview-avatar">🤖</div><div className="preview-bubble">대중교통, 자전거, 에너지 절약이 효과적이에요!</div></div>
        </div>
      </div>
    );
  }

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
        <div className="chat-header-right">
          <div className="credit-display-container">
            <div className={`chat-credit-display ${showCreditAnimation ? 'credit-updated' : ''}`}>
              💰 {creditsData.totalCredits}C
            </div>
            {showCreditAnimation && (
              <div className={`credit-change-animation ${creditChange.type}`}>
                {creditChange.type === "earn" ? "+" : "-"}{creditChange.amount}
              </div>
            )}
          </div>
          <div className="chat-status"><div className="status-dot"></div><span>온라인</span></div>
        </div>
      </div>

      <div className="welcome-section">
        <div className="welcome-avatar">🌱</div>
        <div className="welcome-content">
          <h4>안녕하세요, {userInfo.name}님!</h4>
          <p>탄소 절감, 에코 크레딧, 정원 관리 등 다양한 주제로 도움을 드릴게요.</p>
        </div>
      </div>

      <div className="message-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <div className="message-avatar">{msg.sender === "user" ? "👤" : "🤖"}</div>
            <div className="message-content">
              <div className={`message-bubble ${msg.text === "답변을 생성하는 중..." ? "loading" : ""}`}>
                <p>{msg.text}</p>
              </div>
              <div className="message-time">{new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"})}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}/>
      </div>

      <div className="quick-questions-section">
        <h4>💡 추천 질문</h4>
        <div className="quick-questions">
          {recommendedQuestions.map((q, idx) => (
            <button key={idx} onClick={() => setInputValue(q)} className="quick-question-btn">{q}</button>
          ))}
        </div>
      </div>

      <div className="input-area">
        <div className="input-container wide">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={isListening ? "말씀해주세요..." : "메시지를 입력하세요..."}
            className="message-input"
            disabled={isListening}
          />
          <button
            onClick={handleVoiceInput}
            className={`voice-button ${isListening ? "listening" : ""}`}
            disabled={isLoading}
          >
            {isListening ? "🔴" : "🎤"}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="send-button"
          >
            <span>전송</span><div className="send-icon">📤</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
