import { useEffect, useState } from 'react';
import { isCouleeActive, couleeDaysLeft } from '../../core/coulee';

/**
 * Bandeau temps-réel affiché en mars/avril.
 * FOMO assumé : "la sève coule — et dans le jeu aussi".
 */
export function CouleeBanner() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!isCouleeActive()) return null;
  const days = couleeDaysLeft();

  return (
    <div className="coulee-banner" role="status" data-tick={tick}>
      <span className="coulee-icon">🍁</span>
      <div className="coulee-text">
        <strong>La coulée du printemps est commencée.</strong>
        <span>
          +50% production, gouttes dorées fréquentes — {days} jour{days > 1 ? 's' : ''} restant
          {days > 1 ? 's' : ''}.
        </span>
      </div>
    </div>
  );
}
