import { useState } from 'react';
import Decimal from 'break_infinity.js';
import { useGameStore } from '../../engine/store';
import { format } from '../../core/bignum';

export function OfflinePopup() {
  const [closed, setClosed] = useState(false);
  const offline = useGameStore((s) => (s as any).offlineGain as { seconds: number; gained: string } | null);
  if (closed || !offline) return null;

  const hours = Math.floor(offline.seconds / 3600);
  const minutes = Math.floor((offline.seconds % 3600) / 60);
  const gained = new Decimal(offline.gained);

  const close = () => {
    setClosed(true);
    useGameStore.setState({ offlineGain: null } as any);
  };

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🍁 Bon retour !</h2>
          <button onClick={close} aria-label="Fermer">✕</button>
        </div>
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
            Tu as été absent pendant
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem' }}>
            {hours > 0 ? `${hours}h ` : ''}{minutes}min
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
            Pendant ton absence, tu as produit
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--accent)', margin: '0.5rem 0 1.5rem' }}>
            +{format(gained)} 💧
          </div>
          <button
            onClick={close}
            style={{
              padding: '0.8rem 2rem',
              background: 'var(--maple)',
              color: 'var(--wood-trim)',
              fontWeight: 700,
              border: 'none',
            }}
          >
            Continuer à récolter
          </button>
        </div>
      </div>
    </div>
  );
}
