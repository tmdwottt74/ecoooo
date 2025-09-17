import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./Chat.css";

// 메시지 타입
interface Message {
  sender: "user" | "bot";
  text: string;
}

const Chat: React.FC = () => {
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get("preview") === "1";
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const userId = 1; // 예시 사용자 ID

  const userInfo = {
    name: "김에코", // 실제 로그인 사용자명으로 교체 가능
  };

  // ✅ 더미 데이터 기반 응답 핸들러
  const handleDashboardReply = async (
    intent: "절약량" | "포인트" | "정원" | "챌린지"
  ) => {
    const dummyData = {
      co2_saved_today: 1850, // g
      total_saved: 18.5, // kg
      total_points: 1240,
      garden_level: 3,
      challenge: { goal: 20, progress: 18.5 }
    };

    let botText = "";

    if (intent === "절약량") {
      botText = `오늘은 ${dummyData.co2_saved_today} g CO₂ 절약했고, 누적 절약량은 ${dummyData.total_saved} kg이에요 🌱\n\n💡 탄소 절감 팁:\n• 대중교통 이용하기\n• 자전거 타기\n• 에너지 절약하기\n• 친환경 제품 사용하기`;
    } else if (intent === "포인트") {
      botText = `지금까지 총 ${dummyData.total_points} 포인트를 모았어요 💰\n\n🎯 포인트 적립 방법:\n• 지하철 이용: +150P\n• 자전거 이용: +80P\n• 친환경 활동: +100P\n• 에너지 절약: +50P`;
    } else if (intent === "정원") {
      botText = `현재 정원 레벨은 Lv.${dummyData.garden_level} 입니다 🌳\n\n🌱 정원 관리 팁:\n• 매일 물주기로 포인트 적립\n• 10번 물주기마다 레벨업\n• 다양한 식물로 정원 꾸미기\n• 친구들과 정원 공유하기`;
    } else if (intent === "챌린지") {
      const percent = Math.round((dummyData.challenge.progress / dummyData.challenge.goal) * 100);
      botText = `🔥 현재 챌린지 진행 상황: 목표 ${dummyData.challenge.goal} kg 중 ${dummyData.challenge.progress} kg 달성 (${percent}%)\n\n🎉 목표까지 ${(dummyData.challenge.goal - dummyData.challenge.progress).toFixed(1)} kg 남았어요!\n\n💪 챌린지 완주를 위한 활동:\n• 대중교통 이용하기\n• 자전거 타기\n• 도보로 이동하기`;
    }

    const botMessage: Message = { sender: "bot", text: botText };
    setMessages((prev) => [...prev, botMessage]);
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

  // ✅ 메시지 전송
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    setTimeout(() => {
      let botResponse = "";

      if (inputValue.includes("탄소") || inputValue.includes("절약") || inputValue.includes("CO2")) {
        handleDashboardReply("절약량");
      } else if (inputValue.includes("포인트") || inputValue.includes("크레딧")) {
        handleDashboardReply("포인트");
      } else if (inputValue.includes("정원") || inputValue.includes("식물")) {
        handleDashboardReply("정원");
      } else if (inputValue.includes("챌린지") || inputValue.includes("도전")) {
        handleDashboardReply("챌린지");
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
  };

  // 미리보기 모드
  if (isPreview) {
    return (
      <div className="chat-preview">
        <div className="preview-header">
          <h3>🤖 에코 AI 챗봇</h3>
        </div>
        <div className="preview-status">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>온라인</span>
          </div>
        </div>
        <div className="preview-conversation">
          <div className="preview-message bot">
            <div className="preview-avatar">🤖</div>
            <div className="preview-bubble">
              안녕하세요! 환경 친화적인 생활에 대해 무엇이든 물어보세요.
            </div>
          </div>
          <div className="preview-message user">
            <div className="preview-bubble">
              탄소 절감 방법을 알려주세요
            </div>
            <div className="preview-avatar">👤</div>
          </div>
          <div className="preview-message bot">
            <div className="preview-avatar">🤖</div>
            <div className="preview-bubble">
              대중교통 이용, 자전거 타기, 에너지 절약 등 다양한 방법이 있어요!
            </div>
          </div>
        </div>
        <div className="preview-features">
          <div className="feature-item">
            <span className="feature-icon">🌱</span>
            <span className="feature-text">탄소 절감 상담</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💰</span>
            <span className="feature-text">에코 크레딧 안내</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🌿</span>
            <span className="feature-text">정원 관리 팁</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-container ${isPreview ? "is-preview" : ""}`}>
      <div className="chat-header">
        <div className="chat-title">
          <div className="chat-icon">🤖</div>
          <div className="chat-title-text">
            <h3>에코 AI 챗봇</h3>
            <p>환경 친화적인 생활을 위한 AI 어시스턴트</p>
          </div>
        </div>
        <div className="chat-status">
          <div className="status-dot"></div>
          <span>온라인</span>
        </div>
      </div>

      <div className="welcome-section">
        <div className="welcome-avatar">🌱</div>
        <div className="welcome-content">
          <h4>안녕하세요, {userInfo.name}님!</h4>
          <p>환경 친화적인 생활에 대해 무엇이든 물어보세요. 탄소 절감, 에코 크레딧, 정원 관리 등 다양한 주제로 도움을 드릴게요.</p>
        </div>
      </div>

      <div className="message-window">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h4>대화를 시작해보세요!</h4>
            <p>아래 추천 질문을 클릭하거나 직접 메시지를 입력해보세요.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === "user" ? "👤" : "🤖"}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                </div>
                <div className="message-time">
                  {new Date().toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="message bot">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-bubble loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isPreview && (
        <div className="quick-questions-section">
          <h4>💡 추천 질문</h4>
          <div className="quick-questions">
            {recommendedQuestions.map((q, idx) => (
              <button key={idx} onClick={() => handleQuickSend(q)} className="quick-question-btn">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="input-area">
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="메시지를 입력하세요..."
            className="message-input"
          />
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
    </div>
  );
};

export default Chat;
