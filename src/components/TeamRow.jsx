// src/components/TeamRow.jsx
import React from 'react';

const TeamRow = ({ team, index, rankLabel, movement }) => {
  const movementClass =
    movement === 'up' ? 'moved-up' : movement === 'down' ? 'moved-down' : '';

  return (
    <div className={`score-row ${movementClass}`}>
      <div className="rank-label">{rankLabel}</div>
      <img
        src={`/images/${team.logo}`}
        alt={team.name}
        className="team-logo"
      />
      <div className="team-name">{team.name}</div>
<div className={`team-score ${movement === 'up' || movement === 'down' ? 'score-pop' : ''}`}>
  {team.score}
</div>

    </div>
  );
};

export default TeamRow;
