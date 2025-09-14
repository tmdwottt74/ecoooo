import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import './App.css'
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MobilityLogPage from './pages/MobilityLogPage';
import ChallengePage from './pages/ChallengePage';
import RecommendationPage from './pages/RecommendationPage';
import ChatbotPage from './pages/ChatbotPage'; // ChatbotPage 임포트

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mobility" element={<MobilityLogPage />} />
          <Route path="/challenges" element={<ChallengePage />} />
          <Route path="/recommendations" element={<RecommendationPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} /> {/* ChatbotPage 라우트 추가 */}
          {/* 다른 라우트들을 여기에 추가할 예정 */}
        </Routes>
      </div>
    </>
  )
}

export default App
