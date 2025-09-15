import React from 'react';
import Chat from './Chat';
import Dashboard from './Dashboard';
import MyGarden from './MyGarden';
import './App.css';

const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard-page">
      <div className="chat-section">
        <Chat />
      </div>
      <div className="dashboard-summary">
        <Dashboard />
      </div>
      <div className="garden-section">
        <MyGarden />
      </div>
    </div>
  );
};

export default DashboardPage;
export {};

