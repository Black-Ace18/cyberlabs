import React from 'react';
import { PillPath, PlayerProgress } from '../../types/cyberlab';
import { Zap, ShieldCheck, Settings, Terminal } from 'lucide-react';
import { sound } from '../../utils/audio';

interface TopNavigationProps {
  currentPath: PillPath;
  onSelectPath: (path: PillPath) => void;
  playerProgress: PlayerProgress;
  onExitToSplash: () => void;
  isInsideMission?: boolean;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentPath,
  onSelectPath,
  playerProgress,
  onExitToSplash,
  isInsideMission = false
}) => {
  const isRed = currentPath === 'RED';
  const isSuperuser = playerProgress.isSuperuserActive ?? false;

  return (
    <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-all duration-300 ${
      isRed 
        ? 'bg-black/90 border-red-500/30 shadow-[0_4px_25px_rgba(255,0,85,0.15)]' 
        : 'bg-black/90 border-cyan-500/30 shadow-[0_4px_25px_rgba(0,212,255,0.15)]'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Zone (Single Text Element & Interactive Logo that routes directly to Splash/Auth) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onExitToSplash();
            }}
            className={`flex items-center gap-2 text-left group focus-visible:outline-none focus-visible:ring-2 rounded-lg p-1 transition-all ${
              isRed ? 'focus-visible:ring-red-500' : 'focus-visible:ring-cyan-500'
            }`}
            title="Return to Main Splash & Auth Screen"
            aria-label="Return to Splash Screen"
          >
            <div className={`p-2 rounded-lg bg-black border transition-all ${
              isRed
                ? 'border-red-500/50 text-[#FF0055] shadow-[0_0_12px_rgba(255,0,85,0.3)] group-hover:border-red-400 group-hover:shadow-[0_0_18px_rgba(255,0,85,0.5)]'
                : 'border-cyan-500/50 text-[#00D4FF] shadow-[0_0_12px_rgba(0,212,255,0.3)] group-hover:border-cyan-400 group-hover:shadow-[0_0_18px_rgba(0,212,255,0.5)]'
            }`}>
              <Terminal className="w-4 h-4" />
            </div>
            <div className="whitespace-nowrap">
              <span className={`font-heading font-black text-xs sm:text-sm tracking-wider uppercase text-white transition-colors block ${
                isRed ? 'group-hover:text-[#FF0055]' : 'group-hover:text-[#00D4FF]'
              }`}>
                CYBER LABS
              </span>
              <span className={`text-[9px] sm:text-[10px] font-mono block -mt-0.5 tracking-wider ${
                isRed ? 'text-red-400/80' : 'text-cyan-400/80'
              }`}>
                BY UMER KHAN
              </span>
            </div>
          </button>
        </div>

        {/* Center Zone: Superuser HUD Status Badge */}
        {isSuperuser && (
          <div className="hidden md:flex items-center justify-center">
            <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/40 text-amber-400 font-mono text-xs px-2.5 py-1 rounded-md shadow-[0_0_12px_rgba(245,158,11,0.2)] animate-pulse select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] shrink-0" />
              <span className="font-bold tracking-wider whitespace-nowrap">⚡ ROOT OVERRIDE</span>
            </div>
          </div>
        )}

        {/* Right Zone: Clean RED PILL / BLUE PILL Switchers neatly aligned on right */}
        {!isInsideMission ? (
          <div className="flex items-center p-1 rounded-xl bg-black/90 border border-slate-800 shadow-inner shrink-0">
            {/* RED PILL Tab */}
            <button
              onClick={() => {
                if (currentPath !== 'RED') {
                  sound.playAlert();
                  onSelectPath('RED');
                }
              }}
              className={`min-h-[38px] px-3 sm:px-5 py-1 rounded-lg font-mono text-xs font-bold uppercase transition-all duration-200 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                currentPath === 'RED'
                  ? 'bg-red-950/90 border border-[#FF0055] text-white shadow-[0_0_20px_rgba(255,0,85,0.4)]'
                  : 'text-slate-400 hover:text-[#FF0055] hover:bg-red-950/30'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${currentPath === 'RED' ? 'text-[#FF0055] fill-current' : 'text-slate-500'}`} />
              <span className="font-heading tracking-wider">RED PILL</span>
            </button>

            {/* BLUE PILL Tab */}
            <button
              onClick={() => {
                if (currentPath !== 'BLUE') {
                  sound.playShield();
                  onSelectPath('BLUE');
                }
              }}
              className={`min-h-[38px] px-3 sm:px-5 py-1 rounded-lg font-mono text-xs font-bold uppercase transition-all duration-200 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                currentPath === 'BLUE'
                  ? 'bg-cyan-950/90 border border-[#00D4FF] text-white shadow-[0_0_20px_rgba(0,212,255,0.4)]'
                  : 'text-slate-400 hover:text-[#00D4FF] hover:bg-cyan-950/30'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${currentPath === 'BLUE' ? 'text-[#00D4FF]' : 'text-slate-500'}`} />
              <span className="font-heading tracking-wider">BLUE PILL</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
            <span className={`px-3 py-1 rounded-lg border font-bold uppercase whitespace-nowrap ${
              isRed
                ? 'bg-red-950/90 border-[#FF0055]/70 text-[#FF0055] shadow-[0_0_15px_rgba(255,0,85,0.3)]'
                : 'bg-cyan-950/90 border-[#00D4FF]/70 text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.3)]'
            }`}>
              {isRed ? 'RED PILL // OFFENSIVE' : 'BLUE PILL // DEFENSIVE'}
            </span>
          </div>
        )}
      </div>

      {/* Mobile Superuser Sub-Banner (< 768px) */}
      {isSuperuser && (
        <div className="md:hidden w-full bg-amber-950/70 border-t border-amber-500/30 px-3 py-1 flex items-center justify-center gap-2 text-center backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] sm:text-[11px] font-bold tracking-wider animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] shrink-0" />
            <span>⚡ ROOT OVERRIDE ACTIVE</span>
          </div>
        </div>
      )}
    </header>
  );
};
