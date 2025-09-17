import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import "./App.css";
import DashboardPage from "./pages/DashboardPage";
import NewsTicker from "./components/NewsTicker";
import About from "./pages/About";
import Notice from "./pages/Notice";
import Contact from "./pages/Contact";
import Chat from "./pages/Chat";
import Credit from "./pages/Credit";
import CreditPoints from "./pages/CreditPoints";
import CreditRecent from "./pages/CreditRecent";
import ChallengeAchievements from "./pages/ChallengeAchievements";
import MyGarden from "./pages/MyGarden";
import { GardenProvider, GardenWithChat } from "./components/GardenChatIntegrations";


// 로고 컴포넌트
const Logo: React.FC = () => (
  <h1 className="logo">
    <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
      ECO 🌱 LIFE
    </Link>
  </h1>
);

function AppContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get("preview") === "1";

  // 페이지 이동 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 서비스 검색 데이터 ✅ (App 함수 안에만 유지)
  const serviceItems = [
    { id: 1, title: "포인트 조회", description: "적립된 포인트를 확인하세요", icon: "💰", path: "/credit/points" },
    { id: 2, title: "대중교통 이용내역", description: "최근 대중교통 이용 기록을 확인하세요", icon: "🚇", path: "/credit/recent" },
    { id: 3, title: "나만의 정원", description: "가상 정원을 꾸며보세요", icon: "🌱", path: "/mygarden" },
    { id: 4, title: "에코 AI 챗봇", description: "환경 친화적인 생활을 위한 AI 상담", icon: "🤖", path: "/chat" },
    { id: 5, title: "대시보드", description: "나의 에코 활동 현황을 확인하세요", icon: "📊", path: "/dashboard" },
    { id: 6, title: "챌린지 & 업적", description: "챌린지 참여하고 업적을 달성하세요", icon: "🏆", path: "/challenge-achievements" },
    { id: 8, title: "탄소 절감", description: "탄소 절감 방법을 알아보세요", icon: "🌍", path: "/dashboard" },
    { id: 9, title: "에코 크레딧", description: "에코 크레딧에 대해 알아보세요", icon: "💚", path: "/credit" },
    { id: 10, title: "정원 관리", description: "가상 정원 관리 팁을 확인하세요", icon: "🌿", path: "/mygarden" },
  ];

  // 검색 기능
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = serviceItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };


  const newsItems = [
    { id: 1, text: "오늘의 에너지 절약 팁: 사용하지 않는 플러그는 뽑아두세요!" },
    { id: 2, text: "Ecoo 챗봇과 함께 탄소 발자국을 줄여보세요." },
    { id: 3, text: "새로운 친환경 캠페인에 참여하고 에코 크레딧을 받으세요!" },
    { id: 4, text: "미래를 위한 지속 가능한 에너지, Ecoo와 함께 만들어가요." },
  ];

  return (
    <div className="App">
      {!isPreview && (
        <header className="main-header">
          <div className="container">
            <Logo />
            <nav className="main-nav">
              <div className="main-features">
                <Link to="/dashboard" className="main-feature-btn dashboard-btn">
                  <span className="feature-icon">📊</span>
                  <span className="feature-text">Dashboard</span>
                </Link>
                <Link to="/chat" className="main-feature-btn chat-btn">
                  <span className="feature-icon">🤖</span>
                  <span className="feature-text">AI 챗봇</span>
                </Link>
                <Link to="/mygarden" className="main-feature-btn garden-btn">
                  <span className="feature-icon">🌿</span>
                  <span className="feature-text">나만의 정원</span>
                </Link>
              </div>
              <ul className="secondary-nav">
                <li>
                  <Link to="/about">About Us</Link>
                </li>
                <li>
                  <Link to="/challenge-achievements">챌린지 & 업적</Link>
                </li>
                <li>
                  <Link to="/credit">Credit</Link>
                </li>
                <li>
                  <Link to="/notice">Notice</Link>
                </li>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
      )}

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <section id="hero" className="hero-section">
                  <div className="hero-content">
                    <h1 className="hero-title">
                      🌱 AI와 함께하는 친환경 생활
                    </h1>
                    <p className="hero-subtitle">
                      실시간 이동 인식으로 크레딧을 적립하고,<br/>AI 챗봇과 함께 지속가능한 미래를 만들어가세요
                    </p>
                    <div className="hero-features">
                      <div className="feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3>AI 챗봇</h3>
                        <p>환경 친화적인 생활을 위한<br/>개인 맞춤 상담</p>
                        <Link to="/chat" className="feature-btn">챗봇 시작하기</Link>
                      </div>
                      <div className="feature-card">
                        <div className="feature-icon">🚶‍♀️</div>
                        <h3>실시간 크레딧</h3>
                        <p>도보, 자전거, 대중교통 이용 시<br/>자동으로 크레딧 적립</p>
                        <Link to="/credit" className="feature-btn">크레딧 확인</Link>
                      </div>
                      <div className="feature-card">
                        <div className="feature-icon">🌿</div>
                        <h3>나만의 정원</h3>
                        <p>적립한 크레딧으로<br/>가상 정원을 꾸며보세요</p>
                        <Link to="/mygarden" className="feature-btn">정원 가기</Link>
                      </div>
                    </div>
                  </div>
                  <div className="hero-bg" />
                </section>

                <section className="news-ticker-section">
                  <NewsTicker news={newsItems} />
                </section>

                <section id="service" className="content-section service-experience-section">
                  <div className="container">
                    <div className="section-header text-center">
                      <h2>서비스 체험</h2>
                      <p className="subtitle">
                        AI 챗봇, 크레딧 현황, 나만의 정원을 통해 탄소 절감 활동을 직접 경험해보세요.
                      </p>
                    </div>
                    <div className="service-grid">
                      <div className="service-card">
                        <h3>🤖 AI 챗봇</h3>
                        <iframe
                          src="/chat?preview=1"
                          className="preview-frame"
                          title="AI Chatbot Preview"
                        ></iframe>
                        <Link to="/chat" className="detail-btn">
                          자세히
                        </Link>
                      </div>
                      <div className="service-card">
                        <h3>💰 크레딧 현황</h3>
                        <iframe
                          src="/credit?preview=1"
                          className="preview-frame"
                          title="Credit Preview"
                        ></iframe>
                        <Link to="/credit" className="detail-btn">
                          자세히
                        </Link>
                      </div>
                      <div className="service-card">
                        <h3>🌿 나만의 정원</h3>
                        <iframe
                          src="/mygarden?preview=1"
                          className="preview-frame"
                          title="My Garden Preview"
                        ></iframe>
                        <Link to="/mygarden" className="detail-btn">
                          자세히
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="search-section">
                  <div className="container">
                    <div className="search-container">
                      <h2 className="search-title">서비스 검색</h2>
                      <p className="search-subtitle">원하는 서비스를 빠르게 찾아보세요</p>

                      <div className="search-input-container">
                        <input
                          type="text"
                          placeholder="서비스를 검색하세요 (예: 포인트, 정원, 챗봇...)"
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="search-input"
                        />
                        {searchQuery && (
                          <button onClick={clearSearch} className="search-clear">
                            ✕
                          </button>
                        )}
                      </div>

                      {showSearchResults && (
                        <div className="search-results">
                          <div className="results-header">
                            <h3>검색 결과</h3>
                            <span className="results-count">{searchResults.length}개 서비스</span>
                          </div>

                          {searchResults.length > 0 ? (
                            <div className="results-list">
                              {searchResults.map((item) => (
                                <Link key={item.id} to={item.path} className="result-item">
                                  <div className="result-icon">{item.icon}</div>
                                  <div className="result-content">
                                    <h4 className="result-title">{item.title}</h4>
                                    <p className="result-description">{item.description}</p>
                                  </div>
                                  <div className="result-arrow">{">"}</div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="no-results">
                              <div className="no-results-icon">🔍</div>
                              <p className="no-results-text">검색 결과가 없습니다</p>
                              <p className="no-results-suggestion">다른 키워드로 검색해보세요</p>
                            </div>
                          )}
                        </div>
                      )}

                      {!showSearchResults && (
                        <div className="popular-searches">
                          <h3 className="popular-title">인기 검색어</h3>
                          <div className="popular-tags">
                            {["포인트", "정원", "챗봇", "대시보드", "챌린지", "업적", "탄소절감"].map((tag) => (
                              <button key={tag} onClick={() => handleSearch(tag)} className="popular-tag">
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/mygarden" element={<MyGarden />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/challenge-achievements" element={<ChallengeAchievements />} />
          <Route path="/credit" element={<Credit />} />
          <Route path="/credit/points" element={<CreditPoints />} />
          <Route path="/credit/recent" element={<CreditRecent />} />
          <Route path="/notice" element={<Notice />} />
          <Route path="/contact" element={<Contact />} />
                    <Route path="/gardenchat" element={<GardenWithChat />} />
        </Routes>
      </main>

      {!isPreview && location.pathname !== "/chat" && (
        <footer id="contact" className="main-footer-section">
          <div className="container">
            <Logo />
            <div className="footer-info">
              <p>서울시 AI 해커톤 8팀 충무로팀: 송인섭, 김규리, 이승재</p>
            </div>
            <p className="copyright">© SHINING All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <GardenProvider>
      <AppContent />
    </GardenProvider>
  );
}

export default App;
