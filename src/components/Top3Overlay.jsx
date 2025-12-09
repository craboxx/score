// src/components/Top3Overlay.jsx
import React from 'react';

const Top3Overlay = ({ visible, teams, rankLabels }) => {
  if (!visible || !teams || teams.length === 0) return null;

  const top3 = teams.slice(0, 3);
  const colors = ['gold', 'silver', 'bronze'];

  return (
    <div className={`top3-overlay ${visible ? 'show' : ''}`}>
      <div className="top3-inner">
        <div className="top3-title">Top 3 Teams</div>
        <div id="top3Container">
          {top3.map((team, index) => (
            <div key={team.id} className="top3-row">
              <div className={`top3-rank ${colors[index]}`}>
                {rankLabels[index] || `${index + 1}th`}
              </div>
              <img
                src={`/images/${team.logo}`}
                alt={team.name}
                className="top3-logo"
              />
              <div className="top3-team-name">{team.name}</div>
              <div className={`top3-score ${colors[index]}`}>{team.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Top3Overlay;
