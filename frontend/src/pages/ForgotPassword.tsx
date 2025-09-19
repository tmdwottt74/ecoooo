import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 비밀번호 재설정 이메일 전송 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (error) {
      alert('비밀번호 재설정 요청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-container">
        <div className="auth-background">
          <div className="auth-decoration">
            <div className="decoration-circle circle-1"></div>
            <div className="decoration-circle circle-2"></div>
            <div className="decoration-circle circle-3"></div>
          </div>
        </div>
        
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <div className="logo-container">
                <img src="/eco1-w.png" alt="ECO LIFE" className="logo-image" />
              </div>
              <p className="logo-tagline">환경 친화적인 생활을 위한 파라솔</p>
            </Link>
            <h2>이메일을 확인해주세요</h2>
            <p>비밀번호 재설정 링크를 보내드렸습니다</p>
          </div>

          <div className="success-message">
            <div className="success-icon">📧</div>
            <p>
              <strong>{email}</strong>로 비밀번호 재설정 링크를 보내드렸습니다.
            </p>
            <p className="success-subtext">
              이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정해주세요.
            </p>
          </div>

          <div className="auth-footer">
            <p>
              <Link to="/login" className="auth-link">
                로그인으로 돌아가기
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
            <Link to="/" className="auth-logo">
              <div className="logo-container">
                <img src="/eco1-w.png" alt="ECO LIFE" className="logo-image" />
              </div>
              <p className="logo-tagline">환경 친화적인 생활을 위한 파라솔</p>
            </Link>
          <h2>비밀번호 찾기</h2>
          <p>가입하신 이메일 주소를 입력해주세요</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <div className="input-container">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                required
              />
              <span className="input-icon">📧</span>
            </div>
          </div>

          <button type="submit" className="auth-btn primary" disabled={isLoading}>
            {isLoading ? '전송 중...' : '비밀번호 재설정 링크 보내기'}
          </button>

          <div className="auth-footer">
            <p>
              <Link to="/login" className="auth-link">
                로그인으로 돌아가기
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
