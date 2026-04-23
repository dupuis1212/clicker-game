import { useState } from 'react';
import { useGameSelector, useActions } from '../hooks/useGameState';

export function CastorOverlay() {
  const activeEvents = useGameSelector((s) => s.activeEvents);
  const actions = useActions();
  const [flash, setFlash] = useState<{ key: number; fast: boolean } | null>(null);
  const castor = activeEvents.find((e) => e.type === 'castor');

  if (!castor && !flash) return null;
  if (!castor) {
    return (
      <div key={flash!.key} className="castor-flash">
        ✨ +{flash!.fast ? '120s' : '60s'} SPS !
      </div>
    );
  }

  const remaining = Math.max(0, castor.endsAt - Date.now());

  const handle = () => {
    const fast = Date.now() - castor.startedAt < 3_000;
    actions.chaseCastor(castor.startedAt);
    const key = Date.now();
    setFlash({ key, fast });
    setTimeout(() => setFlash((f) => (f && f.key === key ? null : f)), 1200);
  };

  return (
    <div className="castor-overlay" onClick={handle} role="button" aria-label="Chasser le castor">
      <div className="castor-emoji">🦫</div>
      <div className="castor-label">CASTOR !</div>
      <div className="castor-timer">Clique pour chasser ({(remaining / 1000).toFixed(1)}s)</div>
    </div>
  );
}
