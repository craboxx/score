// src/components/CelebrationOverlay.jsx
import React from 'react';

const getHeadingForMode = (mode) => {
  switch (mode) {
    case 'first':
      return '1st Place';
    case 'second':
      return '2nd Place';
    case 'third':
      return '3rd Place';
    case 'top3':
      return 'Top 3 Teams';
    case 'text':
      return 'Announcement';
    default:
      return '';
  }
};

const CelebrationOverlay = ({ mode, message, styleLevel, teams }) => {
  if (!mode || mode === 'none') return null;

  const sortedTeams = teams || [];
  const heading = getHeadingForMode(mode);

  const colors = {
    first: 'gold',
    second: 'silver',
    third: 'bronze',
  };

  const colorClass = colors[mode] || '';

  const singleTeamMode =
    mode === 'first' || mode === 'second' || mode === 'third';

  const confettiCount =
    styleLevel === 'grand' ? 10 : styleLevel === 'medium' ? 80 : 40;

  const confettiPieces = Array.from({ length: confettiCount }).map((_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 4;
    const duration = 4 + Math.random() * 3;
    const size = 6 + Math.random() * 6;
    return (
      <div
        key={i}
        className="confetti-piece"
        style={{
          left: `${left}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          width: `${size}px`,
          height: `${size * 2}px`,
        }}
      />
    );
  });

  // === SINGLE TEAM LAYOUT (1st / 2nd / 3rd) ===
  if (singleTeamMode) {
    let team = null;
    if (mode === 'first' && sortedTeams[0]) team = sortedTeams[0];
    if (mode === 'second' && sortedTeams[1]) team = sortedTeams[1];
    if (mode === 'third' && sortedTeams[2]) team = sortedTeams[2];

    if (!team) return null;

    return (
      <div className="celebration-overlay">
        <div className="confetti-layer">{confettiPieces}</div>
        <div className="celebration-inner">
          {heading && (
            <div className={`celebration-title ${colorClass}`}>{heading}</div>
          )}

          <div className="celebration-single">
            <img
              src={`/images/${team.logo}`}
              alt={team.name}
              className="celebration-logo-big"
            />
            <div className="celebration-score-big">{team.score}</div>
          </div>
        </div>
      </div>
    );
  }

  // === TEXT ANNOUNCEMENT ===
  if (mode === 'text') {
    return (
      <div className="celebration-overlay">
        <div className="confetti-layer">{confettiPieces}</div>
        <div className="celebration-inner">
          {heading && <div className="celebration-title">{heading}</div>}
          <div className="celebration-text-message">
            {message || ' '}
          </div>
        </div>
      </div>
    );
  }

  // === TOP 3 LAYOUT ===
  const items = [];
  if (sortedTeams[0]) {
    items.push({
      team: sortedTeams[0],
      rankLabel: '1st',
      colorClass: 'gold',
    });
  }
  if (sortedTeams[1]) {
    items.push({
      team: sortedTeams[1],
      rankLabel: '2nd',
      colorClass: 'silver',
    });
  }
  if (sortedTeams[2]) {
    items.push({
      team: sortedTeams[2],
      rankLabel: '3rd',
      colorClass: 'bronze',
    });
  }

  return (
    <div className="celebration-overlay">
      <div className="confetti-layer">{confettiPieces}</div>
      <div className="celebration-inner">
        {heading && <div className="celebration-title">{heading}</div>}

        <div className="celebration-rows multi">
          {items.map(({ team, rankLabel, colorClass }) => (
            <div key={team.id} className="celebration-row">
              <div className={`celebration-rank ${colorClass}`}>
                {rankLabel}
              </div>
              <img
                src={`/images/${team.logo}`}
                alt={team.name}
                className="celebration-logo"
              />
              <div className="celebration-name">{team.name}</div>
              <div className={`celebration-score ${colorClass}`}>
                {team.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CelebrationOverlay;
