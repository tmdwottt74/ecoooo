import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 감지
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 1023);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 모바일에서 사이드바 열기/닫기
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // 링크 클릭 시 스크롤 초기화 및 모바일에서 사이드바 닫기
  const handleLinkClick = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const sidebarItems = [
    {
      category: "서비스",
      items: [
        { path: "/chat", label: "AI 챗봇", icon: "🤖" },
        { path: "/mygarden", label: "나만의 정원", icon: "🌿" },
        { path: "/challenge-achievements", label: "챌린지 & 업적", icon: "🏆" },
        { path: "/dashboard", label: "대시보드", icon: "📊" },
        { path: "/credit", label: "Credit", icon: "💰" },
      ]
    },
    {
      category: "정보",
      items: [
        { path: "/notice", label: "Notice", icon: "📢" },
        { path: "/about", label: "About Us", icon: "ℹ️" },
        { path: "/user-info", label: "마이페이지", icon: "👤" },
        { path: "/contact", label: "Contact", icon: "📞" },
        { path: "/howto", label: "How to Use", icon: "❓" },
      ]
    }
  ];

  return (
    <>
      {/* 모바일 메뉴 버튼 */}
      {isMobile && (
        <button 
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          aria-label="메뉴 열기"
        >
          <span className="hamburger-icon">☰</span>
        </button>
      )}

      {/* 사이드바 오버레이 */}
      {isMobile && isOpen && (
        <div 
          className="sidebar-overlay active"
          onClick={toggleSidebar}
        />
      )}

      {/* 사이드바 */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo-link" onClick={handleLinkClick}>
            <img src="/eco1-w.png" alt="ECO LIFE" className="sidebar-logo-image" />
          </Link>
          {isMobile && (
            <button 
              className="sidebar-close-btn"
              onClick={toggleSidebar}
              aria-label="메뉴 닫기"
            >
              ✕
            </button>
          )}
        </div>
        
        <nav className="sidebar-nav">
          {sidebarItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              <h3 className="nav-section-title">{section.category}</h3>
              <ul className="nav-list">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="nav-item">
                    <Link
                      to={item.path}
                      className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                      onClick={handleLinkClick}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
