import React from 'react';
import './App.css';
import Chat from './Chat';
import Dashboard from './Dashboard';
import NewsTicker from './NewsTicker';

// 로고 컴포넌트 (실제 SVG나 이미지로 교체 가능)
const Logo = () => <h1 className="logo">SAMPLE ENERGY</h1>;

function App() {
  // 뉴스 티커에 표시될 더미 데이터
  const newsItems = [
    { id: 1, text: "오늘의 에너지 절약 팁: 사용하지 않는 플러그는 뽑아두세요!" },
    { id: 2, text: "Ecoo 챗봇과 함께 탄소 발자국을 줄여보세요." },
    { id: 3, text: "새로운 친환경 캠페인에 참여하고 에코 크레딧을 받으세요!" },
    { id: 4, text: "미래를 위한 지속 가능한 에너지, Ecoo와 함께 만들어가요." },
  ];

  return (
    <div className="App">
      {/* 메인 헤더 */}
      <header className="main-header">
        <div className="container">
          <Logo />
          <nav className="main-nav">
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#business">Business</a></li>
              <li><a href="#service">Service</a></li>
              <li><a href="#notice">Notice</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        {/* 메인 히어로 섹션 */}
        <section id="hero" className="hero-section">
          <div className="hero-content">
            <NewsTicker news={newsItems} />
          </div>
          <div className="hero-bg"></div>
        </section>

        <section id="about" className="content-section text-center">
          <div className="container">
            <h2>아름다운 자연을 보존하고<br />미래로 이끄는 변화는<br />신재생에너지로부터 시작합니다.</h2>
            <p className="subtitle">자연을 보존하며 신재생에너지를 보급할 수 있도록 혁신기술을 개발합니다.</p>
          </div>
        </section>

        <section id="business" className="cards-section">
          <div className="container">
            <div className="card">
              <div className="card-icon"><img src="https://placehold.co/80x80/1abc9c/ffffff?text=ESS" alt="ESS Icon" /></div>
              <h3>ESS AREA</h3>
              <p>최적화된 고객맞춤형 충전 솔루션</p>
            </div>
            <div className="card">
              <div className="card-icon"><img src="https://placehold.co/80x80/1abc9c/ffffff?text=SOLAR" alt="Solar Icon" /></div>
              <h3>WATER SOLAR POWER SYSTEM</h3>
              <p>수상 태양광 발전 시스템</p>
            </div>
            <div className="card">
              <div className="card-icon"><img src="https://placehold.co/80x80/1abc9c/ffffff?text=O%26M" alt="O&M Icon" /></div>
              <h3>OPERATION & MAINTENANCE</h3>
              <p>O&M 유지보수 사업</p>
            </div>
          </div>
        </section>

        <section id="service" className="content-section service-experience-section">
          <div className="container">
            <div className="section-header text-center">
                <h2>서비스 체험</h2>
                <p className="subtitle">Ecoo 챗봇과 대시보드를 통해 탄소 절감 활동을 직접 경험해보세요.</p>
            </div>
            <div className="service-grid">
              <Dashboard />
              <Chat />
            </div>
          </div>
        </section>

      </main>

      <footer id="contact" className="main-footer-section">
        <div className="container">
            <Logo />
            <div className="footer-info">
              
                <p> 서울시 AI 해커톤 8팀 충무로팀: 송인섭, 김규리, 이승재</p>
            </div>
            <p className="copyright">© SHINING All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
