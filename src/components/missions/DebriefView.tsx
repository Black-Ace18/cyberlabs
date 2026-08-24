import React, { useEffect } from 'react';
import { MissionData } from '../../types/cyberlab';
import { 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  LayoutGrid, 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  Globe 
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface DebriefViewProps {
  mission: MissionData;
  nextMission: MissionData | null;
  onNextMission: () => void;
  onReplayMission: () => void;
  onReturnToMap: () => void;
}

export const DebriefView: React.FC<DebriefViewProps> = ({
  mission,
  nextMission,
  onNextMission,
  onReplayMission,
  onReturnToMap
}) => {
  const isRed = mission.path === 'RED';

  useEffect(() => {
    sound.playSuccess();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-left space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl border text-center relative overflow-hidden backdrop-blur-md ${
        isRed
          ? 'bg-black/85 border-red-500/50 shadow-[0_0_35px_rgba(255,0,85,0.25)]'
          : 'bg-black/85 border-cyan-500/50 shadow-[0_0_35px_rgba(0,212,255,0.25)]'
      }`}>
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-green-950/60 text-[#00FF66] border border-green-500/50 mb-3 animate-bounce shadow-[0_0_15px_rgba(0,255,102,0.3)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold text-[#00FF66] uppercase tracking-widest block">
          LEVEL 0{mission.level} MISSION COMPLETED // ACCESS GRANTED
        </span>
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase mt-1 tracking-wide">
          {mission.title}
        </h2>
        <span className="text-xs font-mono text-slate-400 mt-1 block">
          Concept Mastered: <strong className="text-white">{mission.conceptName}</strong>
        </span>
      </div>

      {/* Educational Deep-Dive: Why it Worked */}
      <div className="p-5 sm:p-6 rounded-xl border border-green-500/30 bg-black/70 backdrop-blur-md space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#00FF66] mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Why Your Exploitation / Defense Succeeded</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
            {mission.debrief.whyItWorked}
          </p>
        </div>

        {/* Technical Concept Summary */}
        <div className="p-4 rounded-lg bg-black/80 border border-green-500/20">
          <span className="text-[11px] font-mono font-bold uppercase text-green-400 block mb-1">
            Technical Principle:
          </span>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {mission.debrief.conceptSummary}
          </p>
        </div>

        {/* Real-World Relevance */}
        <div className="p-4 rounded-lg bg-black/90 border border-green-500/20">
          <div className="flex items-center gap-2 mb-1 text-amber-400 font-mono text-xs font-bold uppercase">
            <Globe className="w-4 h-4" />
            <span>Real-World Security Context:</span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {mission.debrief.realWorldRelevance}
          </p>
        </div>

        {/* Key Takeaway Banner */}
        <div className="p-3.5 rounded-lg bg-green-950/40 border border-green-500/50 text-[#00FF66] font-mono text-xs shadow-[0_0_15px_rgba(0,255,102,0.1)]">
          <span className="font-bold uppercase block mb-0.5">Key Takeaway:</span>
          <span>{mission.debrief.keyTakeaway}</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-green-500/20">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              sound.playClick();
              onReturnToMap();
            }}
            className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-lg border border-green-500/30 bg-black/80 text-slate-200 hover:text-white hover:border-green-500/60 font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Level Pipeline</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onReplayMission();
            }}
            className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-lg border border-green-500/30 bg-black/80 text-slate-200 hover:text-white hover:border-green-500/60 font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay</span>
          </button>
        </div>

        {/* Direct Next Mission Transition Button */}
        {nextMission ? (
          <button
            onClick={() => {
              sound.playLevelUp();
              onNextMission();
            }}
            className={`w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-lg font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 ${
              isRed
                ? 'bg-[#FF0055] hover:bg-[#e6004c] text-white shadow-[0_0_20px_rgba(255,0,85,0.5)] focus-visible:ring-red-500'
                : 'bg-[#00D4FF] hover:bg-[#00bfe6] text-black shadow-[0_0_20px_rgba(0,212,255,0.5)] focus-visible:ring-cyan-500'
            }`}
          >
            <span>Next: Level 0{nextMission.level} — {nextMission.title}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              sound.playLevelUp();
              onReturnToMap();
            }}
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-lg bg-[#00FF66] hover:bg-green-400 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,255,102,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <Award className="w-4 h-4" />
            <span>Track Mastered! Return to Pipeline</span>
          </button>
        )}
      </div>
    </div>
  );
};
