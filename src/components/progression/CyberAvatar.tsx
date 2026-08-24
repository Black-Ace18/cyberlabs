import React, { useState } from 'react';
import { PillPath } from '../../types/cyberlab';
import { Sparkles, Terminal, Shield, Zap, Crosshair, Radio, ShieldCheck } from 'lucide-react';
import { sound } from '../../utils/audio';

interface CyberAvatarProps {
  currentPath: PillPath;
  completedCount: number;
}

export const CyberAvatar: React.FC<CyberAvatarProps> = ({ currentPath, completedCount }) => {
  const isRed = currentPath === 'RED';
  const [isHovered, setIsHovered] = useState(false);
  const [isRecoiling, setIsRecoiling] = useState(false);

  const handleAvatarClick = () => {
    if (isRed) {
      sound.playAlert();
    } else {
      sound.playShield();
    }
    setIsRecoiling(true);
    setTimeout(() => setIsRecoiling(false), 500);
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-center select-none group cursor-pointer border-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 shadow-none bg-transparent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleAvatarClick}
      role="button"
      tabIndex={0}
      aria-label={isRed ? 'Offensive Cyber Operative' : 'SOC Cyber Sentinel'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAvatarClick();
        }
      }}
    >
      {/* 3D Vector Character Container with Recoil Wiggle & Breathing Motion */}
      <div className={`relative w-40 h-44 sm:w-48 sm:h-52 flex items-center justify-center transition-transform duration-300 ${
        isRecoiling ? 'animate-avatar-recoil' : isHovered ? 'scale-105' : 'scale-100'
      }`}>
        
        {/* Background Radar & Holographic Energy Halo */}
        <div className={`absolute inset-0 rounded-full blur-xl opacity-40 transition-all pointer-events-none ${
          isRed ? 'bg-red-600/30' : 'bg-cyan-500/30'
        }`} />

        {/* Ambient Holographic Target Rings */}
        <div className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-dashed animate-spin [animation-duration:20s] pointer-events-none ${
          isRed ? 'border-red-500/20' : 'border-cyan-500/20'
        }`} />
        <div className={`absolute w-28 h-28 sm:w-34 sm:h-34 rounded-full border pointer-events-none ${
          isRed ? 'border-red-500/30' : 'border-cyan-500/30'
        }`} />

        {/* RED PILL: Rogue Offensive Operative (Viper) */}
        {isRed && (
          <div className="relative w-full h-full flex items-center justify-center animate-float-gentle">
            <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-[0_0_20px_rgba(255,0,85,0.5)]">
              <defs>
                {/* Crimson Neon Gradients */}
                <linearGradient id="redArmorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a0008" />
                  <stop offset="50%" stopColor="#0d0205" />
                  <stop offset="100%" stopColor="#2b0010" />
                </linearGradient>
                <linearGradient id="redVisorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF0055" />
                  <stop offset="50%" stopColor="#FF5588" />
                  <stop offset="100%" stopColor="#FF0055" />
                </linearGradient>
                <filter id="crimsonGlow">
                  <feGaussianBlur stdDeviation="3" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Back Stealth Cloak / Hood Silhouette */}
              <path 
                d="M 50 200 L 40 120 Q 50 50 100 40 Q 150 50 160 120 L 150 200 Z" 
                fill="url(#redArmorGrad)" 
                stroke="#FF0055" 
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />

              {/* Cyber Shoulder Pauldrons */}
              <path d="M 45 130 L 25 155 L 45 175 L 60 145 Z" fill="#120207" stroke="#FF0055" strokeWidth="2" />
              <path d="M 155 130 L 175 155 L 155 175 L 140 145 Z" fill="#120207" stroke="#FF0055" strokeWidth="2" />

              {/* Stealth Hood Outline */}
              <path 
                d="M 60 110 Q 55 45 100 35 Q 145 45 140 110 Q 100 135 60 110 Z" 
                fill="#0a0104" 
                stroke="#FF0055" 
                strokeWidth="2.5" 
              />

              {/* Shadowed Face Recess */}
              <path 
                d="M 72 90 Q 100 115 128 90 Q 120 60 100 55 Q 80 60 72 90 Z" 
                fill="#000000" 
              />

              {/* Glowing Crimson Cyber Visor */}
              <rect 
                x="76" 
                y="74" 
                width="48" 
                height="10" 
                rx="5" 
                fill="url(#redVisorGrad)" 
                filter="url(#crimsonGlow)"
              />
              
              {/* Visor Glint / Scanning Beam */}
              <line 
                x1="82" 
                y1="79" 
                x2="118" 
                y2="79" 
                stroke="#ffffff" 
                strokeWidth="2" 
                strokeLinecap="round"
                className="animate-visor-scan"
              />

              {/* Tactical Mask & Respirator Filters */}
              <polygon points="90,95 110,95 105,115 95,115" fill="#1f020c" stroke="#FF0055" strokeWidth="1.5" />
              <circle cx="88" cy="104" r="3" fill="#FF0055" opacity="0.8" />
              <circle cx="112" cy="104" r="3" fill="#FF0055" opacity="0.8" />

              {/* Tactical Carbon Armor Plates on Chest */}
              <polygon points="70,140 100,150 130,140 120,185 80,185" fill="#16030a" stroke="#FF0055" strokeWidth="1.5" />
              
              {/* Chest Core Node (Reactor) */}
              <circle cx="100" cy="165" r="7" fill="#000000" stroke="#FF0055" strokeWidth="2" />
              <circle cx="100" cy="165" r="3" fill="#FF0055" className="animate-ping" />

              {/* Left Wrist Holographic Exploit Console */}
              <g className="animate-pulse">
                <rect x="20" y="100" width="30" height="20" rx="3" fill="#000000" stroke="#FF0055" strokeWidth="1" opacity="0.9" />
                <line x1="24" y1="106" x2="44" y2="106" stroke="#FF0055" strokeWidth="1" />
                <line x1="24" y1="110" x2="38" y2="110" stroke="#FF0055" strokeWidth="1" />
                <line x1="24" y1="114" x2="42" y2="114" stroke="#FF0055" strokeWidth="1" />
              </g>

              {/* Circuit Lines on Shoulders */}
              <path d="M 60 145 L 80 155" stroke="#FF0055" strokeWidth="1.5" strokeDasharray="2,2" />
              <path d="M 140 145 L 120 155" stroke="#FF0055" strokeWidth="1.5" strokeDasharray="2,2" />
            </svg>
          </div>
        )}

        {/* BLUE PILL: Elite SOC Cyber-Sentinel (Aegis) */}
        {!isRed && (
          <div className="relative w-full h-full flex items-center justify-center animate-float-gentle">
            <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,212,255,0.5)]">
              <defs>
                {/* Electric Cyan Gradients */}
                <linearGradient id="blueArmorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00182b" />
                  <stop offset="50%" stopColor="#020e1a" />
                  <stop offset="100%" stopColor="#002d4f" />
                </linearGradient>
                <linearGradient id="blueVisorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0077FE" />
                  <stop offset="50%" stopColor="#00D4FF" />
                  <stop offset="100%" stopColor="#0077FE" />
                </linearGradient>
                <filter id="cyanGlow">
                  <feGaussianBlur stdDeviation="3" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Rotating Hexagonal Forcefield Shield Orbiting Sentinel */}
              <g className="animate-shield-spin origin-[100px_110px]">
                <polygon 
                  points="100,20 170,60 170,160 100,200 30,160 30,60" 
                  fill="none" 
                  stroke="#00D4FF" 
                  strokeWidth="1.5" 
                  strokeDasharray="8,6" 
                  opacity="0.6"
                />
                <circle cx="100" cy="20" r="3" fill="#00D4FF" />
                <circle cx="170" cy="60" r="3" fill="#00D4FF" />
                <circle cx="170" cy="160" r="3" fill="#00D4FF" />
                <circle cx="100" cy="200" r="3" fill="#00D4FF" />
                <circle cx="30" cy="160" r="3" fill="#00D4FF" />
                <circle cx="30" cy="60" r="3" fill="#00D4FF" />
              </g>

              {/* Heavy Sentinel Exo-Torso Silhouette */}
              <path 
                d="M 50 200 L 35 125 L 55 90 L 100 70 L 145 90 L 165 125 L 150 200 Z" 
                fill="url(#blueArmorGrad)" 
                stroke="#00D4FF" 
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />

              {/* Tactical Heavy Shoulder Armor Plates */}
              <polygon points="35,110 15,135 35,160 55,130" fill="#021424" stroke="#00D4FF" strokeWidth="2" />
              <polygon points="165,110 185,135 165,160 145,130" fill="#021424" stroke="#00D4FF" strokeWidth="2" />

              {/* Sentinel Helm / Tactical Face Guard */}
              <polygon 
                points="70,95 100,60 130,95 120,125 100,135 80,125" 
                fill="#03101c" 
                stroke="#00D4FF" 
                strokeWidth="2.5" 
              />

              {/* Dual Cyber Optic Scanning Lenses */}
              <rect 
                x="76" 
                y="85" 
                width="48" 
                height="8" 
                rx="4" 
                fill="url(#blueVisorGrad)" 
                filter="url(#cyanGlow)"
              />
              <circle cx="88" cy="89" r="2.5" fill="#ffffff" />
              <circle cx="112" cy="89" r="2.5" fill="#ffffff" />

              {/* Defensive Firewall Core on Chest Plate */}
              <polygon points="80,140 100,128 120,140 115,180 85,180" fill="#041a2e" stroke="#00D4FF" strokeWidth="1.5" />
              <circle cx="100" cy="155" r="8" fill="#000000" stroke="#00D4FF" strokeWidth="2" />
              <circle cx="100" cy="155" r="4" fill="#00D4FF" className="animate-ping" />

              {/* Right Radar Emitter Node */}
              <path d="M 155 95 Q 170 85 175 70" fill="none" stroke="#00D4FF" strokeWidth="1.5" strokeDasharray="3,2" />
              <circle cx="175" cy="70" r="3" fill="#00D4FF" />
            </svg>
          </div>
        )}
      </div>

      {/* Operative Info Badge */}
      <div className="mt-2 text-center font-mono">
        <div className="flex items-center justify-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isRed ? 'bg-[#FF0055] animate-pulse' : 'bg-[#00D4FF] animate-pulse'}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${isRed ? 'text-[#FF0055]' : 'text-[#00D4FF]'}`}>
            {isRed ? 'VIPER // OFFENSIVE OPERATIVE' : 'AEGIS // SOC SENTINEL'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 block mt-0.5">
          {isRed ? 'Zero-Day Exploit Specialist' : 'Threat Intelligence & Forensics'}
        </span>
      </div>
    </div>
  );
};
