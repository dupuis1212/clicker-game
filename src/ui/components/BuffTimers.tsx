import { useEffect, useState } from 'react';
import { useGameSelector } from '../hooks/useGameState';
import type { EventType } from '../../core/types';

const BUFF_LABELS: Record<EventType, { icon: string; name: string }> = {
  goldenDrop: { icon: '✨', name: 'Frénésie dorée' },
  northWind: { icon: '❄️', name: 'Vent du nord' },
  miraculousHarvest: { icon: '🌾', name: 'Récolte miraculeuse' },
  fullMoon: { icon: '🌕', name: 'Pleine lune' },
  castor: { icon: '🦫', name: 'Castor' },
};

export function BuffTimers() {
  const events = useGameSelector((s) => s.activeEvents);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="buff-timers">
      {events.map((ev, i) => {
        const remaining = Math.max(0, (ev.endsAt - now) / 1000);
        const label = BUFF_LABELS[ev.type] ?? { icon: '⏳', name: ev.type };
        const total = (ev.endsAt - ev.startedAt) / 1000;
        const pct = total > 0 ? (remaining / total) * 100 : 0;
        return (
          <div key={i} className={`buff-timer ev-${ev.type}`}>
            <div className="buff-head">
              <span className="buff-icon">{label.icon}</span>
              <span className="buff-name">{label.name}</span>
              <span className="buff-time">{remaining.toFixed(1)}s</span>
            </div>
            <div className="buff-track">
              <div className="buff-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
