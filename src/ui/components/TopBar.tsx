import { useEffect, useState } from 'react';
import { useGameSelector } from '../hooks/useGameState';
import { format, formatRate } from '../../core/bignum';
import { totalSps } from '../../core/formulas';
import { LEVEL_BY_NUM, LEVELS } from '../../data/levels';
import { currentSeason, seasonLabel, SEASON_DURATION_MS } from '../../core/seasons';

export function TopBar() {
  const drops = useGameSelector((s) => s.drops);
  const sirop = useGameSelector((s) => s.sirop);
  const sucre = useGameSelector((s) => s.sucre);
  const level = useGameSelector((s) => s.level);
  const totalDrops = useGameSelector((s) => s.totalDropsEver);
  const sps = useGameSelector(totalSps);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(id);
  }, []);
  const season = currentSeason(now);
  const seasonInfo = seasonLabel(season);
  const seasonRemaining = SEASON_DURATION_MS - (now % SEASON_DURATION_MS);
  const seasonMin = Math.ceil(seasonRemaining / 60000);

  const safeLevel = Math.max(1, Math.min(20, level || 1));
  const currentLevel = LEVEL_BY_NUM[safeLevel] ?? LEVELS[0];
  const nextLevel = LEVEL_BY_NUM[safeLevel + 1];
  let pct = 100;
  if (nextLevel && currentLevel) {
    const delta = nextLevel.threshold.sub(currentLevel.threshold);
    const progress = totalDrops.sub(currentLevel.threshold);
    const ratioN = progress.div(delta).toNumber();
    const ratio = Number.isFinite(ratioN) ? ratioN : 0;
    pct = Math.max(0, Math.min(100, ratio * 100));
  }

  return (
    <header className="topbar">
      <div className="stat">
        <span className="stat-label">💧 Gouttes de sève</span>
        <span className="stat-value">{format(drops)}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Production</span>
        <span className="stat-value">{formatRate(sps)}</span>
      </div>
      {level >= 5 && (
        <div className="stat">
          <span className="stat-label">🍯 Sirop</span>
          <span className="stat-value">{format(sirop)}</span>
        </div>
      )}
      {level >= 10 && (
        <div className="stat">
          <span className="stat-label">🧊 Sucre</span>
          <span className="stat-value">{format(sucre)}</span>
        </div>
      )}
      <div className="stat season-stat" title={`${seasonInfo.effect} — encore ${seasonMin} min`}>
        <span className="stat-label">{seasonInfo.icon} Saison</span>
        <span className="stat-value" style={{ fontSize: '0.95rem' }}>
          {seasonInfo.name}
        </span>
      </div>
      <div className="level-bar">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span>
            Niv {safeLevel} — {currentLevel.name}
          </span>
          <span style={{ color: 'var(--text-dim)' }}>
            {nextLevel ? `${pct.toFixed(1)}%` : 'MAX'}
          </span>
        </div>
        <div className="level-bar-track">
          <div className="level-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        {nextLevel && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            → Niv {nextLevel.level}: {nextLevel.name} ({format(nextLevel.threshold)})
          </div>
        )}
      </div>
      {LEVELS.length > 0 && level === 20 && (
        <div className="stat" style={{ color: 'var(--accent)' }}>
          🍁 Érable Éternel
        </div>
      )}
    </header>
  );
}
