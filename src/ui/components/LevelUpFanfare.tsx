import { useEffect, useMemo } from 'react';
import { useGameSelector, useActions } from '../hooks/useGameState';
import { LEVEL_BY_NUM } from '../../data/levels';

const CONFETTI_EMOJIS = ['🍁', '✨', '🌟', '💫', '🎉', '⭐', '🍂'];

export function LevelUpFanfare() {
  const lvl = useGameSelector((s) => s.lastLevelUp);
  const actions = useActions();

  const confetti = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.8 + Math.random() * 1.2,
        rotation: Math.random() * 720 - 360,
        size: 1 + Math.random() * 1.4,
      })),
    [lvl],
  );

  useEffect(() => {
    if (lvl == null) return;
    const id = setTimeout(() => actions.dismissLevelUp(), 3500);
    return () => clearTimeout(id);
  }, [lvl, actions]);

  if (lvl == null) return null;
  const def = LEVEL_BY_NUM[lvl];
  if (!def) return null;

  return (
    <div className="fanfare-backdrop">
      <div className="fanfare-confetti">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="fanfare-confetto"
            style={{
              left: `${c.left}%`,
              fontSize: `${c.size}rem`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              ['--rot' as string]: `${c.rotation}deg`,
            }}
          >
            {c.emoji}
          </span>
        ))}
      </div>
      <div className="fanfare-card">
        <div className="fanfare-sparks">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="fanfare-spark"
              style={{ transform: `rotate(${i * 30}deg) translateY(-100px)` }}
            >
              ✨
            </span>
          ))}
        </div>
        <div className="fanfare-level">NIVEAU {lvl}</div>
        <div className="fanfare-name">{def.name}</div>
        <div className="fanfare-bonus">🎁 {def.bonus}</div>
        <div className="fanfare-burst">+60s SPS instant !</div>
      </div>
    </div>
  );
}
