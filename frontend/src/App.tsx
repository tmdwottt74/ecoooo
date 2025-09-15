import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import DashboardPage from './DashboardPage';
import NewsTicker from './NewsTicker';
import About from './About';
import Notice from './Notice';
import Contact from './Contact';
import Chat from './Chat';
import Credit from './Credit';
import MyGarden from './MyGarden';

// 로고 텍스트 수정
const Logo = () => (
  <h1 className="logo">
    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
      SAVE ENERGY
    </Link>
  </h1>
);

// ✅ ServicePage 정의 (탭/구역으로 Chat, MyGarden 보여주기)
const ServicePage: React.FC = () => (
  <div className="service-page container" style={{ padding: "2rem" }}>
    <h2>서비스 체험</h2>
    <p className="subtitle">Ecoo의 주요 기능을 직접 체험해보세요.</p>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "2rem" }}>
      <div>
        <h3>AI Chatbot</h3>
        <Chat />
      </div>
      <div>
        <h3>나만의 정원</h3>
        <MyGarden />
      </div>
    </div>
  </div>
);

function App() {
  const newsItems = [
    { id: 1, text: "오늘의 에너지 절약 팁: 사용하지 않는 플러그는 뽑아두세요!" },
    { id: 2, text: "Ecoo 챗봇과 함께 탄소 발자국을 줄여보세요." },
    { id: 3, text: "새로운 친환경 캠페인에 참여하고 에코 크레딧을 받으세요!" },
    { id: 4, text: "미래를 위한 지속 가능한 에너지, Ecoo와 함께 만들어가요." },
  ];

  return (
    <div className="App">
      {/* 헤더 */}
      <header className="main-header">
        <div className="container">
          <Logo />
          <nav className="main-nav">
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li className="dropdown">
                <span>Service ▾</span>
                <ul className="dropdown-menu">
                  <li><Link to="/chat">Chat</Link></li>
                  <li><Link to="/mygarden">나만의 정원</Link></li>
                </ul>
              </li>
              <li><Link to="/credit">Credit</Link></li>
              <li><Link to="/notice">Notice</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* 메인 라우팅 영역 */}
      <main>
        <Routes>
          {/* 홈 */}
          <Route path="/" element={
            <>
              <section id="hero" className="hero-section">
                <div className="hero-content">
                  <h2>탄소 절약, AI와 함께 시작하세요 🌱</h2>
                  <NewsTicker news={newsItems} />
                </div>
                <div className="hero-bg"></div>
              </section>

              <section id="service" className="content-section service-experience-section">
                <div className="container">
                  <div className="section-header text-center">
                    <h2>서비스 체험</h2>
                    <p className="subtitle">Ecoo 챗봇과 대시보드를 통해 탄소 절감 활동을 직접 경험해보세요.</p>
                  </div>
                  <DashboardPage />
                </div>
              </section>
            </>
          } />

          {/* 페이지 라우트 */}
          <Route path="/about" element={<About />} />
          <Route path="/service" element={<ServicePage />} /> {/* ✅ 에러 해결 */}
          <Route path="/chat" element={<Chat />} />
          <Route path="/mygarden" element={<MyGarden />} />
          <Route path="/credit" element={<Credit />} />
          <Route path="/notice" element={<Notice />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      {/* 푸터 */}
      <footer id="contact" className="main-footer-section">
        <div className="container">
          <Logo />
          <div className="footer-info">
            <p>서울시 AI 해커톤 8팀 충무로팀: 송인섭, 김규리, 이승재</p>
          </div>
          <p className="copyright">© SHINING All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
