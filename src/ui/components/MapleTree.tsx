import { useEffect, useRef, useState } from 'react';
import { useActions, useGameSelector } from '../hooks/useGameState';
import { format, ZERO } from '../../core/bignum';
import type { Season } from '../../core/types';
import { sfx, unlockAudio } from '../../engine/audio';
import { TREE_SKINS_BY_ID } from '../../data/skins';

interface Floater {
  id: number;
  x: number;
  y: number;
  value: string;
}

let floaterSeq = 0;

interface MapleTreeProps {
  season?: Season;
}

export function MapleTree({ season }: MapleTreeProps = {}) {
  const actions = useActions();
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [squishing, setSquishing] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [hitstop, setHitstop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const skinId = useGameSelector((s) => s.skins.tree);
  const ownsHighClick = useGameSelector((s) => Boolean(s.clickUpgrades['cu7']));
  const inFrenzy = useGameSelector((s) =>
    s.activeEvents.some((e) => e.type === 'goldenDrop' && (e.data as { kind?: string } | undefined)?.kind === 'frenzy'),
  );
  const autoActive = useGameSelector((s) => s.level >= 7);
  const skinDef = TREE_SKINS_BY_ID[skinId] ?? TREE_SKINS_BY_ID['default'];
  const seasonalEmoji = skinId === 'default' ? seasonTreeEmoji(season) : skinDef.emoji;

  const handleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : 0;
    const y = rect ? e.clientY - rect.top : 0;

    const { gained: rawGained, crit } = actions.click();
    const gained = rawGained.lt(0) ? ZERO : rawGained;

    unlockAudio();
    (crit ? sfx.crit : sfx.click)();

    const id = floaterSeq++;
    setFloaters((prev) => [...prev, { id, x, y, value: format(gained) }]);
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== id));
    }, 1100);

    setSquishing(true);
    setTimeout(() => setSquishing(false), crit ? 220 : 120);

    if (crit) {
      setShaking(true);
      setTimeout(() => setShaking(false), 220);
      setHitstop(true);
      setTimeout(() => setHitstop(false), 80);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`tree-area${shaking ? ' crit-shake' : ''}${hitstop ? ' hitstop' : ''}${ownsHighClick ? ' golden-aura' : ''}${inFrenzy ? ' frenzy-aura' : ''}`}
    >
      <div className={`tree-shadow${squishing ? ' squish' : ''}`} />
      <button
        className={`maple-tree${squishing ? ' squish' : ''}`}
        onClick={handleClick}
        aria-label="Cliquer l'érable"
      >
        <span className="tree-crown">{seasonalEmoji}</span>
        {!skinDef.hasOwnTrunk && <span className="tree-trunk" />}
      </button>
      {floaters.map((f) => (
        <div
          key={f.id}
          className="click-floater"
          style={{ left: f.x, top: f.y }}
        >
          +{f.value}
        </div>
      ))}
      {autoActive && <SapDrips />}
    </div>
  );
}

function seasonTreeEmoji(season?: Season): string {
  switch (season) {
    case 'printemps': return '🌸';
    case 'ete':       return '🌳';
    case 'automne':   return '🍁';
    case 'hiver':     return '🌲';
    default:          return '🍁';
  }
}

/**
 * Ambient sap drops that fall from the tree's foliage when auto-click is active.
 * Pure atmosphere — no numbers, no UI noise. The drip cadence reflects production.
 */
function SapDrips() {
  const [drips, setDrips] = useState<{ id: number; left: number; delay: number; dur: number }[]>(
    [],
  );
  useEffect(() => {
    let seq = 0;
    const spawn = () => {
      const id = seq++;
      const left = 35 + Math.random() * 30;
      const delay = 0;
      const dur = 1.4 + Math.random() * 0.6;
      setDrips((prev) => [...prev.slice(-12), { id, left, delay, dur }]);
      setTimeout(() => {
        setDrips((prev) => prev.filter((d) => d.id !== id));
      }, (delay + dur) * 1000 + 100);
    };
    const interval = setInterval(spawn, 350);
    spawn();
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="sap-drips" aria-hidden>
      {drips.map((d) => (
        <span
          key={d.id}
          className="sap-drip"
          style={{
            left: `${d.left}%`,
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
