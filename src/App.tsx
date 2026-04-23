import { useCallback, useState } from 'react';
import { TopBar } from './ui/components/TopBar';
import { Arena } from './ui/components/Arena';
import { Shop } from './ui/components/Shop';
import { UpgradePanel } from './ui/components/UpgradePanel';
import { BottomBar } from './ui/components/BottomBar';
import { AchievementsModal } from './ui/components/AchievementsModal';
import { PrestigeModal } from './ui/components/PrestigeModal';
import { GuideModal } from './ui/components/GuideModal';
import { StatsModal } from './ui/components/StatsModal';
import { OptionsModal } from './ui/components/OptionsModal';
import { SkinsModal } from './ui/components/SkinsModal';
import { LoreModal } from './ui/components/LoreModal';
import { DailyQuestsModal } from './ui/components/DailyQuestsModal';
import { LunarChoiceModal } from './ui/components/LunarChoiceModal';
import { CouleeBanner } from './ui/components/CouleeBanner';
import { Toasts } from './ui/components/Toasts';
import { OfflinePopup } from './ui/components/OfflinePopup';
import { LevelUpFanfare } from './ui/components/LevelUpFanfare';
import { BuffTimers } from './ui/components/BuffTimers';
import { useKeyboard } from './ui/hooks/useKeyboard';

export default function App() {
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPrestige, setShowPrestige] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showSkins, setShowSkins] = useState(false);
  const [showLore, setShowLore] = useState(false);
  const [showQuests, setShowQuests] = useState(false);

  const closeAll = useCallback(() => {
    setShowAchievements(false);
    setShowPrestige(false);
    setShowGuide(false);
    setShowStats(false);
    setShowOptions(false);
    setShowSkins(false);
    setShowLore(false);
    setShowQuests(false);
  }, []);

  useKeyboard({ onEscape: closeAll });

  return (
    <div className="app">
      <TopBar />
      <CouleeBanner />
      <UpgradePanel />
      <Arena />
      <Shop />
      <BottomBar
        onOpenAchievements={() => setShowAchievements(true)}
        onOpenPrestige={() => setShowPrestige(true)}
        onOpenGuide={() => setShowGuide(true)}
        onOpenStats={() => setShowStats(true)}
        onOpenOptions={() => setShowOptions(true)}
        onOpenSkins={() => setShowSkins(true)}
        onOpenLore={() => setShowLore(true)}
        onOpenQuests={() => setShowQuests(true)}
      />
      <BuffTimers />
      <Toasts />
      <OfflinePopup />
      <LevelUpFanfare />
      <LunarChoiceModal />
      {showAchievements && <AchievementsModal onClose={() => setShowAchievements(false)} />}
      {showPrestige && <PrestigeModal onClose={() => setShowPrestige(false)} />}
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
      {showOptions && <OptionsModal onClose={() => setShowOptions(false)} />}
      {showSkins && <SkinsModal onClose={() => setShowSkins(false)} />}
      {showLore && <LoreModal onClose={() => setShowLore(false)} />}
      {showQuests && <DailyQuestsModal onClose={() => setShowQuests(false)} />}
    </div>
  );
}
