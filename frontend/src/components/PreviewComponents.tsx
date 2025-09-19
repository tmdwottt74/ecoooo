import React, { useState, useEffect } from "react";
import { useCredits } from "../contexts/CreditsContext";
import { useUser } from "../contexts/UserContext";
import "./PreviewComponents.css";

// AI 챗봇 미리보기 - 재구성된 버전
export const ChatPreview: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '안녕하세요! 🌱 환경 친화적인 생활을 도와드리는 에코 AI입니다. 오늘 어떤 탄소 절감 활동을 하셨나요?',
      timestamp: new Date(),
      typing: false
    },
    {
      id: 2,
      type: 'user',
      content: '지하철로 출근했어요!',
      timestamp: new Date(),
      typing: false
    },
    {
      id: 3,
      type: 'bot',
      content: '훌륭해요! 🚇 지하철 이용으로 +150C가 적립되었습니다! 대중교통은 개인차 대비 70% 이상 탄소를 절약할 수 있어요.',
      timestamp: new Date(),
      typing: false,
      creditEarned: 150
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentDemo, setCurrentDemo] = useState(0);
  const { completeActivity } = useCredits();

  // 데모 시나리오들
  const demoScenarios = [
    { user: '자전거로 학교 갔어요!', bot: '멋져요! 🚲 자전거 이용으로 +80C 적립! 자전거는 0g CO₂ 배출로 가장 친환경적인 교통수단이에요.', credit: 80, activity: '자전거' },
    { user: '걸어서 편의점 갔어요', bot: '좋은 선택이에요! 🚶‍♂️ 도보로 +50C 적립! 걷기는 건강에도 좋고 탄소 배출도 0g이에요.', credit: 50, activity: '도보' },
    { user: '버스로 쇼핑했어요', bot: '훌륭해요! 🚌 버스 이용으로 +120C 적립! 대중교통은 환경보호의 첫걸음이에요.', credit: 120, activity: '버스' }
  ];

  // 자동 데모 시나리오 실행
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentDemo < demoScenarios.length) {
        const scenario = demoScenarios[currentDemo];
        
        // 사용자 메시지 추가
        const userMessage = {
          id: Date.now(),
          type: 'user' as const,
          content: scenario.user,
          timestamp: new Date(),
          typing: false
        };
        
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);
        
        // 2초 후 봇 응답
        setTimeout(() => {
          setIsTyping(false);
          const botMessage = {
            id: Date.now() + 1,
            type: 'bot' as const,
            content: scenario.bot,
            timestamp: new Date(),
            typing: false,
            creditEarned: scenario.credit
          };
          
          setMessages(prev => [...prev, botMessage]);
          
          // 실제 크레딧 추가
          completeActivity(scenario.activity, 5, 0.2, scenario.credit, '데모 활동');
          
          setCurrentDemo(prev => prev + 1);
        }, 2000);
      } else {
        // 데모 완료 후 초기화
        setTimeout(() => {
          setMessages([
            {
              id: 1,
              type: 'bot',
              content: '안녕하세요! 🌱 환경 친화적인 생활을 도와드리는 에코 AI입니다. 오늘 어떤 탄소 절감 활동을 하셨나요?',
              timestamp: new Date(),
              typing: false
            }
          ]);
          setCurrentDemo(0);
        }, 5000);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentDemo, demoScenarios, completeActivity]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      type: 'user' as const,
      content: inputMessage,
      timestamp: new Date(),
      typing: false
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    // 간단한 봇 응답 로직
    let botResponse = '';
    let creditEarned = 0;
    let activity = '';
    
    if (inputMessage.includes('대중교통') || inputMessage.includes('지하철') || inputMessage.includes('버스')) {
      botResponse = '훌륭해요! 🚇 대중교통 이용으로 +150C가 적립되었습니다! 대중교통은 개인차 대비 70% 이상 탄소를 절약할 수 있어요.';
      creditEarned = 150;
      activity = '대중교통';
      await completeActivity('대중교통', 10, 0.5, 150, '강남역 → 홍대입구역');
    } else if (inputMessage.includes('자전거')) {
      botResponse = '멋져요! 🚲 자전거 이용으로 +80C 적립! 자전거는 0g CO₂ 배출로 가장 친환경적인 교통수단이에요.';
      creditEarned = 80;
      activity = '자전거';
      await completeActivity('자전거', 5, 0.3, 80, '집 → 학교');
    } else if (inputMessage.includes('도보') || inputMessage.includes('걸어서')) {
      botResponse = '좋은 선택이에요! 🚶‍♂️ 도보로 +50C 적립! 걷기는 건강에도 좋고 탄소 배출도 0g이에요.';
      creditEarned = 50;
      activity = '도보';
      await completeActivity('도보', 2, 0.1, 50, '집 → 편의점');
    } else {
      botResponse = '환경 친화적인 활동을 응원합니다! 🌱 더 자세한 정보가 필요하시면 언제든 말씀해주세요.';
    }

    setTimeout(() => {
      setIsTyping(false);
      const newBotMessage = {
        id: Date.now() + 1,
        type: 'bot' as const,
        content: botResponse,
        timestamp: new Date(),
        typing: false,
        creditEarned: creditEarned
      };

      setMessages(prev => [...prev, newBotMessage]);
    }, 1500);

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-preview">
      <div className="preview-header">
        <div className="header-left">
          <div className="ai-avatar">🤖</div>
          <div className="header-info">
            <h4>에코 AI</h4>
            <div className="status-indicator online">
              <div className="status-dot"></div>
              온라인
            </div>
          </div>
        </div>
        <div className="header-features">
          <span className="feature-tag">실시간</span>
          <span className="feature-tag">개인화</span>
        </div>
      </div>
      
      <div className="preview-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}-message`}>
            {message.type === 'bot' ? (
              <>
                <div className="message-avatar">
                  <div className="avatar-icon">🤖</div>
                </div>
                <div className="message-content">
                  <div className="message-bubble bot-bubble">
                    {message.content}
                    {message.creditEarned && (
                      <div className="credit-notification">
                        <span className="credit-icon">💰</span>
                        <span className="credit-text">+{message.creditEarned}C 적립!</span>
                      </div>
                    )}
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="message-content">
                  <div className="message-bubble user-bubble">
                    {message.content}
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                <div className="message-avatar">
                  <div className="avatar-icon">👤</div>
                </div>
              </>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot-message typing-message">
            <div className="message-avatar">
              <div className="avatar-icon">🤖</div>
            </div>
            <div className="message-content">
              <div className="message-bubble bot-bubble typing-bubble">
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
      
      <div className="preview-input">
        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="환경 활동을 알려주세요..."
            className="message-input"
          />
          <button 
            className="send-btn" 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            <span className="send-icon">📤</span>
          </button>
        </div>
        <div className="quick-actions">
          <button className="quick-btn" onClick={() => setInputMessage('지하철로 출근했어요!')}>
            🚇 지하철
          </button>
          <button className="quick-btn" onClick={() => setInputMessage('자전거로 이동했어요!')}>
            🚲 자전거
          </button>
          <button className="quick-btn" onClick={() => setInputMessage('걸어서 갔어요!')}>
            🚶‍♂️ 도보
          </button>
        </div>
      </div>
    </div>
  );
};

