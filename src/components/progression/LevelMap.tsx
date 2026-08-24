import React, { useRef, useState, useEffect } from 'react';
import { PillPath, MissionData, PlayerProgress } from '../../types/cyberlab';
import { RED_MISSIONS, BLUE_MISSIONS } from '../../data/missionsData';
import { CyberAvatar } from './CyberAvatar';
import { 
  Zap, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Play, 
  ChevronLeft,
  ChevronRight,
  Crosshair,
  ArrowRight,
  Activity,
  Layers
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface LevelMapProps {
  currentPath: PillPath;
  playerProgress: PlayerProgress;
  onLaunchMission: (mission: MissionData) => void;
}

export const LevelMap: React.FC<LevelMapProps> = ({
  currentPath,
  playerProgress,
  onLaunchMission
}) => {
  const missions = currentPath === 'RED' ? RED_MISSIONS : BLUE_MISSIONS;
  const completedList = currentPath === 'RED' ? playerProgress.completedRedLevels : playerProgress.completedBlueLevels;
  const unlockedLevel = currentPath === 'RED' ? playerProgress.unlockedRedLevel : playerProgress.unlockedBlueLevel;

  const isRed = currentPath === 'RED';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeFocusedIndex, setActiveFocusedIndex] = useState(() => {
    const nextIdx = missions.findIndex(m => m.level === unlockedLevel);
    return nextIdx !== -1 ? nextIdx : 0;
  });

  // Drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Auto-scroll to active or selected mission node on path switch
  useEffect(() => {
    const currentIdx = missions.findIndex(m => m.level === unlockedLevel);
    const targetIdx = currentIdx !== -1 ? currentIdx : 0;
    setActiveFocusedIndex(targetIdx);
    scrollToNode(targetIdx);
  }, [currentPath, unlockedLevel]);

  const scrollToNode = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cards = container.querySelectorAll<HTMLElement>('[data-node-card]');
    if (cards[index]) {
      const card = cards[index];
      const scrollPosition = card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2;
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  };

  const handlePrevNode = () => {
    sound.playClick();
    const newIdx = Math.max(0, activeFocusedIndex - 1);
    setActiveFocusedIndex(newIdx);
    scrollToNode(newIdx);
  };

  const handleNextNode = () => {
    sound.playClick();
    const newIdx = Math.min(missions.length - 1, activeFocusedIndex + 1);
    setActiveFocusedIndex(newIdx);
    scrollToNode(newIdx);
  };

  // Keyboard navigation support (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevNode();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextNode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFocusedIndex]);

  // Drag-to-scroll mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const isSuperuser = playerProgress.isSuperuserActive ?? false;

  return (
    <div className={`w-full min-h-[calc(100vh-4rem)] py-6 sm:py-8 px-3 sm:px-6 lg:px-8 text-left space-y-8 animate-in fade-in duration-300 relative ${
      isRed ? 'cyber-grid-red' : 'cyber-grid-blue'
    }`}>
      {/* 1. Tactical Header with Dynamic 3D Character Avatar */}
      <div className="max-w-6xl mx-auto">
        <div className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-md transition-all duration-300 relative overflow-hidden ${
          isRed 
            ? 'bg-black/85 border-red-500/40 shadow-[0_0_35px_rgba(255,0,85,0.2)]' 
            : 'bg-black/85 border-cyan-500/40 shadow-[0_0_35px_rgba(0,212,255,0.2)]'
        }`}>
          {/* Subtle Corner Accents */}
          <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${isRed ? 'border-[#FF0055]' : 'border-[#00D4FF]'}`} />
          <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${isRed ? 'border-[#FF0055]' : 'border-[#00D4FF]'}`} />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left Info & Progress */}
            <div className="w-full flex-1 space-y-4 text-left">
              <div className="flex flex-wrap items-center gap-3">
                <div className={`p-3 rounded-xl border shrink-0 ${
                  isRed 
                    ? 'bg-red-950/70 border-red-500/50 text-[#FF0055] shadow-[0_0_15px_rgba(255,0,85,0.35)]' 
                    : 'bg-cyan-950/70 border-cyan-500/50 text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.35)]'
                }`}>
                  {isRed ? <Zap className="w-6 h-6 fill-current" /> : <ShieldCheck className="w-6 h-6" />}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider sm:tracking-widest px-2.5 py-0.5 rounded border whitespace-nowrap ${
                      isRed 
                        ? 'bg-red-950/80 border-[#FF0055]/50 text-[#FF0055]' 
                        : 'bg-cyan-950/80 border-[#00D4FF]/50 text-[#00D4FF]'
                    }`}>
                      {isRed ? 'RED PILL // OFFENSIVE TRACK' : 'BLUE PILL // DEFENSIVE TRACK'}
                    </span>
                    {isSuperuser && (
                      <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)] whitespace-nowrap flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>ROOT OVERRIDE</span>
                      </span>
                    )}
                    <span className="text-[11px] sm:text-xs font-mono text-slate-300 whitespace-nowrap">
                      <strong className={isRed ? 'text-[#FF0055]' : 'text-[#00D4FF]'}>{completedList.length}</strong> / 5 COMPLETED
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-heading font-black text-white uppercase mt-1 tracking-wide">
                    {isRed ? 'Offensive Cyber Operations' : 'Cybersecurity Analyst Operations'}
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-xl">
                {isRed
                  ? 'Execute real offensive exploit chains: Master Linux terminal reconnaissance, file permission escalation, network port discovery, SQL injection, and multi-vector lateral intrusion.'
                  : 'Execute real defensive forensics & SOC incident response: Dissect live process tables, investigate SIEM logs, analyze raw packet streams, and isolate active adversary infrastructure.'}
              </p>

              {/* Progress Bar & Telemetry */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-xs">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-slate-400 font-bold text-[10px] sm:text-xs whitespace-nowrap">PIPELINE READINESS:</span>
                  <div className="flex-1 sm:w-56 bg-black h-3 rounded-full overflow-hidden border border-slate-700 p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isRed 
                          ? 'bg-[#FF0055] shadow-[0_0_12px_#FF0055]' 
                          : 'bg-[#00D4FF] shadow-[0_0_12px_#00D4FF]'
                      }`}
                      style={{ width: `${(completedList.length / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`font-bold text-[11px] sm:text-xs ${isRed ? 'text-[#FF0055]' : 'text-[#00D4FF]'}`}>
                    {Math.round((completedList.length / 5) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Dynamic 3D Character Avatar (Centered on mobile below text, right-aligned on desktop) */}
            <div className="w-full lg:w-auto flex items-center justify-center pt-2 lg:pt-0 shrink-0">
              <CyberAvatar currentPath={currentPath} completedCount={completedList.length} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Horizontal Mission Chain (Node Pipeline) */}
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Pipeline Controls & Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 font-mono text-xs">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-white">
            <Crosshair className={`w-4 h-4 ${isRed ? 'text-[#FF0055]' : 'text-[#00D4FF]'}`} />
            <span>Horizontal Mission Chain (Node Pipeline)</span>
            <span className="text-slate-500 hidden sm:inline">• Use ← / → keys or swipe</span>
          </div>

          {/* Prev / Next Node Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevNode}
              disabled={activeFocusedIndex === 0}
              className={`min-h-[38px] px-3 py-1.5 rounded-lg border flex items-center gap-1 font-mono text-xs font-bold uppercase transition-all ${
                activeFocusedIndex === 0
                  ? 'bg-black/40 border-slate-800 text-slate-600 cursor-not-allowed'
                  : isRed
                    ? 'bg-black/80 border-red-500/40 text-red-300 hover:border-[#FF0055] hover:text-white hover:shadow-[0_0_15px_rgba(255,0,85,0.3)]'
                    : 'bg-black/80 border-cyan-500/40 text-cyan-300 hover:border-[#00D4FF] hover:text-white hover:shadow-[0_0_15px_rgba(0,212,255,0.3)]'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev Node</span>
            </button>

            <div className="flex items-center gap-1.5 px-2 font-mono text-xs text-slate-400">
              {missions.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveFocusedIndex(idx);
                    scrollToNode(idx);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    activeFocusedIndex === idx
                      ? isRed 
                        ? 'bg-[#FF0055] scale-125 shadow-[0_0_8px_#FF0055]' 
                        : 'bg-[#00D4FF] scale-125 shadow-[0_0_8px_#00D4FF]'
                      : completedList.includes(m.id)
                        ? 'bg-green-400 opacity-80'
                        : 'bg-slate-700 opacity-40'
                  }`}
                  title={`Level 0${m.level}: ${m.title}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNextNode}
              disabled={activeFocusedIndex === missions.length - 1}
              className={`min-h-[38px] px-3 py-1.5 rounded-lg border flex items-center gap-1 font-mono text-xs font-bold uppercase transition-all ${
                activeFocusedIndex === missions.length - 1
                  ? 'bg-black/40 border-slate-800 text-slate-600 cursor-not-allowed'
                  : isRed
                    ? 'bg-black/80 border-red-500/40 text-red-300 hover:border-[#FF0055] hover:text-white hover:shadow-[0_0_15px_rgba(255,0,85,0.3)]'
                    : 'bg-black/80 border-cyan-500/40 text-cyan-300 hover:border-[#00D4FF] hover:text-white hover:shadow-[0_0_15px_rgba(0,212,255,0.3)]'
              }`}
            >
              <span>Next Node</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Horizontal Node Chain Container without scrollbars */}
        <div 
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex items-stretch gap-6 overflow-x-auto pb-6 pt-2 px-4 scroll-smooth select-none cursor-grab active:cursor-grabbing no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {missions.map((mission, index) => {
            const isCompleted = completedList.includes(mission.id);
            const isUnlocked = isSuperuser || mission.level <= unlockedLevel;
            const isCurrent = mission.level === unlockedLevel && !isCompleted;
            const isFutureLocked = !isUnlocked;
            const isFocused = activeFocusedIndex === index;

            return (
              <div 
                key={mission.id} 
                data-node-card
                onClick={() => setActiveFocusedIndex(index)}
                className="flex items-center shrink-0 transition-transform duration-300"
              >
                {/* Mission Node Card with smooth scale-up & glow */}
                <div
                  className={`w-[300px] sm:w-[340px] min-h-[380px] sm:min-h-[400px] p-4 sm:p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 flex flex-col justify-between relative group hover:scale-[1.02] ${
                    isCurrent || isFocused
                      ? isRed
                        ? 'bg-black/90 border-[#FF0055] shadow-[0_0_30px_rgba(255,0,85,0.35)] scale-[1.02]'
                        : 'bg-black/90 border-[#00D4FF] shadow-[0_0_30px_rgba(0,212,255,0.35)] scale-[1.02]'
                      : isCompleted
                        ? 'bg-black/75 border-green-500/40 text-slate-200 hover:border-green-400 hover:shadow-[0_0_20px_rgba(0,255,102,0.2)]'
                        : 'bg-black/50 border-slate-800 opacity-60 text-slate-500'
                  }`}
                >
                  {/* Top Node Header: Level Badge & Difficulty */}
                  <div className="flex items-center justify-between gap-2 border-b pb-3 mb-3 border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border font-mono font-bold text-xs sm:text-sm shrink-0 flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-green-950/80 border-green-500/60 text-[#00FF66] shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                          : isCurrent
                            ? isRed
                              ? 'bg-red-950/90 border-[#FF0055] text-[#FF0055] animate-pulse shadow-[0_0_15px_rgba(255,0,85,0.5)]'
                              : 'bg-cyan-950/90 border-[#00D4FF] text-[#00D4FF] animate-pulse shadow-[0_0_15px_rgba(0,212,255,0.5)]'
                            : 'bg-black/60 border-slate-800 text-slate-500'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-[#00FF66]" />
                        ) : isFutureLocked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <span>0{mission.level}</span>
                        )}
                      </div>

                      <div>
                        <span className={`text-[10px] font-mono font-bold tracking-wider uppercase block ${
                          isRed ? 'text-red-400' : 'text-cyan-400'
                        }`}>
                          NODE // 0{mission.level}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-semibold">
                          {mission.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border shrink-0 transition-colors ${
                      mission.difficulty === 'BEGINNER'
                        ? 'bg-green-950/60 text-green-400 border-green-500/30'
                        : mission.difficulty === 'EASY'
                          ? 'bg-cyan-950/60 text-cyan-400 border-cyan-500/30'
                          : mission.difficulty === 'INTERMEDIATE'
                            ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                            : 'bg-red-950/60 text-red-400 border-red-500/30'
                    }`}>
                      {mission.difficulty}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm sm:text-base font-heading font-bold text-white uppercase tracking-wide group-hover:text-slate-100 transition-colors">
                        {mission.title}
                      </h3>

                      <p className="text-xs text-slate-300 mt-1 font-sans leading-relaxed line-clamp-2 sm:line-clamp-3">
                        {mission.shortObjective}
                      </p>

                      {mission.conceptTags && mission.conceptTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {mission.conceptTags.map((tag, tagIdx) => (
                            <span 
                              key={tagIdx}
                              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-slate-300"
                            >
                              [ {tag} ]
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-0.5">
                      <div className="text-[11px] font-mono p-2 sm:p-2.5 rounded-lg bg-black/60 border border-slate-800 flex items-start sm:items-center justify-between gap-2.5 transition-all group-hover:border-slate-700">
                        <span className="text-slate-500 shrink-0 font-medium">Domain:</span>
                        <span className={`font-bold text-right ml-1 sm:ml-0 ${isRed ? 'text-[#FF0055]' : 'text-[#00D4FF]'}`}>
                          {mission.conceptName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Node Action Button */}
                  <div className="mt-3.5 pt-2.5 border-t border-slate-800/80">
                    {isUnlocked ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isRed) sound.playAlert();
                          else sound.playShield();
                          onLaunchMission(mission);
                        }}
                        className={`w-full min-h-[44px] px-4 py-2.5 rounded-lg font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 active:scale-95 ${
                          isCurrent
                            ? isRed
                              ? 'bg-[#FF0055] hover:bg-[#e6004c] text-white shadow-[0_0_20px_rgba(255,0,85,0.5)] hover:shadow-[0_0_25px_rgba(255,0,85,0.7)] focus-visible:ring-red-500'
                              : 'bg-[#00D4FF] hover:bg-[#00bfe6] text-black shadow-[0_0_20px_rgba(0,212,255,0.5)] hover:shadow-[0_0_25px_rgba(0,212,255,0.7)] focus-visible:ring-cyan-500'
                            : 'bg-black/80 hover:bg-slate-900 text-slate-200 border border-green-500/30 hover:border-green-500/70 hover:shadow-[0_0_15px_rgba(0,255,102,0.2)] focus-visible:ring-green-500'
                        }`}
                      >
                        <span>{isCompleted ? 'Replay Mission' : 'Launch Lab'}</span>
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-slate-500 px-3 py-2.5 rounded-lg bg-black/60 border border-slate-800 min-h-[44px]">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked (Complete Level 0{mission.level - 1})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Glowing Data Bus Connector between horizontal nodes with subtle pulse */}
                {index < missions.length - 1 && (
                  <div className="relative flex items-center justify-center px-2 shrink-0">
                    <div className={`w-8 sm:w-12 h-1.5 rounded relative overflow-hidden transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500/60 shadow-[0_0_10px_rgba(0,255,102,0.4)]' 
                        : isRed 
                          ? 'bg-red-950/80 border border-red-500/40 shadow-[0_0_8px_rgba(255,0,85,0.25)]' 
                          : 'bg-cyan-950/80 border border-cyan-500/40 shadow-[0_0_8px_rgba(0,212,255,0.25)]'
                    }`}>
                      {/* Flowing Data Pulse */}
                      <div className={`absolute top-0 left-0 bottom-0 w-4 rounded animate-circuit-flow ${
                        isRed ? 'bg-[#FF0055] shadow-[0_0_10px_#FF0055]' : 'bg-[#00D4FF] shadow-[0_0_10px_#00D4FF]'
                      }`} />
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 -ml-1 animate-pulse ${
                      isCompleted ? 'text-green-400' : isRed ? 'text-red-500' : 'text-cyan-500'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
