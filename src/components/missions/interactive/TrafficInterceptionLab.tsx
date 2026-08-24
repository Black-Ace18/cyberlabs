import React, { useState, useEffect } from 'react';
import { MissionData } from '../../../types/cyberlab';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Radio, 
  Database, 
  AlertTriangle, 
  HelpCircle, 
  Timer,
  Activity,
  ShieldAlert,
  Server
} from 'lucide-react';
import { sound } from '../../../utils/audio';

interface TrafficInterceptionLabProps {
  mission: MissionData;
  onSuccess: () => void;
}

interface DPIPacket {
  id: string;
  timestamp: string;
  sourceIp: string;
  destIp: string;
  destPort: number;
  protocol: 'HTTP' | 'TLSv1.3' | 'DNS' | 'SSH';
  contentSummary: string;
  isRogueExfil: boolean;
  isNeutralized: boolean;
  threatDetails?: string;
}

const TOTAL_TIME_SECONDS = 10.0;
const REQUIRED_COUNT = 3;

export const TrafficInterceptionLab: React.FC<TrafficInterceptionLabProps> = ({
  mission,
  onSuccess
}) => {
  const [neutralizedCount, setNeutralizedCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showIntelManual, setShowIntelManual] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const initialPackets: DPIPacket[] = [
    {
      id: 'dpi-101',
      timestamp: '15:20:01.120',
      sourceIp: '10.0.1.45',
      destIp: '203.0.113.88',
      destPort: 80,
      protocol: 'HTTP',
      contentSummary: 'POST /exfil/upload [DATA: customer_records.csv (Size: 38MB)]',
      isRogueExfil: true,
      isNeutralized: false,
      threatDetails: 'Cleartext exfiltration of customer records to untrusted external IP.'
    },
    {
      id: 'dpi-102',
      timestamp: '15:20:02.405',
      sourceIp: '10.0.1.88',
      destIp: '142.250.190.46',
      destPort: 443,
      protocol: 'TLSv1.3',
      contentSummary: 'Application Data [Encrypted Google Cloud API Telemetry]',
      isRogueExfil: false,
      isNeutralized: false
    },
    {
      id: 'dpi-103',
      timestamp: '15:20:03.880',
      sourceIp: '10.0.1.12',
      destIp: '198.51.100.22',
      destPort: 80,
      protocol: 'HTTP',
      contentSummary: 'POST /c2/sync [DATA: kerberos_tickets_dump.bin]',
      isRogueExfil: true,
      isNeutralized: false,
      threatDetails: 'Unauthorized HTTP transmission containing dumped Kerberos authentication tickets.'
    },
    {
      id: 'dpi-104',
      timestamp: '15:20:04.910',
      sourceIp: '10.0.1.100',
      destIp: '10.0.1.2',
      destPort: 53,
      protocol: 'DNS',
      contentSummary: 'Standard Query 0x4a12 A srv-database.internal',
      isRogueExfil: false,
      isNeutralized: false
    },
    {
      id: 'dpi-105',
      timestamp: '15:20:06.150',
      sourceIp: '10.0.1.99',
      destIp: '203.0.113.88',
      destPort: 80,
      protocol: 'HTTP',
      contentSummary: 'POST /dump/export [DATA: financial_ledger_q4.sql]',
      isRogueExfil: true,
      isNeutralized: false,
      threatDetails: 'Active database SQL dump export to untrusted external endpoint.'
    },
    {
      id: 'dpi-106',
      timestamp: '15:20:07.600',
      sourceIp: '10.0.1.5',
      destIp: '52.28.10.19',
      destPort: 443,
      protocol: 'TLSv1.3',
      contentSummary: 'TLS Handshake [Encrypted Corporate ERP Payroll Gateway]',
      isRogueExfil: false,
      isNeutralized: false
    }
  ];

  const [packets, setPackets] = useState<DPIPacket[]>(initialPackets);

  // 10-Second Live Countdown Timer
  useEffect(() => {
    if (isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          handleTimeExpired();
          return TOTAL_TIME_SECONDS;
        }
        return Math.round((prev - 0.1) * 10) / 10;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isCompleted]);

  // Stream auto-cycle
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setPackets(prev => {
        const next = [...prev];
        const first = next.shift();
        if (first) {
          next.push({
            ...first,
            id: `dpi-${Date.now()}-${Math.floor(Math.random() * 100)}`,
            isNeutralized: false
          });
        }
        return next;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isCompleted]);

  const handleTimeExpired = () => {
    sound.playAlert();
    setNeutralizedCount(0);
    setPackets(initialPackets.map(p => ({ ...p, isNeutralized: false, id: `dpi-${Date.now()}-${Math.random()}` })));
    setErrorNotice('TIME EXPIRED (10.0s): DPI egress window elapsed. Re-synchronizing filter...');
    setTimeout(() => {
      setErrorNotice(null);
    }, 2000);
  };

  const handleNeutralizeThreat = (pkt: DPIPacket) => {
    if (isCompleted) return;

    if (!pkt.isRogueExfil) {
      sound.playAlert();
      setErrorNotice(
        `DROP REJECTED: ${pkt.protocol} packet is verified legitimate business traffic. Dropping causes business disruption!`
      );
      setTimeout(() => setErrorNotice(null), 3000);
      return;
    }

    if (pkt.isNeutralized) {
      setErrorNotice('This exfiltration stream has already been neutralized.');
      setTimeout(() => setErrorNotice(null), 2000);
      return;
    }

    // Threat neutralized
    sound.playThreatNeutralized();
    setPackets(prev =>
      prev.map(p => (p.id === pkt.id ? { ...p, isNeutralized: true } : p))
    );

    const newCount = neutralizedCount + 1;
    setNeutralizedCount(newCount);
    setSuccessNotice(`ROGUE EXFILTRATION BLOCKED & DROPPED: [${pkt.destIp}]`);
    setTimeout(() => setSuccessNotice(null), 2500);

    if (newCount >= REQUIRED_COUNT) {
      setIsCompleted(true);
      sound.playVictory();
      setTimeout(() => {
        onSuccess();
      }, 1800);
    }
  };

  const timePercentage = Math.max(0, Math.min(100, (timeLeft / TOTAL_TIME_SECONDS) * 100));
  const isTimeCritical = timeLeft <= 3.0;

  return (
    <div className="w-full max-w-full overflow-x-hidden box-border space-y-6 animate-in fade-in duration-300 text-left">
      {/* 1. Tactical Header */}
      <div className="p-4 sm:p-6 rounded-2xl bg-black/90 border border-cyan-500/40 shadow-[0_0_30px_rgba(0,212,255,0.2)] backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border bg-cyan-950/80 border-cyan-500/50 text-[#00D4FF] whitespace-nowrap">
                BLUE PILL // LEVEL 04
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border bg-amber-950/60 text-amber-400 border-amber-500/30 whitespace-nowrap">
                INTERMEDIATE
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
                <span className="truncate">Active DPI Perimeter Sensor</span>
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#00D4FF] shrink-0" />
              <span>NETWORK TRAFFIC INTERCEPTION</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-2xl">
              Monitor active egress traffic. Identify and neutralize 3 unencrypted HTTP exfiltration streams within 10 seconds before confidential data leaves the network.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowIntelManual(true)}
              className="min-h-[42px] px-3.5 py-2 rounded-xl bg-black/80 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-[#00D4FF] hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all font-mono text-xs font-bold uppercase flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 whitespace-nowrap"
            >
              <HelpCircle className="w-4 h-4 text-[#00D4FF] shrink-0" />
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

      {/* 3. Main Operational Grid: Packet Stream (Col 8) + 10s Countdown Terminal (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-full items-start">
        
        {/* Left / Main: Live Packet Stream Container */}
        <div className="lg:col-span-8 w-full max-w-full overflow-x-hidden box-border p-4 sm:p-5 rounded-2xl bg-black/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00D4FF] animate-pulse shrink-0" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                LIVE EGRESS TRAFFIC FEED
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              CLICK ROW TO NEUTRALIZE
            </span>
          </div>

          {/* Flowing Neutral Packet Cards */}
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-0.5 w-full max-w-full box-border">
            {packets.map((pkt) => {
              return (
                <div
                  key={pkt.id}
                  onClick={() => handleNeutralizeThreat(pkt)}
                  className={`w-full max-w-full box-border p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden select-none active:scale-[0.99] ${
                    pkt.isNeutralized
                      ? 'bg-cyan-950/80 border-[#00D4FF] shadow-[0_0_20px_rgba(0,212,255,0.35)]'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-600 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    {/* Neutral Protocol & Port */}
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border uppercase bg-slate-900 text-slate-300 border-slate-700/80 whitespace-nowrap">
                        {pkt.protocol} :{pkt.destPort}
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono whitespace-nowrap">
                        {pkt.sourceIp} ➔ {pkt.destIp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">
                        {pkt.timestamp}
                      </span>
                      {pkt.isNeutralized && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-900/90 border border-cyan-400 text-white flex items-center gap-1 shadow-[0_0_8px_#00D4FF] whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 text-cyan-300" />
                          <span>NEUTRALIZED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content line */}
                  <div className="font-mono text-xs break-all mt-1">
                    <span className="text-slate-400 mr-1.5 font-sans font-semibold">Payload:</span>
                    <span className={pkt.isNeutralized ? 'text-cyan-300 font-bold' : 'text-slate-200'}>
                      {pkt.contentSummary}
                    </span>
                  </div>

                  {pkt.isNeutralized && pkt.threatDetails && (
                    <div className="mt-2 p-1.5 rounded bg-black/90 border border-cyan-500/50 text-[10px] font-mono text-cyan-300 break-all">
                      🛡️ BLOCKED: {pkt.threatDetails}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-[11px] font-mono text-slate-400 text-center border-t border-slate-800/80 pt-2.5">
            🛡️ Tap or click any rogue unencrypted HTTP exfiltration stream to block it.
          </div>
        </div>

        {/* Right: 10-Second Live Countdown & Mitigation Terminal */}
        <div className="lg:col-span-4 w-full max-w-full space-y-4">
          
          {/* Live 10-Second Countdown Terminal (Clean, No Reload Button) */}
          <div className={`p-5 rounded-2xl bg-black/90 border transition-all duration-300 backdrop-blur-md relative overflow-hidden ${
            isTimeCritical 
              ? 'border-red-500 shadow-[0_0_30px_rgba(255,0,85,0.4)] animate-pulse' 
              : 'border-cyan-500/40 shadow-[0_0_20px_rgba(0,212,255,0.15)]'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Timer className={`w-5 h-5 ${isTimeCritical ? 'text-[#FF0055]' : 'text-[#00D4FF]'}`} />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  DPI EGRESS WINDOW
                </h3>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                isCompleted 
                  ? 'bg-green-950 border-green-500 text-green-300'
                  : isTimeCritical 
                    ? 'bg-red-950 border-red-500 text-red-300' 
                    : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}>
                {isCompleted ? 'CONTAINED' : isTimeCritical ? 'CRITICAL' : 'COUNTING DOWN'}
              </span>
            </div>

            {/* Big Digital Timer Display */}
            <div className="my-4 text-center">
              <div className={`text-4xl sm:text-5xl font-mono font-black tracking-tight ${
                isCompleted 
                  ? 'text-green-400' 
                  : isTimeCritical 
                    ? 'text-[#FF0055]' 
                    : 'text-[#00D4FF]'
              }`}>
                {timeLeft.toFixed(1)}s
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1 uppercase">
                {isCompleted ? 'Perimeter Secured' : `Target: 3 Rogue Streams before 0.0s`}
              </div>
            </div>

            {/* Countdown Bar */}
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mb-4">
              <div 
                className={`h-full transition-all duration-100 ${
                  isTimeCritical 
                    ? 'bg-gradient-to-r from-amber-500 to-[#FF0055] shadow-[0_0_10px_#FF0055]' 
                    : 'bg-gradient-to-r from-blue-500 to-[#00D4FF]'
                }`}
                style={{ width: `${timePercentage}%` }}
              />
            </div>

            {/* Threat Neutralized Slots */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Threats Neutralized:</span>
                <span className="font-bold text-[#00D4FF]">[{neutralizedCount} / 3]</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((idx) => {
                  const filled = neutralizedCount > idx;
                  return (
                    <div 
                      key={idx}
                      className={`h-7 rounded-lg border flex items-center justify-center font-mono text-xs font-bold transition-all ${
                        filled 
                          ? 'bg-cyan-950/90 border-[#00D4FF] text-white shadow-[0_0_10px_rgba(0,212,255,0.4)]'
                          : 'bg-slate-900/50 border-slate-800 text-slate-600'
                      }`}
                    >
                      {filled ? '✓ BLOCKED' : `SLOT ${idx + 1}`}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Protected Perimeter Details */}
          <div className="p-4 rounded-2xl bg-black/90 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-200 font-bold">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>PROTECTED PERIMETER</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Internal Subnet:</span>
                <span className="text-slate-200">10.0.1.0/24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Inspection Engine:</span>
                <span className="text-cyan-400 font-bold">Deep Packet Inspection (DPI)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Egress Policy:</span>
                <span className="text-slate-400">Block Unencrypted Leaks</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Intel Dossier Modal */}
      {showIntelManual && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-6 rounded-2xl bg-black border border-cyan-500/50 shadow-[0_0_40px_rgba(0,212,255,0.3)] space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#00D4FF]" />
                <h3 className="text-lg font-heading font-bold text-white uppercase">
                  DPI & Egress Defense Doctrine
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
                <strong className="text-white">Deep Packet Inspection (DPI):</strong> Advanced perimeter firewalls analyze the full application payload inside packets to spot unauthorized data exfiltration attempts.
              </p>
              <p>
                <strong className="text-cyan-400">Cleartext Exfiltration vs Encrypted Business Traffic:</strong>
                <br />
                • <span className="text-amber-300">Rogue HTTP (Port 80):</span> Attackers and malware frequently exfiltrate database dumps or credentials in cleartext HTTP POST requests to unverified external IPs.
                <br />
                • <span className="text-cyan-300">Encrypted TLS (Port 443):</span> Standard corporate traffic to cloud providers and authenticated APIs is encrypted and legitimate. Dropping these disrupts operations.
              </p>
              <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 font-mono text-[11px]">
                <strong>OPERATIONAL OBJECTIVE:</strong> Inspect egress packets in real time and click directly on rogue cleartext HTTP exfiltrations within 10 seconds to block data leaks before they leave the network.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowIntelManual(false)}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-cyan-600 hover:bg-[#00D4FF] text-black font-mono font-bold text-xs uppercase shadow-[0_0_15px_#00D4FF]"
              >
                Return to Sensor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
