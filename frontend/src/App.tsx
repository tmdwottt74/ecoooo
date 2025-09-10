import React from 'react';
import './App.css';

import Chat from './Chat';
import Dashboard from './Dashboard';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Eco Chat AI</h1>
        <p>서울시와 함께하는 탄소 절감 챗봇</p>
      </header>
      <main>
        <Chat />
        <hr />
        <Dashboard />
      </main>
    </div>
  );
}

export default App;