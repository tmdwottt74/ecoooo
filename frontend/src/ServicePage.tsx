import React, { useState } from 'react';
import Chat from './pages/Chat';
import MyGarden from './pages/MyGarden';
import './App.css'; // 스타일 재사용

const ServicePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'garden'>('chat');

  return (
    <div className="content-section">
      <div className="container">
        <h2 className="text-center">Service</h2>

        {/* 탭 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              padding: '10px 20px',
              margin: '0 10px',
              borderRadius: '20px',
              border: activeTab === 'chat' ? '2px solid #1abc9c' : '1px solid #ccc',
              backgroundColor: activeTab === 'chat' ? '#1abc9c' : '#fff',
              color: activeTab === 'chat' ? '#fff' : '#333',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('garden')}
            style={{
              padding: '10px 20px',
              margin: '0 10px',
              borderRadius: '20px',
              border: activeTab === 'garden' ? '2px solid #1abc9c' : '1px solid #ccc',
              backgroundColor: activeTab === 'garden' ? '#1abc9c' : '#fff',
              color: activeTab === 'garden' ? '#fff' : '#333',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            나만의 정원
          </button>
        </div>

        {/* 탭 내용 */}
        <div style={{ marginTop: '20px' }}>
          {activeTab === 'chat' && <Chat />}
          {activeTab === 'garden' && <MyGarden />}
        </div>
      </div>
    </div>
  );
};

export default ServicePage;
