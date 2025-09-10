import React, { useState } from 'react';

// Define the structure of a message
interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user's message to the chat
    const userMessage: Message = { sender: 'user', text: inputValue };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message to the FastAPI backend
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'prototype_user', // Using a fixed user_id for the prototype
          message: inputValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Add bot's response to the chat
      const botMessage: Message = { sender: 'bot', text: data.response_message };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = { sender: 'bot', text: '오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h3>채팅 화면</h3>
      <div className="message-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        {isLoading && <div className="message bot"><p>입력 중...</p></div>}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
