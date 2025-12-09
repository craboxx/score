// src/components/ScoreboardPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { onValue, ref } from 'firebase/database';
import TeamRow from './TeamRow';
import CelebrationOverlay from './CelebrationOverlay';
import CountdownOverlay from './CountdownOverlay';
import NupuramOverlay from './NupuramOverlay';

const VIEW_COUNT = 4;
const SCROLL_DELAY_MS = 3000;

const rankLabels = [
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
  '6th',
  '7th',
  '8th',
  '9th',
];

const getCelebrationLevel = (mode) => {
  switch (mode) {
    case 'first':
    case 'top3':
    case 'text':
      return 'grand';
    case 'second':
      return 'medium';
    case 'third':
      return 'small';
    default:
      return 'small';
  }
};

const getCountdownLabel = (mode) => {
  switch (mode) {
    case 'first':
      return '1st Place Reveal';
    case 'second':
      return '2nd Place Reveal';
    case 'third':
      return '3rd Place Reveal';
    case 'top3':
      return 'Top 3 Reveal';
    case 'text':
      return 'Announcement';
    default:
      return '';
  }
};

const ScoreboardPage = () => {
  const [teams, setTeams] = useState([]);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [movementMap, setMovementMap] = useState({});
  const positionsRef = useRef({});
  const scrollIntervalRef = useRef(null);

  // 'idle' | 'countdown' | 'show' | 'nupuram'
  const [phase, setPhase] = useState('idle');
  const [overlayConfig, setOverlayConfig] = useState(null); // {mode, message, countdownSeconds, displaySeconds, styleLevel}
  const [countdownRemaining, setCountdownRemaining] = useState(0);
  const lastTriggerIdRef = useRef(null);

  // ==== TEAMS LISTENER ====
  useEffect(() => {
    const teamsRef = ref(db, 'teams');
    const unsubscribe = onValue(teamsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setTeams([]);
        return;
      }

      const newTeams = Object.entries(data)
        .map(([id, value]) => ({ id, ...value }))
        .sort((a, b) => b.score - a.score);

      const prevPositions = positionsRef.current || {};
      const newPositions = {};
      const newMovementMap = {};

      newTeams.forEach((team, index) => {
        newPositions[team.id] = index;
        if (prevPositions[team.id] !== undefined) {
          if (prevPositions[team.id] > index) {
            newMovementMap[team.id] = 'up';
          } else if (prevPositions[team.id] < index) {
            newMovementMap[team.id] = 'down';
          }
        }
      });

      positionsRef.current = newPositions;
      setMovementMap(newMovementMap);
      setTeams(newTeams);

      if (Object.keys(newMovementMap).length > 0) {
        setTimeout(() => {
          setMovementMap({});
        }, 500);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

// ==== CONTINUOUS SCROLL ====
useEffect(() => {
  let animationFrameId;
  let pos = 0;
  const speed = 0.4; // adjust for faster/slower movement

  const step = () => {
    pos += speed;

    const maxScroll = (teams.length * 25) - (VIEW_COUNT * 25);

    if (pos >= maxScroll) {
      pos = 0; // instant jump reset
    }

    setScrollIndex(pos / 25);

    animationFrameId = requestAnimationFrame(step);
  };

  if (teams.length > VIEW_COUNT) {
    animationFrameId = requestAnimationFrame(step);
  }

  return () => cancelAnimationFrame(animationFrameId);
}, [teams]);


  // ==== OVERLAY CONTROL LISTENER ====
  useEffect(() => {
    const controlRef = ref(db, 'overlayControl');
    const unsubscribe = onValue(controlRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setPhase('idle');
        setOverlayConfig(null);
        setCountdownRemaining(0);
        lastTriggerIdRef.current = null;
        return;
      }

      const {
        mode = 'none',
        message = '',
        countdownSeconds = 0,
        displaySeconds = 10,
        triggerId = 0,
      } = data;

      if (triggerId === lastTriggerIdRef.current) return;
      lastTriggerIdRef.current = triggerId;

      if (!mode || mode === 'none') {
        setPhase('idle');
        setOverlayConfig(null);
        setCountdownRemaining(0);
        return;
      }

      if (mode === 'nupuram') {
        setOverlayConfig(null);
        setCountdownRemaining(0);
        setPhase('nupuram');
        return;
      }

      // celebration / text
      const styleLevel = getCelebrationLevel(mode);
      const cfg = {
        mode,
        message,
        countdownSeconds: Number(countdownSeconds) || 0,
        displaySeconds: Number(displaySeconds) || 10,
        styleLevel,
      };
      setOverlayConfig(cfg);

      if (cfg.countdownSeconds > 0) {
        setCountdownRemaining(cfg.countdownSeconds);
        setPhase('countdown');
      } else {
        setCountdownRemaining(0);
        setPhase('show');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // ==== SHOW COUNTDOWN TIMER ====
  useEffect(() => {
    if (phase !== 'countdown' || !overlayConfig) return;

    let intervalId = setInterval(() => {
      setCountdownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setPhase('show');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [phase, overlayConfig]);

  // ==== AUTO CLOSE CELEBRATION/TEXT AFTER displaySeconds ====
  useEffect(() => {
    if (phase !== 'show' || !overlayConfig) return;

    const sec = overlayConfig.displaySeconds || 10;
    const timeoutId = setTimeout(() => {
      setPhase('idle');
      setOverlayConfig(null);
    }, sec * 1000);

    return () => clearTimeout(timeoutId);
  }, [phase, overlayConfig]);

  const translateY = `translate3d(0, -${scrollIndex * 25}vh, 0)`;

  const countdownLabel =
    phase === 'countdown' && overlayConfig
      ? getCountdownLabel(overlayConfig.mode)
      : '';

  const showBackgroundOverlay =
    phase === 'countdown' || phase === 'show' || phase === 'nupuram';

  return (
    <>
      {showBackgroundOverlay && <div className="celebration-background" />}

      {/* Countdown before reveal */}
      {phase === 'countdown' && overlayConfig && (
        <CountdownOverlay
          secondsRemaining={countdownRemaining}
          label={countdownLabel}
        />
      )}

      {/* Celebration / text phase */}
{phase === 'show' && overlayConfig && (
  <CelebrationOverlay
    mode={overlayConfig.mode}
    message={overlayConfig.message}
    styleLevel={overlayConfig.styleLevel}
    teams={teams}
  />
)}


      {/* Nupuram ad overlay */}
      {phase === 'nupuram' && <NupuramOverlay />}

      {/* Scrollable scoreboard (hidden during overlays) */}
      <div
        className={`scoreboard-viewport ${
          phase !== 'idle' ? 'hidden' : ''
        }`}
      >
        <div className="rows-wrapper" style={{ transform: translateY }}>
          {teams.map((team, index) => (
            <TeamRow
              key={team.id}
              team={team}
              index={index}
              rankLabel={rankLabels[index] || `${index + 1}th`}
              movement={movementMap[team.id]}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ScoreboardPage;
