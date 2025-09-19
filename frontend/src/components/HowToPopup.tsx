import React, { useState} from 'react';
import './HowToPopup.css';

interface HowToPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToPopup: React.FC<HowToPopupProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowToday, setDontShowToday] = useState(false);

  const steps = [
    {
      id: 1,
      title: "🌱 ECO LIFE 시작하기",
      description: "AI와 함께하는 친환경 생활의 첫 걸음을 시작해보세요",
      icon: "🌍",
      details: [
        "실시간 이동 인식으로 자동 크레딧 적립",
        "대중교통, 자전거, 도보 이용 시 포인트 획득",
        "일상 속 작은 실천이 환경을 지킵니다"
      ]
    },
    {
      id: 2,
      title: "🤖 AI 챗봇과 상담하기",
      description: "환경 친화적인 생활을 위한 개인 맞춤 AI 상담",
      icon: "🤖",
      details: [
        "탄소 절감 방법과 팁을 AI에게 물어보세요",
        "개인 맞춤형 친환경 생활 가이드 제공",
        "실시간으로 환경 관련 질문에 답변해드립니다"
      ]
    },
    {
      id: 3,
      title: "💰 에코 크레딧 관리",
      description: "적립된 크레딧과 탄소 절감 현황을 한눈에 확인",
      icon: "💰",
      details: [
        "누적 크레딧과 탄소 절감량 실시간 확인",
        "활동별 상세 내역과 통계 조회",
        "친환경 활동에 따른 포인트 적립 현황"
      ]
    },
    {
      id: 4,
      title: "🌿 나만의 가상 정원",
      description: "크레딧으로 가상 정원을 꾸미고 식물을 키워보세요",
      icon: "🌿",
      details: [
        "물주기로 식물을 성장시키고 레벨업",
        "다양한 식물로 정원을 아름답게 꾸미기",
        "친환경 활동의 성과를 시각적으로 확인"
      ]
    },
    {
      id: 5,
      title: "🏆 챌린지 & 업적 시스템",
      description: "환경 보호 챌린지에 참여하고 업적을 달성하세요",
      icon: "🏆",
      details: [
        "월간/주간 친환경 챌린지 참여",
        "목표 달성 시 특별 업적과 보상 획득",
        "친구들과 함께 환경 보호 목표 달성하기"
      ]
    }
  ];

  const handleClose = () => {
    if (dontShowToday) {
      // 사용자별로 최초 1회만 표시하지 않도록 설정
      const userId = localStorage.getItem('userId') || 'default';
      localStorage.setItem(`howto-dont-show-${userId}`, 'true');
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="howto-popup-overlay">
      <div className="howto-popup">
        <div className="popup-header">
          <h2 className="popup-title">How to Use Ecoo</h2>
          <button className="popup-close" onClick={handleClose}>×</button>
        </div>

        <div className="popup-content">
          <div className="step-indicator">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>

          <div className="step-content">
            <div className="step-header">
              <div className="step-icon">{steps[currentStep].icon}</div>
              <div className="step-info">
                <h3 className="step-title">{steps[currentStep].title}</h3>
                <p className="step-description">{steps[currentStep].description}</p>
              </div>
            </div>

            <div className="step-details">
              <ul className="details-list">
                {steps[currentStep].details.map((detail, index) => (
                  <li key={index} className="detail-item">
                    <span className="detail-number">{index + 1}</span>
                    <span className="detail-text">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="popup-navigation">
            <button 
              className="nav-btn prev-btn"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              ← 이전
            </button>
            <span className="step-counter">
              {currentStep + 1} / {steps.length}
            </span>
            <button 
              className="nav-btn next-btn"
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
            >
              다음 →
            </button>
          </div>
        </div>

        <div className="popup-footer">
          <label className="dont-show-today">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
            />
            <span className="checkbox-text">다시 보지 않기</span>
          </label>
          <button className="close-btn" onClick={handleClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowToPopup;
