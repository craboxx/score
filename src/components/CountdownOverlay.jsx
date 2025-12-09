// src/components/CountdownOverlay.jsx
import React from 'react';

const CountdownOverlay = ({ secondsRemaining, label }) => {
  if (secondsRemaining <= 0) return null;

  return (
    <div className="countdown-overlay">
      <div className="countdown-inner">
        {label && <div className="countdown-label">{label}</div>}
        <div key={secondsRemaining} className="countdown-number">
          {secondsRemaining}
        </div>
      </div>
    </div>
  );
};

export default CountdownOverlay;
