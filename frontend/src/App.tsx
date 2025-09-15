import React, { useState, useRef, useEffect } from 'react';
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

// 추후 구현할 Service 페이지 (임시 placeholder)
const Challenge: React.FC = () => (
  <div style={{ padding: "2rem" }}>
    <h2>챌린지 페이지</h2>
  </div>
);

const Achievements: React.FC = () => (
  <div style={{ padding: "2rem" }}>
    <h2>업적/뱃지 페이지</h2>
  </div>
);

// 로고 텍스트 수정
const Logo: React.FC = () => (
  <h1 className="logo">
    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
      ECO 🌱 LIFE
    </Link>
  </h1>
);

// 메시지 타입 정의
interface Message {
  sender: 'user' | 'bot';
  text: string;
}

function App() {
  const [serviceOpen, setServiceOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLLIElement | null>(null);

  const toggleServiceMenu = () => {
    setServiceOpen((prev) => !prev);
  };

  // ✅ 바깥 클릭 시 닫힘 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setServiceOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const newsItems = [
    { id: 1, text: "오늘의 에너지 절약 팁: 사용하지 않는 플러그는 뽑아두세요!" },
    { id: 2, text: "Ecoo 챗봇과 함께 탄소 발자국을 줄여보세요." },
    { id: 3, text: "새로운 친환경 캠페인에 참여하고 에코 크레딧을 받으세요!" },
    { id: 4, text: "미래를 위한 지속 가능한 에너지, Ecoo와 함께 만들어가요." },
  ];

  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: '안녕하세요 👋 Eco Life 챗봇입니다!' },
    { sender: 'bot', text: '오늘 대중교통을 이용하셨나요?' },
  ]);

  return (
    <div className="App">
      {/* 헤더 */}
      <header className="main-header">
        <div className="container">
          <Logo />
          <nav className="main-nav">
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li className="dropdown" ref={dropdownRef}>
                <button className="dropdown-toggle" onClick={toggleServiceMenu}>
                  Service ▾
                </button>
                {serviceOpen && (
                  <ul className="dropdown-menu">
                    <li><Link to="/chat">Chat</Link></li>
                    <li><Link to="/mygarden">나만의 정원</Link></li>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/challenge">Challenge</Link></li>
                    <li><Link to="/achievements">Achievements</Link></li>
                  </ul>
                )}
              </li>
              <li><Link to="/credit">Credit</Link></li>
              <li><Link to="/notice">Notice</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* 메인 라우팅 */}
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <section id="hero" className="hero-section">
                <div className="hero-content">
                  #메인 세션
                  <NewsTicker news={newsItems} />
                </div>
                <div className="hero-bg"></div>
              </section>

              <section id="service" className="content-section service-experience-section">
                <div className="container">
                  <div className="section-header text-center">
                    <h2>서비스 체험</h2>
                    <p className="subtitle">
                      Ecoo 챗봇과 대시보드를 통해 탄소 절감 활동을 직접 경험해보세요.
                    </p>
                  </div>
                  <DashboardPage />
                </div>
              </section>
            </>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/mygarden" element={<MyGarden />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/challenge" element={<Challenge />} />
          <Route path="/achievements" element={<Achievements />} />
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
