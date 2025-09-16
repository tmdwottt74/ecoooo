import React, { useState } from "react";
import "./Chat.css";

// 메시지 타입
interface Message {
  sender: "user" | "bot";
  text: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  const userId = 1; // 예시 사용자 ID
  const userInfo = {
    name: "김에코", // 실제 로그인 사용자명으로 교체 가능
  };

  // ✅ 대시보드 & 챌린지 응답 핸들러
  const handleDashboardReply = async (
    intent: "절약량" | "포인트" | "정원" | "챌린지"
  ) => {
    try {
      if (intent === "챌린지") {
        const res = await fetch(`${API_URL}/challenge/${userId}`);
        const data = await res.json();
        const botMessage: Message = {
          sender: "bot",
          text: `🔥 현재 챌린지 진행 상황: 목표 ${(data.target / 1000).toFixed(
            0
          )} kg 중 ${(data.current / 1000).toFixed(1)} kg 달성 (${data.percent}%)`,
        };
        setMessages((prev) => [...prev, botMessage]);
        return;
      }

      const response = await fetch(`${API_URL}/dashboard/${userId}`);
      const data = await response.json();
      let botText = "";

      if (intent === "절약량") {
        botText = `오늘은 ${data.today_saved.toFixed(
          1
        )} g CO₂ 절약했고, 누적 절약량은 ${data.total_saved ?? "-"} kg이에요 🌱`;
      } else if (intent === "포인트") {
        botText = `지금까지 총 ${data.total_points} 포인트를 모았어요 💰`;
      } else if (intent === "정원") {
        botText = `현재 정원 레벨은 Lv.${data.garden_level} 입니다 🌳`;
      }

      const botMessage: Message = { sender: "bot", text: botText };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "데이터를 불러오지 못했어요 😢" },
      ]);
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
  const recommendedQuestions = [
    "내가 절약한 탄소량은?",
    "오늘의 탄소 절감 실천활동 기록하기",
    "내가 모은 포인트는?",
    "내 정원 레벨은?",
    "챌린지 진행 상황 알려줘",
  ];

  // ✅ 메시지 전송
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      if (inputValue.includes("탄소") || inputValue.includes("절약")) {
        await handleDashboardReply("절약량");
      } else if (inputValue.includes("포인트")) {
        await handleDashboardReply("포인트");
      } else if (inputValue.includes("정원")) {
        await handleDashboardReply("정원");
      } else {
        const response = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: "prototype_user",
            message: userMessage.text,
          }),
        });

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.response_message },
        ]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
  <h3 style={{ fontSize: '1rem' }}>AI 챗봇</h3>  

      {/* ✅ 상단 환영 메시지 */}
      <div className="welcome-message">
        {userInfo.name}님 안녕하세요! 무엇을 도와드릴까요? 🌱
      </div>

      {/* 메시지 출력 */}
      <div className="message-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}

        {isLoading && (
          <div className="message bot">
            <p>입력 중...</p>
          </div>
        )}
      </div>

      {/* 추천 질문 버튼 */}
      <div className="quick-questions">
        {recommendedQuestions.map((q, idx) => (
          <button key={idx} onClick={() => handleQuickSend(q)}>
            {q}
          </button>
        ))}
      </div>

      {/* 입력창 */}
      <div className="input-area">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="메시지를 입력하세요..."
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          전송
        </button>
      </div>
    </div>
  );
};

export default Chat;
