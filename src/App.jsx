// src/App.jsx
import React from 'react';
import ScoreboardPage from './components/ScoreboardPage';
import AdminPage from './components/AdminPage';
import './App.css';

const App = () => {
  const path = window.location.pathname.toLowerCase();
  const isAdmin = path.includes('admin');

  return (
    <>
      {/* Global confetti mount root outside of scoreboard */}
      <div id="confetti-root"></div>

      {/* Actual application */}
      <div className="app-root">
        {isAdmin ? <AdminPage /> : <ScoreboardPage />}
      </div>
    </>
  );
};

export default App;
