import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 1. BrowserRouter를 import 합니다.
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* 2. <App /> 컴포넌트를 <BrowserRouter>로 감쌉니다. */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();