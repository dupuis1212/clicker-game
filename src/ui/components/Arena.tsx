import { useEffect, useRef, useState } from 'react';
import { MapleTree } from './MapleTree';
import { BuildingScene } from './BuildingScene';
import { GoldenDropOverlay } from './GoldenDropOverlay';
import { CastorOverlay } from './CastorOverlay';
import { currentSeason } from '../../core/seasons';
import { useGameSelector } from '../hooks/useGameState';
import type { Season } from '../../core/types';

type Biome = 'ferme' | 'crepuscule' | 'nuit' | 'cosmos';

function biomeForLevel(level: number): Biome {
  if (level >= 18) return 'cosmos';
  if (level >= 12) return 'nuit';
  if (level >= 6) return 'crepuscule';
  return 'ferme';
}

export function Arena() {
  const [season, setSeason] = useState<Season>(() => currentSeason(Date.now()));
  const level = useGameSelector((s) => s.level);
  const biome = biomeForLevel(level);
  useEffect(() => {
    const t = setInterval(() => setSeason(currentSeason(Date.now())), 15_000);
    return () => clearInterval(t);
  }, []);

  const nightBiome = biome === 'nuit' || biome === 'cosmos';

  return (
    <section className={`arena season-${season} biome-${biome}`} data-biome={biome}>
      <div className="arena-sky">
        <div className="cloud cloud-1">{season === 'hiver' ? '🌨️' : '☁️'}</div>
        <div className="cloud cloud-2">{season === 'hiver' ? '🌨️' : '☁️'}</div>
        <div className="cloud cloud-3">{season === 'hiver' ? '🌨️' : '☁️'}</div>
        <div className="sun">{biome === 'nuit' || biome === 'cosmos' ? '🌙' : seasonSun(season)}</div>
        {nightBiome && <Starfield cosmic={biome === 'cosmos'} />}
        {season === 'hiver' && <SnowGround />}
        <SeasonalParticles season={season} />
        <MapleTree season={season} />
        <GoldenDropOverlay />
      </div>
      <BuildingScene />
      <CastorOverlay />
    </section>
  );
}

interface StarfieldProps {
  cosmic: boolean;
}

function Starfield({ cosmic }: StarfieldProps) {
  // Génère une grille fixe d'étoiles. Positions random figées au premier rendu
  // pour ne pas retriguer les animations à chaque re-render du parent.
  const starsRef = useRef<{ left: number; top: number; delay: number; size: number }[] | null>(
    null,
  );
  if (!starsRef.current) {
    const count = cosmic ? 38 : 24;
    starsRef.current = Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 65, // on garde les étoiles hors du sol
      delay: Math.random() * 4,
      size: 0.5 + Math.random() * 0.7,
    }));
  }
  return (
    <div className={`starfield${cosmic ? ' cosmic' : ''}`} aria-hidden>
      {starsRef.current.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: `${s.size}rem`,
            animationDelay: `${s.delay}s`,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

function seasonSun(s: Season): string {
  switch (s) {
    case 'printemps': return '🌤️';
    case 'ete':       return '☀️';
    case 'automne':   return '🌅';
    case 'hiver':     return '🌥️';
  }
}

function SnowGround() {
  return <div className="snow-ground" aria-hidden />;
}

interface SeasonalParticlesProps {
  season: Season;
}

interface ParticleDef {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  dur: number;
  drift: number;
  rot: number;
  size: number;
}

function SeasonalParticles({ season }: SeasonalParticlesProps) {
  const seqRef = useRef(0);
  const particles = useRef<ParticleDef[]>([]).current;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    particles.length = 0;
    setTick((t) => t + 1);
  }, [season, particles]);

  useEffect(() => {
    if (season === 'ete') return; // summer: no falling particles
    const config = (() => {
      switch (season) {
        case 'printemps':
          return { count: 8, emoji: ['🌸', '🌸', '🌼'], dur: [10, 16] as [number, number], size: [0.8, 1.2] as [number, number] };
        case 'automne':
          return { count: 8, emoji: ['🍁', '🍂', '🍁'], dur: [10, 18] as [number, number], size: [0.9, 1.4] as [number, number] };
        case 'hiver':
          return { count: 14, emoji: ['❄️', '❄', '✦'], dur: [12, 22] as [number, number], size: [0.7, 1.3] as [number, number] };
        default:
          return null;
      }
    })();
    if (!config) return;

    while (particles.length < config.count) {
      particles.push(createParticle(seqRef.current++, config));
    }
    setTick((t) => t + 1);

    const interval = setInterval(() => {
      const cutoff = Date.now();
      for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].delay * 1000 + particles[i].dur * 1000 < cutoff - particles[i].id * 0) {
          // expire after one cycle
        }
      }
      // Recycle: if a particle has lived past its duration, replace it.
      for (let i = 0; i < particles.length; i++) {
        if (Date.now() - particles[i].id > (particles[i].delay + particles[i].dur) * 1000) {
          particles[i] = createParticle(Date.now() + i, config);
        }
      }
      setTick((t) => t + 1);
    }, 1500);

    return () => clearInterval(interval);
  }, [season, particles]);

  if (season === 'ete') return null;

  return (
    <div className={`season-particles particles-${season}`} aria-hidden key={tick}>
      {particles.map((p) => (
        <span
          key={p.id}
          className="season-particle"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}rem`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            ['--drift' as string]: `${p.drift}px`,
            ['--rot' as string]: `${p.rot}deg`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

function createParticle(
  id: number,
  config: { emoji: string[]; dur: [number, number]; size: [number, number] },
): ParticleDef {
  return {
    id,
    emoji: config.emoji[Math.floor(Math.random() * config.emoji.length)],
    left: Math.random() * 100,
    delay: Math.random() * 6,
    dur: config.dur[0] + Math.random() * (config.dur[1] - config.dur[0]),
    drift: (Math.random() - 0.5) * 120,
    rot: Math.random() * 720 - 360,
    size: config.size[0] + Math.random() * (config.size[1] - config.size[0]),
  };
}
