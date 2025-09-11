import React from 'react';
import './App.css';
import Chat from './Chat';
import Dashboard from './Dashboard';
import NewsTicker from './NewsTicker';

// Placeholder for logo, can be replaced with an actual SVG or image
const Logo = () => <h1 className="logo">SAMPLE ENERGY</h1>;

function App() {
  const newsItems = [
    { id: 1, text: "오늘의 에너지 절약 팁: 사용하지 않는 플러그는 뽑아두세요!" },
    { id: 2, text: "Ecoo 챗봇과 함께 탄소 발자국을 줄여보세요." },
    { id: 3, text: "새로운 친환경 캠페인에 참여하고 에코 크레딧을 받으세요!" },
    { id: 4, text: "미래를 위한 지속 가능한 에너지, Ecoo와 함께 만들어가요." },
  ];

  return (
    <div className="App">
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
        <section id="hero" className="hero-section">
          <div className="hero-content">
            #메인 세션
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
                <p>경기 부천시 원미구 신흥로 223 신중동역 랜드마크 푸르지오 시티 101동 오피스 49층 | 상호 : 샤이닝 | 대표 : 오성민</p>
                <p>사업자 번호 : 130-37-46318 | 통신판매업종신고 : 제2010-경기부천-924호</p>
                <p>대표번호: 1554-6062 | 팩스 : 0505-200-6060 | 이메일 : hdweb@hdweb.co.kr</p>
            </div>
            <p className="copyright">© SHINING All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
