import React, { useState } from 'react';
import { MissionData } from '../../types/cyberlab';
import { 
  BookOpen, 
  Target, 
  Lightbulb, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Info,
  ChevronDown,
  ChevronUp,
  Terminal
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface BriefingViewProps {
  mission: MissionData;
  onStartMission: () => void;
  onExitToMap: () => void;
}

export const BriefingView: React.FC<BriefingViewProps> = ({
  mission,
  onStartMission,
  onExitToMap
}) => {
  const [showHint, setShowHint] = useState(false);
  const isRed = mission.path === 'RED';

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-left space-y-6 animate-in fade-in duration-200">
      {/* Top Header Badge */}
      <div className={`p-6 rounded-2xl border backdrop-blur-md ${
        isRed 
          ? 'bg-black/85 border-red-500/50 shadow-[0_0_30px_rgba(255,0,85,0.25)]' 
          : 'bg-black/85 border-cyan-500/50 shadow-[0_0_30px_rgba(0,212,255,0.25)]'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
            isRed 
              ? 'bg-red-950 border-red-500/50 text-[#FF0055]' 
              : 'bg-cyan-950 border-cyan-500/50 text-[#00D4FF]'
          }`}>
            LEVEL 0{mission.level} DOSSIER // {isRed ? 'RED PILL' : 'BLUE PILL'}
          </span>
          <span className="text-xs font-mono text-green-400">
            {mission.difficulty}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase tracking-wide">
          {mission.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 font-mono">
          {mission.subtitle}
        </p>
      </div>

      {/* Scenario & Context Card */}
      <div className="p-5 sm:p-6 rounded-xl border border-green-500/30 bg-black/70 backdrop-blur-md space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-green-400 mb-2">
            <BookOpen className="w-4 h-4 text-green-400" />
            <span>Mission Context & Technical Intel</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            {mission.briefing.overview}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-black/90 border border-green-500/20">
          <span className="text-[11px] font-mono font-bold uppercase text-amber-400 block mb-1">
            Operational Scenario:
          </span>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {mission.briefing.scenario}
          </p>
        </div>

        {/* Objective */}
        <div className={`p-4 rounded-lg border ${
          isRed ? 'bg-red-950/30 border-red-500/50' : 'bg-cyan-950/30 border-cyan-500/50'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <Target className={`w-4 h-4 ${isRed ? 'text-[#FF0055]' : 'text-[#00D4FF]'}`} />
            <span className={`text-xs font-mono font-bold uppercase ${isRed ? 'text-[#FF0055]' : 'text-[#00D4FF]'}`}>
              Primary Mission Objective:
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-sans font-medium">
            {mission.briefing.objectiveText}
          </p>
        </div>
      </div>

      {/* Prerequisite Knowledge */}
      <div className="p-5 rounded-xl border border-green-500/30 bg-black/70 backdrop-blur-md space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-green-400">
          <Layers className="w-4 h-4 text-green-400" />
          <span>Core Domain Protocols</span>
        </div>

        <ul className="space-y-2">
          {mission.briefing.keyPrerequisiteKnowledge.map((item, idx) => (
            <li key={idx} className="p-2.5 rounded-lg bg-black/80 border border-green-500/20 text-xs font-mono text-slate-300 flex items-start gap-2">
              <span className={isRed ? 'text-[#FF0055] font-bold' : 'text-[#00D4FF] font-bold'}>▶</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Optional Hint Accordion */}
      {mission.briefing.hint && (
        <div className="p-4 rounded-xl border border-green-500/30 bg-black/70 backdrop-blur-md">
          <button
            onClick={() => {
              sound.playClick();
              setShowHint(!showHint);
            }}
            className="w-full flex items-center justify-between text-left font-mono text-xs text-amber-400 font-bold uppercase min-h-[40px]"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span>Need an Operational Hint?</span>
            </div>
            {showHint ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showHint && (
            <p className="text-xs text-slate-300 font-sans mt-3 pt-3 border-t border-green-500/20 leading-relaxed">
              {mission.briefing.hint}
            </p>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-green-500/20">
        <button
          onClick={() => {
            sound.playClick();
            onExitToMap();
          }}
          className="min-h-[44px] px-5 py-2.5 rounded-lg border border-green-500/30 bg-black/80 text-slate-300 hover:text-white hover:border-green-500/60 font-mono text-xs font-bold uppercase transition-all"
        >
          Back to Level Pipeline
        </button>

        <button
          onClick={() => {
            if (isRed) sound.playAlert();
            else sound.playShield();
            onStartMission();
          }}
          className={`min-h-[44px] px-6 py-3 rounded-lg font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 ${
            isRed
              ? 'bg-[#FF0055] hover:bg-[#e6004c] text-white shadow-[0_0_20px_rgba(255,0,85,0.5)] focus-visible:ring-red-500'
              : 'bg-[#00D4FF] hover:bg-[#00bfe6] text-black shadow-[0_0_20px_rgba(0,212,255,0.5)] focus-visible:ring-cyan-500'
          }`}
        >
          <span>Engage Mission Lab</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
