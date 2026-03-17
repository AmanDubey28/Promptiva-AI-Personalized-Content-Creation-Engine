import React from 'react';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="chat-header">
      <div className="header-content">
        <h1 className="header-title">Promptiva AI</h1>
        <p className="header-subtitle">Personalized Content Creation Engine</p>
      </div>
      <div className="header-actions">
        <button className="header-btn">Settings</button>
      </div>
    </header>
  );
};

export default Header;
