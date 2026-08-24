import React, { useState } from 'react';
import { MissionData, PlayerProgress } from '../../types/cyberlab';
import { RED_MISSIONS, BLUE_MISSIONS } from '../../data/missionsData';
import { BriefingView } from './BriefingView';
import { DebriefView } from './DebriefView';
import { TerminalSandbox } from './interactive/TerminalSandbox';
import { PermissionsLab } from './interactive/PermissionsLab';
import { PacketInjectionLab } from './interactive/PacketInjectionLab';
import { ExploitSandbox } from './interactive/ExploitSandbox';
import { GlobalKillChainLab } from './interactive/GlobalKillChainLab';
import { ProcessWatchLab } from './interactive/ProcessWatchLab';
import { LogHuntLab } from './interactive/LogHuntLab';
import { TrafficInterceptionLab } from './interactive/TrafficInterceptionLab';
import { IncidentResponseLab } from './interactive/IncidentResponseLab';
import { IncidentCommandMatrixLab } from './interactive/IncidentCommandMatrixLab';
import { markMissionCompleted } from '../../utils/storage';
import { ArrowLeft, BookOpen, Shield, Terminal } from 'lucide-react';
import { sound } from '../../utils/audio';

interface MissionRunnerProps {
  mission: MissionData;
  playerProgress: PlayerProgress;
  onUpdateProgress: (newProgress: PlayerProgress) => void;
  onExitToMap: () => void;
  onSwitchMission: (newMission: MissionData) => void;
}

type MissionPhase = 'BRIEFING' | 'SANDBOX' | 'DEBRIEF';

export const MissionRunner: React.FC<MissionRunnerProps> = ({
  mission,
  playerProgress,
  onUpdateProgress,
  onExitToMap,
  onSwitchMission
}) => {
  const [phase, setPhase] = useState<MissionPhase>('BRIEFING');

  const missionList = mission.path === 'RED' ? RED_MISSIONS : BLUE_MISSIONS;
  const nextMission = mission.level < 5 ? missionList.find(m => m.level === mission.level + 1) || null : null;

  const isRed = mission.path === 'RED';

  const handleStartSandbox = () => {
    setPhase('SANDBOX');
  };

  const handleMissionSuccess = () => {
    const { newState } = markMissionCompleted(playerProgress, mission.id, mission.path, mission.level);
    onUpdateProgress(newState);
    setPhase('DEBRIEF');
  };

  const handleNextMission = () => {
    if (nextMission) {
      setPhase('BRIEFING');
      onSwitchMission(nextMission);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onExitToMap();
    }
  };

  const handleReplayMission = () => {
    setPhase('BRIEFING');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-16 pt-4 px-3 sm:px-6 max-w-7xl mx-auto text-left">
      {/* Top Mission HUD Sub-bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-green-500/20 bg-black/40 p-3 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onExitToMap();
            }}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-lg border border-green-500/30 bg-black/80 text-green-400 hover:text-white hover:border-green-500/70 hover:shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            title="Return to Level Pipeline"
            aria-label="Return to Level Pipeline"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                isRed 
                  ? 'bg-red-950/80 border-red-500/50 text-[#FF0055]' 
                  : 'bg-cyan-950/80 border-cyan-500/50 text-[#00D4FF]'
              }`}>
                LEVEL 0{mission.level}
              </span>
              <span className="text-xs font-mono text-green-400/80 uppercase font-semibold">
                {mission.type.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-heading font-bold text-white uppercase mt-0.5 tracking-wide">
              {mission.title}
            </h2>
          </div>
        </div>

        {/* Phase Indicator & Quick Navigation */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {phase === 'SANDBOX' && (
            <button
              onClick={() => {
                sound.playClick();
                setPhase('BRIEFING');
              }}
              className="min-h-[44px] px-3.5 py-2 rounded-lg bg-black/80 border border-green-500/30 text-green-300 hover:text-white hover:border-green-500/60 flex items-center gap-2 transition-all shadow-[0_0_10px_rgba(0,255,102,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <BookOpen className="w-3.5 h-3.5 text-green-400" />
              <span>Review Briefing</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Mission Body */}
      <div>
        {phase === 'BRIEFING' && (
          <BriefingView
            mission={mission}
            onStartMission={handleStartSandbox}
            onExitToMap={onExitToMap}
          />
        )}

        {phase === 'SANDBOX' && (
          <div>
            {mission.id === 'red-1' && (
              <TerminalSandbox mission={mission} onSuccess={handleMissionSuccess} />
            )}
            {mission.id === 'red-2' && (
              <PermissionsLab mission={mission} onSuccess={handleMissionSuccess} />
            )}
            {mission.id === 'red-3' && (
              <ExploitSandbox mission={mission} onSuccess={handleMissionSuccess} />
            )}
            {mission.id === 'red-4' && (
              <PacketInjectionLab mission={mission} onSuccess={handleMissionSuccess} />
            )}
            {mission.id === 'red-5' && (
              <GlobalKillChainLab mission={mission} onSuccess={handleMissionSuccess} />
            )}

            {mission.id === 'blue-1' && (
              <ProcessWatchLab mission={mission} onSuccess={handleMissionSuccess} />
            )}
            {mission.id === 'blue-2' && (
              <LogHuntLab mission={mission} onSuccess={handleMissionSuccess} />
            )}
            {mission.id === 'blue-3' && (
              <IncidentResponseLab mission={mission} onSuccess={handleMissionSuccess} />
            )}
            {mission.id === 'blue-4' && (
              <TrafficInterceptionLab mission={mission} onSuccess={handleMissionSuccess} />
            )}
            {mission.id === 'blue-5' && (
              <IncidentCommandMatrixLab mission={mission} onSuccess={handleMissionSuccess} />
            )}
          </div>
        )}

        {phase === 'DEBRIEF' && (
          <DebriefView
            mission={mission}
            nextMission={nextMission}
            onNextMission={handleNextMission}
            onReplayMission={handleReplayMission}
            onReturnToMap={onExitToMap}
          />
        )}
      </div>
    </div>
  );
};
