import React from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  overlay?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "로딩 중...", 
  size = 'medium',
  overlay = false 
}) => {
  return (
    <div className={`loading-screen ${overlay ? 'overlay' : ''} ${size}`}>
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-ring">
            <div className="spinner-ring-inner"></div>
          </div>
          <div className="spinner-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
        <div className="loading-message">
          <div className="loading-text">{message}</div>
          <div className="loading-subtext">잠시만 기다려주세요</div>
        </div>
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

