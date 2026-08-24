import React, { useState, useEffect, useRef } from 'react';
import { PillPath } from '../../types/cyberlab';
import { Terminal, Shield, Crosshair, ArrowRight, Sparkles, User, Key, CheckCircle2, ChevronRight, Settings } from 'lucide-react';
import { sound } from '../../utils/audio';

interface SplashScreenProps {
  onEnterTerminal: (chosenPath?: PillPath, userName?: string) => void;
  onOpenSettings?: () => void;
}

type SplashPhase = 'NAME_PROMPT' | 'INITIALIZATION' | 'MORPHEUS_CHOICE';

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onEnterTerminal,
  onOpenSettings
}) => {
  const [phase, setPhase] = useState<SplashPhase>('NAME_PROMPT');
  const [userName, setUserName] = useState('');
  const [typedName, setTypedName] = useState('');
  const [initLogs, setInitLogs] = useState<string[]>([]);
  const [isGlitching, setIsGlitching] = useState(false);
  const [hoveredPill, setHoveredPill] = useState<PillPath | null>(null);
  const [selectedPill, setSelectedPill] = useState<PillPath | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Matrix Digital Rain Canvas Background Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Matrix characters (Hex, Katakana-like symbols, Binary, Cryptographic chars)
    const chars = '0123456789ABCDEF010101XYZアイウエオカキクケコサシスセソタチツテトナニヌネハヒフヘホ';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));

    const render = () => {
      // Semi-transparent black to create trailing phosphor blur
      ctx.fillStyle = 'rgba(5, 5, 5, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00FF66';
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Leading character is brighter white-green
        if (Math.random() > 0.85) {
          ctx.fillStyle = '#C8FFD4';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00FF66';
        } else {
          ctx.fillStyle = '#00FF41';
          ctx.shadowBlur = 0;
        }

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Focus input automatically on initial mount
  useEffect(() => {
    if (phase === 'NAME_PROMPT') {
      inputRef.current?.focus();
    }
  }, [phase]);

  // Phase 1 Submission: Locks input and begins Phase 2 terminal bootup
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = typedName.trim() || 'Anonymous';
    setUserName(finalName);
    sound.playAccessGranted();
    setPhase('INITIALIZATION');

    // Run progressive terminal boot sequence
    const bootSteps = [
      { text: '[+] Authenticating node...', delay: 250 },
      { text: '[+] Reading core system files (SHA256: 9b8c...a721)...', delay: 700 },
      { text: '[+] Decrypting neural link buffer...', delay: 1200 },
      { text: `[+] Access Granted. Welcome, ${finalName}.`, delay: 1800 }
    ];

    setInitLogs([]);

    bootSteps.forEach((step, index) => {
      setTimeout(() => {
        sound.playGlitch();
        setInitLogs((prev) => [...prev, step.text]);

        // When last step finishes, trigger glitch and advance to Morpheus choice
        if (index === bootSteps.length - 1) {
          setTimeout(() => {
            setIsGlitching(true);
            setTimeout(() => {
              setIsGlitching(false);
              setPhase('MORPHEUS_CHOICE');
            }, 600);
          }, 900);
        }
      }, step.delay);
    });
  };

  // Phase 3 Choice Handler: Red Pill vs Blue Pill
  const handleSelectChoice = (choice: PillPath) => {
    if (selectedPill || isFadingOut) return;

    setSelectedPill(choice);
    sound.playLevelUp();
    setIsFadingOut(true);

    setTimeout(() => {
      onEnterTerminal(choice, userName || 'Anonymous');
    }, 900);
  };

  return (
    <div className={`relative min-h-screen w-full bg-[#050505] text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 overflow-x-hidden font-sans select-none transition-opacity duration-700 ${isFadingOut ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100'}`}>
      
      {/* Pinned Top-Right Settings Gear Button with Neon-Green Glow Accent (#00FF66) */}
      {onOpenSettings && (
        <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-30">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] p-2 sm:p-2.5 rounded-xl border border-[#00FF66]/50 bg-black/90 text-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.35)] hover:border-[#00FF66] hover:bg-[#00FF66]/10 hover:shadow-[0_0_30px_rgba(0,255,102,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF66] transition-all cursor-pointer flex items-center justify-center"
            title="System Settings"
            aria-label="System Settings"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 animate-[spin_10s_linear_infinite]" />
          </button>
        </div>
      )}

      {/* 1. Animated Digital Rain Canvas (Full-Height Viewport on all devices) */}
      <canvas
        ref={canvasRef}
        className="min-h-[100dvh] w-full h-full fixed inset-0 -z-10 pointer-events-none opacity-40"
      />

      {/* 2. CRT Scanlines & Ambient Grid Glow */}
      <div 
        className="fixed inset-0 pointer-events-none -z-10 opacity-30"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
          backgroundSize: '100% 4px, 6px 100%'
        }}
      />
      <div className="fixed inset-0 bg-radial-gradient from-transparent via-[#050505]/60 to-[#050505] pointer-events-none -z-10" />

      {/* Center Main Stage */}
      <div className="relative z-20 w-full max-w-[92vw] sm:max-w-3xl mx-auto flex flex-col items-center text-center space-y-5 sm:space-y-8 overflow-x-hidden pt-10 pb-6 sm:py-6">
        
        {/* Top Badge (Retained & Restyled: Neon-bordered badge) */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-[#00FF66]/60 bg-[#00FF66]/5 text-[#00FF66] text-[10px] sm:text-xs font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(0,255,102,0.25)] backdrop-blur-md transition-all max-w-full">
          <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse shadow-[0_0_10px_#00FF66] shrink-0" />
          <span className="font-bold truncate">INTERACTIVE CYBERSECURITY SIMULATOR</span>
        </div>

        {/* Main Header (CYBER LABS - Neon Glowing Drop Shadow) */}
        <div className="space-y-1.5 sm:space-y-2">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-heading font-black tracking-tight text-white uppercase drop-shadow-[0_0_35px_rgba(0,255,102,0.5)]">
            CYBER <span className="text-[#00FF66] drop-shadow-[0_0_30px_rgba(0,255,102,0.85)]">LABS</span>
          </h1>

          {/* Subtext (MADE BY UMER KHAN - Clean Mono-spaced Tracking) */}
          <p className="text-[10px] sm:text-xs md:text-sm font-mono tracking-[0.25em] sm:tracking-[0.3em] text-[#00FF41]/80 uppercase font-semibold">
            MADE BY UMER KHAN
          </p>
        </div>

        {/* ============================================================ */}
        {/* PHASE 1: Terminal Name Prompt */}
        {/* ============================================================ */}
        {phase === 'NAME_PROMPT' && (
          <div className="w-full max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
            {/* Sleek Glassmorphic CLI Box */}
            <form
              onSubmit={handleNameSubmit}
              className="relative p-4 sm:p-6 rounded-2xl border border-[#00FF66]/40 bg-[#080d0a]/90 backdrop-blur-xl shadow-[0_0_40px_rgba(0,255,102,0.15)] text-left font-mono text-xs sm:text-sm space-y-4 group hover:border-[#00FF66]/70 transition-all max-w-full overflow-hidden"
            >
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between border-b border-[#00FF66]/20 pb-3 text-slate-400 text-xs flex-wrap gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00FF66]/80 inline-block shadow-[0_0_8px_#00FF66]" />
                  <span className="text-[#00FF66] font-bold text-[11px] sm:text-xs ml-1 truncate">auth_session // v0.9.4</span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-emerald-500/80 font-bold">NEURAL LINK READY</span>
              </div>

              {/* Interactive Prompt Line */}
              <div className="flex items-center gap-1.5 sm:gap-2 pt-1 min-w-0 whitespace-nowrap">
                <span className="text-[#00FF66] font-bold text-[11px] sm:text-xs shrink-0 select-none">
                  anonymous@cyberlabs:~$
                </span>
                <div className="flex-1 flex items-center min-w-0">
                  <input
                    ref={inputRef}
                    type="text"
                    value={typedName}
                    maxLength={18}
                    onChange={(e) => {
                      sound.playKeystroke();
                      setTypedName(e.target.value);
                    }}
                    placeholder="Enter name..."
                    className="w-full min-w-0 bg-transparent text-white font-mono font-bold focus:outline-none placeholder:text-slate-600 text-[#00FF66] selection:bg-[#00FF66]/40 text-[11px] sm:text-xs md:text-sm"
                    autoFocus
                  />
                  <span className="w-2 h-3.5 sm:w-2.5 sm:h-4 bg-[#00FF66] animate-pulse inline-block shadow-[0_0_8px_#00FF66] shrink-0 ml-0.5" />
                </div>
              </div>

              {/* Submit CTA Inside Terminal */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#00FF66]/20">
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500">
                  <span>Quick tags:</span>
                  {['NEO', 'CIPHER', 'ZERO_DAY', 'SHADOW'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        sound.playKeystroke();
                        setTypedName(tag);
                        inputRef.current?.focus();
                      }}
                      className="px-1.5 py-0.5 rounded bg-[#00FF66]/10 hover:bg-[#00FF66]/20 text-[#00FF66] text-[10px] border border-[#00FF66]/30 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 rounded-lg bg-[#00FF66] hover:bg-[#00FF41] text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.4)] hover:shadow-[0_0_30px_rgba(0,255,102,0.6)] active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <span>INITIALIZE</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* PHASE 2: Fast-Scrolling Initialization Sequence */}
        {/* ============================================================ */}
        {phase === 'INITIALIZATION' && (
          <div className="w-full max-w-xl mx-auto space-y-4 animate-in fade-in duration-200">
            <div className={`p-5 sm:p-6 rounded-2xl border border-[#00FF66]/60 bg-[#060c08]/95 backdrop-blur-xl shadow-[0_0_50px_rgba(0,255,102,0.3)] text-left font-mono text-xs sm:text-sm space-y-2.5 transition-all ${isGlitching ? 'skew-x-2 filter invert-[0.1]' : ''}`}>
              <div className="flex items-center justify-between border-b border-[#00FF66]/30 pb-2 text-[#00FF66] text-xs font-bold">
                <span>SYSTEM KERNEL BOOTSTRAP</span>
                <span className="animate-spin text-[#00FF66]">◒</span>
              </div>

              <div className="space-y-2 py-2 min-h-[120px]">
                {initLogs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={`leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-150 text-[11px] sm:text-xs ${
                      log.includes('Access Granted')
                        ? 'text-[#00FF66] font-bold text-xs sm:text-sm drop-shadow-[0_0_10px_#00FF66]'
                        : 'text-emerald-300'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>

              {/* Progress Loading Bar */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-[#00FF66]/30">
                <div className="bg-[#00FF66] h-full shadow-[0_0_12px_#00FF66] animate-[pulse_0.8s_ease-in-out_infinite]" style={{ width: `${(initLogs.length / 4) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PHASE 3: The Morpheus Choice Scene (Pills Reveal) */}
        {/* ============================================================ */}
        {phase === 'MORPHEUS_CHOICE' && (
          <div className="w-full max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in zoom-in-95 duration-500">
            
            {/* Morpheus Stylized High-Contrast Silhouette Banner */}
            <div className="relative p-5 sm:p-8 rounded-2xl border border-emerald-500/40 bg-[#07090d]/90 backdrop-blur-xl shadow-[0_0_50px_rgba(0,255,102,0.15)] space-y-6 overflow-hidden">
              
              {/* Subtle Matrix Code Stream Overlay on Morpheus Box */}
              <div className="absolute top-0 right-0 w-32 h-full pointer-events-none opacity-20 font-mono text-[9px] text-[#00FF66] select-none text-right pr-4 overflow-hidden hidden sm:block">
                01010101<br />10010110<br />11001100<br />00110011<br />01101001
              </div>

              {/* Animated Mysterious Hooded Operative Silhouette */}
              <div className="relative flex flex-col items-center justify-center mt-2 mb-6 sm:mb-8">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
                  {/* Ambient Cyber Aura */}
                  <div className="absolute inset-0 rounded-full bg-[#00FF66]/10 blur-xl animate-pulse" />
                  
                  {/* Vector Mysterious Hooded Figure SVG */}
                  <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-[0_0_25px_rgba(0,255,102,0.4)] animate-float-gentle">
                    <defs>
                      <linearGradient id="hoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#08140c" />
                        <stop offset="60%" stopColor="#020804" />
                        <stop offset="100%" stopColor="#000000" />
                      </linearGradient>
                      <filter id="greenGlow">
                        <feGaussianBlur stdDeviation="2.5" result="glow" />
                        <feMerge>
                          <feMergeNode in="glow" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Cloak Shoulders & Body */}
                    <path 
                      d="M 20 150 L 35 95 L 60 70 L 100 70 L 125 95 L 140 150 Z" 
                      fill="url(#hoodGrad)" 
                      stroke="#00FF66" 
                      strokeWidth="1.5"
                      strokeOpacity="0.6"
                    />

                    {/* Cloak Collar Fold */}
                    <path d="M 45 105 L 80 135 L 115 105" fill="none" stroke="#00FF66" strokeWidth="1.2" strokeOpacity="0.4" />

                    {/* Deep Hooded Cowl */}
                    <path 
                      d="M 45 85 Q 40 25 80 18 Q 120 25 115 85 Q 80 105 45 85 Z" 
                      fill="#020603" 
                      stroke="#00FF66" 
                      strokeWidth="2" 
                    />

                    {/* Void Face Shadows */}
                    <path d="M 55 75 Q 80 92 105 75 Q 98 42 80 40 Q 62 42 55 75 Z" fill="#000000" />

                    {/* Piercing Glowing Cyber Optics / Reflective Shades */}
                    <g filter="url(#greenGlow)">
                      {/* Left Lens */}
                      <ellipse cx="68" cy="62" rx="9" ry="5.5" fill="#00FF66" className="animate-pulse" />
                      <ellipse cx="67" cy="61" rx="4" ry="2" fill="#ffffff" />
                      
                      {/* Right Lens */}
                      <ellipse cx="92" cy="62" rx="9" ry="5.5" fill="#00FF66" className="animate-pulse" />
                      <ellipse cx="91" cy="61" rx="4" ry="2" fill="#ffffff" />
                      
                      {/* Bridge */}
                      <line x1="77" y1="62" x2="83" y2="62" stroke="#00FF66" strokeWidth="2" />
                    </g>

                    {/* Subtle Holographic Code Scanning Line */}
                    <line x1="50" y1="62" x2="110" y2="62" stroke="#00FF66" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
                  </svg>
                </div>
              </div>

              {/* Morpheus Dialogue Quote */}
              <div className="space-y-3 text-center max-w-xl mx-auto pt-3 sm:pt-4 pb-2 px-2">
                <blockquote className="text-sm sm:text-base md:text-lg font-mono text-slate-200 italic leading-relaxed">
                  "Two paths diverge in the mainframe. The blue pill trains you to hunt, analyze, and neutralize advanced adversaries before they strike. The red pill arms you with arsenal to shatter firewalls and exploit vulnerabilities. The choice is yours, {userName || 'Anonymous'}."
                </blockquote>
              </div>

              {/* Morpheus Silhouette & 2 Glowing Extended Pill Hands */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4">
                
                {/* 1. RED PILL (Offensive / Red Team Hacker) */}
                <div
                  onMouseEnter={() => {
                    sound.playPillHum(true);
                    setHoveredPill('RED');
                  }}
                  onMouseLeave={() => setHoveredPill(null)}
                  onClick={() => handleSelectChoice('RED')}
                  className={`group relative p-5 sm:p-6 rounded-xl border cursor-pointer transition-all duration-300 text-left space-y-4 flex flex-col justify-between ${
                    selectedPill === 'RED'
                      ? 'bg-red-950/80 border-[#FF0055] shadow-[0_0_60px_rgba(255,0,85,0.8)] scale-[1.03]'
                      : hoveredPill === 'RED'
                        ? 'bg-red-950/50 border-[#FF0055] shadow-[0_0_35px_rgba(255,0,85,0.45)] scale-[1.02]'
                        : 'bg-[#0b0709] border-red-900/40 hover:border-red-500/70 shadow-[0_0_20px_rgba(255,0,85,0.15)]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Glowing 3D Pill Capsule Graphic */}
                    <div className="flex items-center justify-between">
                      <div className="relative flex items-center justify-center">
                        {/* Red Pill Capsule */}
                        <div className="w-12 h-6 sm:w-14 sm:h-7 rounded-full bg-gradient-to-r from-red-600 via-[#FF0055] to-rose-400 border border-red-300/80 shadow-[0_0_25px_rgba(255,0,85,0.9)] transform -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                          <div className="absolute top-1 left-2 right-2 h-1.5 rounded-full bg-white/40 blur-[0.5px]" />
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 border border-red-800 text-[#FF0055] font-bold uppercase tracking-wider">
                        OFFENSIVE PATH
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-heading font-black text-white group-hover:text-[#FF0055] transition-colors uppercase flex items-center gap-2">
                        <span>THE RED PILL</span>
                        <Crosshair className="w-4 h-4 text-[#FF0055]" />
                      </h3>
                      <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                        Embrace the offensive craft. Terminal navigation, privilege escalation, Nmap reconnaissance, SQL injection, and full kill-chain adversary operations.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-red-900/50 flex items-center justify-between font-mono text-xs text-[#FF0055] font-bold">
                    <span>ENTER OFFENSIVE TRACK</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 2. BLUE PILL (Defensive / SOC Sentinel) */}
                <div
                  onMouseEnter={() => {
                    sound.playPillHum(false);
                    setHoveredPill('BLUE');
                  }}
                  onMouseLeave={() => setHoveredPill(null)}
                  onClick={() => handleSelectChoice('BLUE')}
                  className={`group relative p-5 sm:p-6 rounded-xl border cursor-pointer transition-all duration-300 text-left space-y-4 flex flex-col justify-between ${
                    selectedPill === 'BLUE'
                      ? 'bg-cyan-950/80 border-[#00D4FF] shadow-[0_0_60px_rgba(0,212,255,0.8)] scale-[1.03]'
                      : hoveredPill === 'BLUE'
                        ? 'bg-cyan-950/50 border-[#00D4FF] shadow-[0_0_35px_rgba(0,212,255,0.45)] scale-[1.02]'
                        : 'bg-[#060b10] border-cyan-900/40 hover:border-cyan-400/70 shadow-[0_0_20px_rgba(0,212,255,0.15)]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Glowing 3D Pill Capsule Graphic */}
                    <div className="flex items-center justify-between">
                      <div className="relative flex items-center justify-center">
                        {/* Blue Pill Capsule */}
                        <div className="w-12 h-6 sm:w-14 sm:h-7 rounded-full bg-gradient-to-r from-blue-600 via-[#00D4FF] to-sky-300 border border-cyan-200/80 shadow-[0_0_25px_rgba(0,212,255,0.9)] transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                          <div className="absolute top-1 left-2 right-2 h-1.5 rounded-full bg-white/40 blur-[0.5px]" />
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-[#00D4FF] font-bold uppercase tracking-wider">
                        DEFENSIVE PATH
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-heading font-black text-white group-hover:text-[#00D4FF] transition-colors uppercase flex items-center gap-2">
                        <span>THE BLUE PILL</span>
                        <Shield className="w-4 h-4 text-[#00D4FF]" />
                      </h3>
                      <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                        Shield the infrastructure. Host endpoint process forensics, SIEM log hunting, Wireshark packet analysis, and NIST incident command remediation.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-cyan-900/50 flex items-center justify-between font-mono text-xs text-[#00D4FF] font-bold">
                    <span>ENTER DEFENSIVE TRACK</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
