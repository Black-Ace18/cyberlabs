import React, { useState, useEffect } from 'react';
import { PillPath, MissionData, PlayerProgress } from './types/cyberlab';
import { loadPlayerProgress, savePlayerProgress } from './utils/storage';
import { ALL_MISSIONS_DATA, RED_MISSIONS, BLUE_MISSIONS } from './data/missionsData';
import { SplashScreen } from './components/splash/SplashScreen';
import { TopNavigation } from './components/terminal/TopNavigation';
import { LevelMap } from './components/progression/LevelMap';
import { MissionRunner } from './components/missions/MissionRunner';
import { SettingsModal } from './components/settings/SettingsModal';
import { sound } from './utils/audio';

type AppScreen = 'SPLASH' | 'TERMINAL_MAP' | 'MISSION_RUNNER';

export default function App() {
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress>(() => loadPlayerProgress());
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('SPLASH');
  const [activePath, setActivePath] = useState<PillPath>('RED');
  const [activeMission, setActiveMission] = useState<MissionData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync active path with player progress if previously stored
  useEffect(() => {
    if (playerProgress.lastPlayedPath) {
      setActivePath(playerProgress.lastPlayedPath);
    }
  }, []);

  const handleEnterTerminal = (chosenPath?: PillPath, userName?: string) => {
    const updated = {
      ...playerProgress,
      ...(chosenPath ? { lastPlayedPath: chosenPath } : {}),
      ...(userName ? { userName: userName.trim() || 'Anonymous' } : {})
    };
    if (chosenPath) {
      setActivePath(chosenPath);
    }
    setPlayerProgress(updated);
    savePlayerProgress(updated);
    setCurrentScreen('TERMINAL_MAP');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPath = (path: PillPath) => {
    setActivePath(path);
    const updated = { ...playerProgress, lastPlayedPath: path };
    setPlayerProgress(updated);
    savePlayerProgress(updated);
  };

  const handleLaunchMission = (mission: MissionData) => {
    setActiveMission(mission);
    setCurrentScreen('MISSION_RUNNER');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitToMap = () => {
    setActiveMission(null);
    setCurrentScreen('TERMINAL_MAP');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitToSplash = () => {
    setActiveMission(null);
    setCurrentScreen('SPLASH');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchMission = (newMission: MissionData) => {
    setActiveMission(newMission);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 antialiased">
      {/* 1. Splash Screen View */}
      {currentScreen === 'SPLASH' && (
        <SplashScreen
          onEnterTerminal={handleEnterTerminal}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* 2. Main Terminal Top Bar (for Map and Mission views) */}
      {currentScreen !== 'SPLASH' && (
        <TopNavigation
          currentPath={activePath}
          onSelectPath={handleSelectPath}
          playerProgress={playerProgress}
          onExitToSplash={handleExitToSplash}
          isInsideMission={currentScreen === 'MISSION_RUNNER'}
        />
      )}

      {/* 3. Progression Level Map View */}
      {currentScreen === 'TERMINAL_MAP' && (
        <main className="flex-1">
          <LevelMap
            currentPath={activePath}
            playerProgress={playerProgress}
            onLaunchMission={handleLaunchMission}
          />
        </main>
      )}

      {/* 4. Interactive Mission Runner View */}
      {currentScreen === 'MISSION_RUNNER' && activeMission && (
        <main className="flex-1">
          <MissionRunner
            mission={activeMission}
            playerProgress={playerProgress}
            onUpdateProgress={(newProg) => setPlayerProgress(newProg)}
            onExitToMap={handleExitToMap}
            onSwitchMission={handleSwitchMission}
          />
        </main>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        playerProgress={playerProgress}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateProgress={(newProg) => setPlayerProgress(newProg)}
      />
    </div>
  );
}
