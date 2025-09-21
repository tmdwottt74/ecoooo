import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ServicePage.css';

const ServicePage: React.FC = () => {
  const [activeService, setActiveService] = useState<string | null>(null);

  const services = [
    {
      id: 'dashboard',
      title: '대시보드',
      description: '나의 친환경 활동 현황을 한눈에 확인하세요',
      icon: '📊',
      path: '/dashboard',
      features: ['탄소 절감량 추적', '크레딧 현황', '활동 통계', '목표 설정']
    },
    {
      id: 'garden',
      title: '나만의 정원',
      description: '크레딧으로 가상 정원을 꾸며보세요',
      icon: '🌿',
      path: '/garden',
      features: ['식물 성장', '물주기 시스템', '레벨업 시스템', '정원 꾸미기']
    },
    {
      id: 'chat',
      title: 'AI 챗봇',
      description: '친환경 생활에 대한 질문을 AI에게 물어보세요',
      icon: '🤖',
      path: '/chat',
      features: ['친환경 팁', '활동 추천', '질문 답변', '개인화된 조언']
    },
    {
      id: 'challenges',
      title: '챌린지 & 업적',
      description: '목표를 달성하고 업적을 쌓아가며 친환경 생활을 완성해보세요',
      icon: '🏆',
      path: '/challenges',
      features: ['월간 챌린지', '업적 시스템', '보상 지급', '진행률 추적']
    },
    {
      id: 'credits',
      title: '크레딧 관리',
      description: '친환경 활동으로 얻은 크레딧을 관리하세요',
      icon: '💰',
      path: '/credits',
      features: ['크레딧 적립', '사용 내역', '보상 시스템', '포인트 관리']
    },
    {
      id: 'admin',
      title: '관리자',
      description: '서비스 관리 및 모니터링 (관리자 전용)',
      icon: '⚙️',
      path: '/admin',
      features: ['사용자 관리', '챌린지 관리', '통계 분석', '시스템 모니터링']
    }
  ];

  return (
    <div className="service-page">
      <div className="service-header">
        <h1>Ecooo 서비스</h1>
        <p>친환경 생활을 위한 모든 기능을 한 곳에서 만나보세요</p>
      </div>

      <div className="services-grid">
        {services.map(service => (
          <div
            key={service.id}
            className={`service-card ${activeService === service.id ? 'active' : ''}`}
            onMouseEnter={() => setActiveService(service.id)}
            onMouseLeave={() => setActiveService(null)}
          >
            <div className="service-icon">{service.icon}</div>
            
            <div className="service-content">
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              
              <div className="service-features">
                {service.features.map((feature, index) => (
                  <span key={index} className="feature-tag">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="service-actions">
              <Link to={service.path} className="service-btn">
                서비스 이용하기
              </Link>
            </div>

            <div className="service-overlay">
              <div className="overlay-content">
                <h4>주요 기능</h4>
                <ul>
                  {service.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="service-info">
        <div className="info-card">
          <h3>🌱 친환경 생활의 시작</h3>
          <p>
            Ecooo는 일상 속 작은 실천들이 모여 큰 변화를 만든다는 믿음으로 시작되었습니다. 
            대중교통 이용, 자전거 타기, 에너지 절약 등 친환경 활동을 통해 크레딧을 얻고, 
            이를 통해 가상 정원을 키우며 지속가능한 생활을 경험해보세요.
          </p>
        </div>

        <div className="info-card">
          <h3>🎯 목표 달성의 즐거움</h3>
          <p>
            다양한 챌린지를 통해 친환경 생활의 목표를 설정하고 달성해보세요. 
            매일의 작은 실천이 쌓여 큰 성취감을 느낄 수 있으며, 
            AI 챗봇과 함께 더 나은 친환경 생활 방법을 찾아보세요.
          </p>
        </div>

        <div className="info-card">
          <h3>📊 데이터 기반 인사이트</h3>
          <p>
            개인의 친환경 활동 데이터를 분석하여 맞춤형 조언을 제공합니다. 
            탄소 절감량, 크레딧 적립 현황, 챌린지 진행률 등을 통해 
            나만의 친환경 생활 패턴을 파악하고 개선해보세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServicePage;
