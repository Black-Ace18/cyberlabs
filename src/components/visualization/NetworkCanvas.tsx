import React from 'react';
import { 
  Globe, 
  Server, 
  Database, 
  Shield, 
  Laptop, 
  Mail, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Wifi,
  Radio,
  FileCode2,
  Layers
} from 'lucide-react';

interface NetworkCanvasProps {
  type: 'WEB_APP_DB' | 'BROWSER_DOM' | 'AUTH_SERVER' | 'EMAIL_FLOW' | 'NETWORK_TOPOLOGY';
  mode: 'HACKER' | 'ANALYST' | 'REPLAY' | 'CONCEPT';
  isAttacking?: boolean;
  isDefended?: boolean;
  activePayload?: string;
  activeMitigation?: string;
  stepIndex?: number;
  highlightedNode?: string;
  packetLabel?: string;
}

export const NetworkCanvas: React.FC<NetworkCanvasProps> = ({
  type,
  mode,
  isAttacking = false,
  isDefended = false,
  activePayload = '',
  activeMitigation = '',
  stepIndex = 0,
  highlightedNode,
  packetLabel
}) => {
  const isHacker = mode === 'HACKER';

  return (
    <div className="relative w-full rounded-xl border border-green-500/30 bg-black/85 p-4 sm:p-6 overflow-hidden cyber-grid backdrop-blur-md shadow-[0_0_30px_rgba(0,255,102,0.05)]">
      {/* Background glowing telemetry ring */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#00FF66]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#00E5FF]/5 blur-3xl pointer-events-none" />

      {/* Top Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-green-500/20 pb-3 mb-5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${isAttacking ? 'bg-[#FF3366] animate-ping' : isDefended ? 'bg-[#00FF66] animate-pulse' : 'bg-[#00E5FF]'}`} />
          <span className="text-green-400 uppercase tracking-wider font-semibold">
            {type.replace('_', ' ')} // {mode} PERSPECTIVE
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span className="hidden sm:inline text-green-400 font-bold">STATE:</span>
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
            isAttacking 
              ? 'bg-red-950/80 border-[#FF3366]/50 text-[#FF3366] shadow-[0_0_10px_rgba(255,51,102,0.3)]' 
              : isDefended 
                ? 'bg-green-950/80 border-green-500/50 text-[#00FF66] shadow-[0_0_10px_rgba(0,255,102,0.3)]' 
                : 'bg-black border-green-500/30 text-green-300'
          }`}>
            {isAttacking ? 'ACTIVE THREAT VECTOR' : isDefended ? 'HARDENED / SECURED' : 'SURVEILLANCE'}
          </span>
        </div>
      </div>

      {/* Diagram Renderers */}
      {type === 'WEB_APP_DB' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center relative py-3">
          {/* Node 1: Client / Hacker */}
          <div className={`p-4 rounded-lg border flex flex-col items-center text-center transition-all duration-300 ${
            isHacker ? 'bg-red-950/40 border-[#FF3366]/50 text-red-200 shadow-[0_0_15px_rgba(255,51,102,0.2)]' : 'bg-black/80 border-green-500/30 text-slate-200'
          }`}>
            <div className={`p-3 rounded-full mb-2 ${isHacker ? 'bg-red-950/80 text-[#FF3366] border border-[#FF3366]/40' : 'bg-green-950/60 text-[#00FF66] border border-green-500/40'}`}>
              <Laptop className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold">{isHacker ? 'THREAT ORIGIN' : 'CLIENT USER'}</span>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">IP: 198.51.100.42</span>
            {activePayload && (
              <div className="mt-2 text-[10px] bg-black px-2 py-1 rounded text-amber-300 font-mono border border-amber-500/40 max-w-full truncate">
                {activePayload}
              </div>
            )}
          </div>

          {/* Connection 1 */}
          <div className="flex md:flex-col items-center justify-center text-center py-2 relative">
            <div className={`w-full md:w-0.5 h-0.5 md:h-12 ${isAttacking ? 'bg-[#FF3366] shadow-[0_0_8px_#FF3366]' : isDefended ? 'bg-[#00FF66] shadow-[0_0_8px_#00FF66]' : 'bg-green-500/30'}`} />
            <div className="my-1 px-2.5 py-0.5 bg-black border border-green-500/30 rounded text-[10px] font-mono text-[#00E5FF] shrink-0">
              HTTP POST /login
            </div>
            <ArrowRight className={`w-4 h-4 md:rotate-90 ${isAttacking ? 'text-[#FF3366]' : 'text-green-400'}`} />
          </div>

          {/* Node 2: Web Server Application */}
          <div className={`p-4 rounded-lg border flex flex-col items-center text-center transition-all duration-300 ${
            isDefended 
              ? 'bg-green-950/40 border-green-500/50 text-green-200 shadow-[0_0_15px_rgba(0,255,102,0.15)]' 
              : isAttacking 
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200' 
                : 'bg-black/80 border-green-500/30 text-slate-200'
          }`}>
            <div className={`p-3 rounded-full mb-2 ${isDefended ? 'bg-green-950/80 text-[#00FF66] border border-green-500/40' : 'bg-cyan-950/60 text-[#00E5FF] border border-cyan-500/40'}`}>
              <Server className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold">WEB APP SERVER</span>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">Node.js / Express</span>
            <div className="mt-2 text-[10px] px-2 py-0.5 rounded border border-green-500/20 bg-black font-mono">
              {isDefended ? 'PREPARED STMTS ($1, $2)' : 'UNSAFE CONCATENATION'}
            </div>
          </div>

          {/* Node 3: Database */}
          <div className={`p-4 rounded-lg border flex flex-col items-center text-center transition-all duration-300 ${
            isDefended 
              ? 'bg-green-950/30 border-green-500/50 text-green-200 shadow-[0_0_15px_rgba(0,255,102,0.15)]' 
              : isAttacking 
                ? 'bg-red-950/40 border-red-500/60 text-red-200 shadow-[0_0_15px_rgba(255,51,102,0.2)]' 
                : 'bg-black/80 border-green-500/30 text-slate-200'
          }`}>
            <div className={`p-3 rounded-full mb-2 ${isAttacking && !isDefended ? 'bg-red-950/80 text-[#FF3366] border border-[#FF3366]/40' : 'bg-purple-950/60 text-purple-400 border border-purple-500/40'}`}>
              <Database className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold">SQL DATABASE</span>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">PostgreSQL 15</span>
            <div className="mt-2 text-[10px] font-mono font-semibold">
              {isDefended ? (
                <span className="text-[#00FF66] flex items-center gap-1"><Shield className="w-3 h-3" /> QUERY PARAMETERIZED</span>
              ) : isAttacking ? (
                <span className="text-[#FF3366] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> SYNTAX COMPROMISED</span>
              ) : (
                <span className="text-slate-400">STATUS: STANDBY</span>
              )}
            </div>
          </div>
        </div>
      )}

      {type === 'BROWSER_DOM' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center relative py-3">
          {/* Node 1: Post Input */}
          <div className="p-4 rounded-lg border border-green-500/30 bg-black/80 flex flex-col items-center text-center">
            <div className="p-3 rounded-full mb-2 bg-amber-950/60 text-amber-400 border border-amber-500/40">
              <FileCode2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold">INPUT PAYLOAD</span>
            <span className="text-[10px] text-slate-400 mt-1">&lt;img onerror=...&gt;</span>
            <div className="mt-2 text-[10px] bg-black px-2 py-1 rounded text-amber-300 font-mono border border-amber-500/30">
              User-Controlled String
            </div>
          </div>

          {/* Connection */}
          <div className="flex md:flex-col items-center justify-center text-center py-2">
            <div className={`w-full md:w-0.5 h-0.5 md:h-12 ${isDefended ? 'bg-[#00FF66]' : 'bg-[#FF3366]'}`} />
            <div className="my-1 px-2.5 py-0.5 bg-black border border-green-500/30 rounded text-[10px] font-mono text-[#00E5FF]">
              {isDefended ? 'HTML ENCODED (&lt;img...&gt;)' : 'RAW UNESCAPED INJECTION'}
            </div>
          </div>

          {/* Node 2: Victim Browser DOM */}
          <div className={`p-4 rounded-lg border flex flex-col items-center text-center ${
            isDefended ? 'bg-green-950/40 border-green-500/50 text-green-200' : 'bg-red-950/40 border-[#FF3366]/50 text-red-200'
          }`}>
            <div className={`p-3 rounded-full mb-2 ${isDefended ? 'bg-green-950/80 text-[#00FF66]' : 'bg-red-950/80 text-[#FF3366]'}`}>
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold">VICTIM BROWSER DOM</span>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">Chrome / Safari Engine</span>
            <div className="mt-2 text-[10px] font-mono font-semibold">
              {isDefended ? (
                <span className="text-[#00FF66] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> TEXT DATA (NO EXECUTION)</span>
              ) : (
                <span className="text-[#FF3366] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> SCRIPT EXECUTED</span>
              )}
            </div>
          </div>
        </div>
      )}

      {type === 'AUTH_SERVER' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center relative py-3">
          <div className="p-4 rounded-lg border border-green-500/30 bg-black/80 flex flex-col items-center text-center">
            <div className="p-3 rounded-full mb-2 bg-red-950/60 text-[#FF3366] border border-[#FF3366]/40">
              <Laptop className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold">AUTOMATED BOT</span>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">Velocity: 100 req/sec</span>
            <div className="mt-2 text-[10px] bg-black px-2 py-0.5 rounded text-amber-300 font-mono border border-amber-500/30">
              Wordlist Guessing
            </div>
          </div>

          <div className="flex md:flex-col items-center justify-center text-center py-2">
            <div className={`w-full md:w-0.5 h-0.5 md:h-12 ${isDefended ? 'bg-[#00FF66]' : 'bg-[#FF3366]'}`} />
            <div className="my-1 px-2.5 py-0.5 bg-black border border-green-500/30 rounded text-[10px] font-mono text-[#00E5FF]">
              {isDefended ? 'RATE LIMITER (HTTP 429)' : 'UNTHROTTLED (HTTP 200/401)'}
            </div>
          </div>

          <div className={`p-4 rounded-lg border flex flex-col items-center text-center ${
            isDefended ? 'bg-green-950/40 border-green-500/50 text-green-200' : 'bg-red-950/40 border-[#FF3366]/50 text-red-200'
          }`}>
            <div className={`p-3 rounded-full mb-2 ${isDefended ? 'bg-green-950/80 text-[#00FF66]' : 'bg-red-950/80 text-[#FF3366]'}`}>
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold">AUTH SERVICE + MFA</span>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">Token Issuance Gateway</span>
            <div className="mt-2 text-[10px] font-mono font-semibold">
              {isDefended ? (
                <span className="text-[#00FF66] flex items-center gap-1"><Shield className="w-3 h-3" /> LOCKED & MFA REQUIRED</span>
              ) : (
                <span className="text-[#FF3366] flex items-center gap-1"><Unlock className="w-3 h-3" /> TOKEN COMPROMISED</span>
              )}
            </div>
          </div>
        </div>
      )}

      {type === 'EMAIL_FLOW' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center relative py-3">
          <div className="p-4 rounded-lg border border-green-500/30 bg-black/80 flex flex-col items-center text-center">
            <div className="p-3 rounded-full mb-2 bg-purple-950/60 text-purple-400 border border-purple-500/40">
              <Mail className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold">EXTERNAL SENDER</span>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">globa1-logistics-sso.com</span>
            <div className="mt-2 text-[10px] bg-black px-2 py-0.5 rounded text-amber-300 font-mono border border-amber-500/30">
              Typosquatted Domain
            </div>
          </div>

          <div className="flex md:flex-col items-center justify-center text-center py-2">
            <div className={`w-full md:w-0.5 h-0.5 md:h-12 ${isDefended ? 'bg-[#00FF66]' : 'bg-[#FF3366]'}`} />
            <div className="my-1 px-2.5 py-0.5 bg-black border border-green-500/30 rounded text-[10px] font-mono text-[#00E5FF]">
              {isDefended ? 'DMARC FILTER (REJECTED)' : 'INBOX DELIVERED'}
            </div>
          </div>

          <div className={`p-4 rounded-lg border flex flex-col items-center text-center ${
            isDefended ? 'bg-green-950/40 border-green-500/50 text-green-200' : 'bg-red-950/40 border-[#FF3366]/50 text-red-200'
          }`}>
            <div className={`p-3 rounded-full mb-2 ${isDefended ? 'bg-green-950/80 text-[#00FF66]' : 'bg-red-950/80 text-[#FF3366]'}`}>
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold">RECIPIENT INBOX + FIDO2</span>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">s.vance@globallogistics.corp</span>
            <div className="mt-2 text-[10px] font-mono font-semibold">
              {isDefended ? (
                <span className="text-[#00FF66] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> QUARANTINED</span>
              ) : (
                <span className="text-[#FF3366] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> PHISHED</span>
              )}
            </div>
          </div>
        </div>
      )}

      {type === 'NETWORK_TOPOLOGY' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center relative py-3">
          {/* Public Internet */}
          <div className="p-4 rounded-lg border border-green-500/30 bg-black/80 flex flex-col items-center text-center">
            <div className="p-3 rounded-full mb-2 bg-blue-950/60 text-blue-400 border border-blue-500/40">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold">PUBLIC INTERNET</span>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">0.0.0.0/0</span>
          </div>

          {/* Firewall */}
          <div className={`p-4 rounded-lg border flex flex-col items-center text-center ${
            isDefended ? 'bg-green-950/40 border-green-500/50 text-green-200' : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
          }`}>
            <div className={`p-3 rounded-full mb-2 ${isDefended ? 'bg-green-950/80 text-[#00FF66]' : 'bg-amber-950/80 text-amber-400'}`}>
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold">STATEFUL FIREWALL</span>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">{isDefended ? 'DEFAULT-DENY (PORT 443 ONLY)' : 'PERMISSIVE (ALL OPEN)'}</span>
          </div>

          {/* Web Server (DMZ) */}
          <div className="p-4 rounded-lg border border-green-500/30 bg-black/80 flex flex-col items-center text-center">
            <div className="p-3 rounded-full mb-2 bg-cyan-950/60 text-cyan-400 border border-cyan-500/40">
              <Server className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold">WEB DMZ HOST</span>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">198.51.100.14:443</span>
          </div>

          {/* Database Server */}
          <div className={`p-4 rounded-lg border flex flex-col items-center text-center ${
            isDefended ? 'bg-green-950/40 border-green-500/50 text-green-200' : 'bg-red-950/40 border-[#FF3366]/50 text-red-200'
          }`}>
            <div className={`p-3 rounded-full mb-2 ${isDefended ? 'bg-green-950/80 text-[#00FF66]' : 'bg-red-950/80 text-[#FF3366]'}`}>
              <Database className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold">DATABASE SERVER</span>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">{isDefended ? 'PRIVATE (10.0.2.18:3306)' : 'PUBLIC (198.51.100.18:3306)'}</span>
            <div className="mt-2 text-[10px] font-mono font-semibold">
              {isDefended ? (
                <span className="text-[#00FF66]">SEGMENTED</span>
              ) : (
                <span className="text-[#FF3366]">EXPOSED</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Forensic Telemetry Bar */}
      {activeMitigation && (
        <div className="mt-4 pt-3 border-t border-green-500/20 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="text-green-400 font-semibold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#00FF66]" /> APPLIED SECURITY CONTROLS:
          </span>
          <span className="text-slate-200">{activeMitigation}</span>
        </div>
      )}
    </div>
  );
};