// 크레딧 현황 미리보기
export const CreditPreview: React.FC = () => {
  const { creditsData } = useCredits();
  const { user } = useUser();
  const [recentActivities, setRecentActivities] = useState([
    { icon: '🚌', text: '지하철 이용 +150C', time: '2시간 전' },
    { icon: '🚲', text: '자전거 이용 +80C', time: '5시간 전' }
  ]);

  // 크레딧 데이터가 변경될 때 최근 활동 업데이트
  useEffect(() => {
    // localStorage에서 최근 크레딧 내역 가져오기
    const storedHistory = localStorage.getItem('credits_history');
    if (storedHistory) {
      try {
        const history = JSON.parse(storedHistory);
        const recent = history.slice(0, 2).map((item: any) => ({
          icon: item.reason?.includes('지하철') ? '🚌' : 
                item.reason?.includes('자전거') ? '🚲' : 
                item.reason?.includes('도보') ? '🚶‍♂️' : '🌱',
          text: `${item.reason} +${item.points}C`,
          time: new Date(item.created_at).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }));
        setRecentActivities(recent);
      } catch (error) {
        console.error('Error parsing credits history:', error);
      }
    }
  }, [creditsData.totalCredits, creditsData.lastUpdated]);

  return (
    <div className="credit-preview">
      <div className="preview-header">
        <h4>💰 크레딧 현황</h4>
      </div>
      <div className="user-info-card">
        <div className="user-avatar">🌱</div>
        <div className="user-details">
          <h5>{user.name} 님</h5>
          <p>동국대학교</p>
        </div>
      </div>
      <div className="credit-stats">
        <div className="stat-item">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-label">누적 크레딧</span>
            <span className="stat-value">{creditsData.totalCredits.toLocaleString()}C</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🌍</div>
          <div className="stat-info">
            <span className="stat-label">탄소 절감량</span>
            <span className="stat-value">{creditsData.totalCarbonReduced.toFixed(1)}kg CO₂</span>
          </div>
        </div>
      </div>
      <div className="recent-activities">
        <h6>최근 활동</h6>
        {recentActivities.map((activity, index) => (
          <div key={index} className="activity-item">
            <span className="activity-icon">{activity.icon}</span>
            <span className="activity-text">{activity.text}</span>
            <span className="activity-time">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 나만의 정원 미리보기
export const GardenPreview: React.FC = () => {
  const { creditsData, waterGarden } = useCredits();
  const { user } = useUser();
  const [waterCount, setWaterCount] = useState(0);
  const [isWatering, setIsWatering] = useState(false);

  // 크레딧에 따른 레벨 계산
  const gardenLevel = Math.floor(creditsData.totalCredits / 100) + 1;
  
  // 레벨별 식물 이미지와 단계
  const getPlantInfo = (level: number) => {
    const levelImages = ['🌰', '🌱', '🌿', '🍃', '🌼', '🌸', '🌳', '🌳', '🌳', '🌳', '🏡'];
    const levelNames = [
      '씨앗 단계', '싹 트는 단계', '새싹 단계', '어린 줄기 단계', '잎 전개 단계',
      '꽃봉오리 단계', '꽃 단계', '어린 나무 단계', '자라는 나무 단계', '우거진 나무 단계', '정원 완성 단계'
    ];
    
    return {
      image: levelImages[Math.min(level - 1, levelImages.length - 1)],
      stage: levelNames[Math.min(level - 1, levelNames.length - 1)]
    };
  };

  const plantInfo = getPlantInfo(gardenLevel);
  const progressPercentage = (waterCount / 10) * 100;

  const handleWater = async () => {
    if (isWatering) return;
    
    setIsWatering(true);
    try {
      const result = await waterGarden(10);
      if (result.success) {
        setWaterCount(prev => Math.min(prev + 1, 10));
      }
    } catch (error) {
      console.error('물주기 실패:', error);
    } finally {
      setIsWatering(false);
    }
  };

  return (
    <div className="garden-preview">
      <div className="preview-header">
        <h4>🌿 나만의 정원</h4>
        <div className="level-badge">Lv.{gardenLevel}</div>
      </div>
      <div className="garden-display">
        <div className="plant-container">
          <div className="plant-image">{plantInfo.image}</div>
          <div className="plant-stage">{plantInfo.stage}</div>
        </div>
        <div className="garden-stats">
          <div className="stat-chip">
            <span className="chip-icon">💰</span>
            <span className="chip-text">{creditsData.totalCredits.toLocaleString()}C</span>
          </div>
          <div className="stat-chip">
            <span className="chip-icon">🌱</span>
            <span className="chip-text">성장 중</span>
          </div>
        </div>
      </div>
      <div className="garden-actions">
        <div className="water-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <span className="progress-text">물주기 {waterCount}/10</span>
        </div>
        <button 
          className="water-btn" 
          onClick={handleWater}
          disabled={isWatering || creditsData.totalCredits < 10}
        >
          {isWatering ? '💧 물주는 중...' : '💧 물 주기 (-10C)'}
        </button>
      </div>
      <div className="garden-info">
        <p className="carbon-info">🌍 탄소 절감: {creditsData.totalCarbonReduced.toFixed(1)}kg CO₂</p>
      </div>
    </div>
  );
};
