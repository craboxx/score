// src/components/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { onValue, ref, set, update } from 'firebase/database';

const AdminPage = () => {
  const [teams, setTeams] = useState([]);
  const [localScores, setLocalScores] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [overlayStatus, setOverlayStatus] = useState('');

  const [countdownSeconds, setCountdownSeconds] = useState(3);
  const [overlayAction, setOverlayAction] = useState('first'); // 'text' | 'first' | 'second' | 'third' | 'top3'
  const [overlayText, setOverlayText] = useState('');
  const [displaySeconds, setDisplaySeconds] = useState(10);

  const [nupuramActive, setNupuramActive] = useState(false);

  // Load teams
  useEffect(() => {
    const teamsRef = ref(db, 'teams');
    const unsubscribe = onValue(teamsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setTeams([]);
        setLocalScores({});
        return;
      }

      const arr = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      // Sort alphabetically by name for easier editing
      arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      setTeams(arr);

      const newScores = {};
      arr.forEach((t) => {
        newScores[t.id] = t.score ?? 0;
      });
      setLocalScores(newScores);
    });

    return () => unsubscribe();
  }, []);

  // Track Nupuram state from overlayControl
  useEffect(() => {
    const controlRef = ref(db, 'overlayControl');
    const unsubscribe = onValue(controlRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.mode === 'nupuram') {
        setNupuramActive(true);
      } else {
        setNupuramActive(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleScoreChange = (teamId, value) => {
    setLocalScores((prev) => ({
      ...prev,
      [teamId]: value,
    }));
  };

  const handleUpdateScore = async (teamId) => {
    const raw = localScores[teamId];
    const numericScore = Number(raw);

    if (Number.isNaN(numericScore)) {
      setStatusMap((prev) => ({
        ...prev,
        [teamId]: 'error',
      }));
      return;
    }

    try {
      await update(ref(db, 'teams/' + teamId), { score: numericScore });
      setStatusMap((prev) => ({
        ...prev,
        [teamId]: 'success',
      }));
      setTimeout(() => {
        setStatusMap((prev) => ({
          ...prev,
          [teamId]: '',
        }));
      }, 1500);
    } catch (err) {
      console.error('Error updating score: ', err);
      setStatusMap((prev) => ({
        ...prev,
        [teamId]: 'error',
      }));
    }
  };

  const sendOverlay = async (payload) => {
    try {
      await set(ref(db, 'overlayControl'), {
        mode: 'none',
        message: '',
        countdownSeconds: 0,
        displaySeconds: 10,
        ...payload,
        triggerId: Date.now(),
      });
      setOverlayStatus('sent');
      setTimeout(() => setOverlayStatus(''), 1500);
    } catch (err) {
      console.error('Error triggering overlay:', err);
      setOverlayStatus('error');
      setTimeout(() => setOverlayStatus(''), 2000);
    }
  };

  const handleQuickOverlay = (mode) => {
    sendOverlay({
      mode,
      countdownSeconds: 0,
      message: '',
      displaySeconds: Number(displaySeconds) || 10,
    });
  };

  const handleCountdownSubmit = (e) => {
    e.preventDefault();
    const cd = Number(countdownSeconds) || 0;
    if (cd <= 0) return;

    const mode = overlayAction;
    const msg = mode === 'text' ? overlayText : '';

    sendOverlay({
      mode,
      countdownSeconds: cd,
      message: msg,
      displaySeconds: Number(displaySeconds) || 10,
    });
  };

  const handleNupuramClick = () => {
    if (nupuramActive) {
      // Turn off, back to scoreboard
      sendOverlay({ mode: 'none' });
    } else {
      // Show Nupuram instantly, no timers
      sendOverlay({ mode: 'nupuram' });
    }
  };

  return (
    <div className="admin-page">
      {/* Empty header container kept only for spacing / layout if needed */}
      <div className="admin-header" />

      {/* Live display & celebration controls */}
      <section className="admin-display-controls">
        <div className="admin-display-header-row">
          <h2>Live Display Controls</h2>
          {overlayStatus === 'sent' && (
            <span className="admin-status success">Sent</span>
          )}
          {overlayStatus === 'error' && (
            <span className="admin-status error">Error</span>
          )}
        </div>

        {/* Quick actions row */}
        <div className="admin-quick-buttons">
          <button
            type="button"
            className="admin-quick-btn gold"
            onClick={() => handleQuickOverlay('first')}
          >
            1st
          </button>
          <button
            type="button"
            className="admin-quick-btn silver"
            onClick={() => handleQuickOverlay('second')}
          >
            2nd
          </button>
          <button
            type="button"
            className="admin-quick-btn bronze"
            onClick={() => handleQuickOverlay('third')}
          >
            3rd
          </button>
          <button
            type="button"
            className="admin-quick-btn"
            onClick={() => handleQuickOverlay('top3')}
          >
            Top 3
          </button>
          <button
            type="button"
            className={`admin-quick-btn nupuram-btn ${
              nupuramActive ? 'active' : ''
            }`}
            onClick={handleNupuramClick}
          >
            Nupuram
          </button>
        </div>

        {/* Countdown and display time */}
        <form className="admin-countdown-form" onSubmit={handleCountdownSubmit}>
          <div className="admin-countdown-row">
            <div className="admin-countdown-field">
              <label htmlFor="countdownSeconds">Set countdown (seconds)</label>
              <input
                id="countdownSeconds"
                type="number"
                min="1"
                value={countdownSeconds}
                onChange={(e) => setCountdownSeconds(e.target.value)}
              />
            </div>

            <div className="admin-countdown-field">
              <label htmlFor="overlayAction">After countdown show</label>
              <select
                id="overlayAction"
                value={overlayAction}
                onChange={(e) => setOverlayAction(e.target.value)}
              >
                <option value="text">Report (text)</option>
                <option value="first">1st</option>
                <option value="second">2nd</option>
                <option value="third">3rd</option>
                <option value="top3">Top 3</option>
              </select>
            </div>
          </div>

          <div className="admin-countdown-row">
            <div className="admin-countdown-field">
              <label htmlFor="displaySeconds">Display time (seconds)</label>
              <input
                id="displaySeconds"
                type="number"
                min="1"
                value={displaySeconds}
                onChange={(e) => setDisplaySeconds(e.target.value)}
              />
            </div>
          </div>

          {overlayAction === 'text' && (
            <div className="admin-countdown-text-wrap">
              <label htmlFor="overlayText">
                Report anything here (full screen for selected time)
              </label>
              <textarea
                id="overlayText"
                className="admin-countdown-textarea"
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder="Type your announcement..."
              />
            </div>
          )}

          <div className="admin-countdown-footer">
            <button
              type="submit"
              className="admin-update-btn admin-countdown-submit"
            >
              Start Countdown
            </button>
          </div>
        </form>
      </section>

      {/* Score editing grid */}
      <section className="admin-container">
        {teams.length === 0 && (
          <div className="admin-loading">Loading teams...</div>
        )}

        <div className="admin-grid">
          {teams.map((team) => {
            const status = statusMap[team.id];
            return (
              <div key={team.id} className="admin-card">
                <div className="admin-card-header">
                  <img
                    src={`/images/${team.logo}`}
                    alt={team.name}
                    className="admin-team-logo"
                  />
                  <div className="admin-team-info">
                    <div className="admin-team-name">{team.name}</div>
                    <div className="admin-team-id">{team.id}</div>
                  </div>
                </div>

                <div className="admin-card-body">
                  <label className="admin-label" htmlFor={`score-${team.id}`}>
                    Score
                  </label>
                  <input
                    id={`score-${team.id}`}
                    type="number"
                    className="admin-score-input"
                    value={localScores[team.id] ?? ''}
                    onChange={(e) =>
                      handleScoreChange(team.id, e.target.value)
                    }
                  />
                </div>

                <div className="admin-card-footer">
                  <button
                    type="button"
                    className="admin-update-btn"
                    onClick={() => handleUpdateScore(team.id)}
                  >
                    Update Score
                  </button>
                  {status === 'success' && (
                    <span className="admin-status success">Updated</span>
                  )}
                  {status === 'error' && (
                    <span className="admin-status error">Error</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AdminPage;
