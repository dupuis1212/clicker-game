import { useEffect, useRef, useState } from 'react';
import { useGameSelector, useActions } from '../hooks/useGameState';

export function GoldenDropOverlay() {
  const next = useGameSelector((s) => s.nextGoldenDropAt);
  const level = useGameSelector((s) => s.level);
  const actions = useActions();
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      if (!visible && now >= next && level >= 1) {
        setPos({
          x: 15 + Math.random() * 70,
          y: 15 + Math.random() * 60,
        });
        setVisible(true);
      }
      if (visible && now >= next + 20_000) {
        setVisible(false); // disappeared uncaught — scheduler will set next
      }
    }, 200);
    return () => clearInterval(t);
  }, [next, visible, level]);

  const onClick = () => {
    actions.clickGoldenDrop();
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <div
      ref={ref}
      className="golden-drop"
      style={{
        position: 'absolute',
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        zIndex: 100,
      }}
      onClick={onClick}
    >
      🌟
    </div>
  );
}
