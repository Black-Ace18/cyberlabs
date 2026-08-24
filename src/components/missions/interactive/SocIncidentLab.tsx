import React, { useState, useRef, useEffect } from 'react';
import { MissionData } from '../../../types/cyberlab';
import { Activity, ShieldAlert, CheckCircle2, Terminal as TermIcon, CornerDownLeft, ShieldCheck, Search, HardDrive, Lock, HelpCircle } from 'lucide-react';
import { sound } from '../../../utils/audio';

interface SocIncidentLabProps {
  mission: MissionData;
  onSuccess: () => void;
}

interface LogLine {
  id: string;
  type: 'CMD' | 'OUTPUT' | 'ERROR' | 'SUCCESS' | 'INFO';
  text: string;
}

type SocTab = 'TRIAGE' | 'SIEM' | 'HOST_TERMINAL' | 'FIREWALL';

export const SocIncidentLab: React.FC<SocIncidentLabProps> = ({
  mission,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<SocTab>('TRIAGE');
  const [hasTriaged, setHasTriaged] = useState(false);
  const [hasCorrelatedIp, setHasCorrelatedIp] = useState(false);
  const [hasKilledDaemon, setHasKilledDaemon] = useState(false);
  const [hasEnforcedFirewall, setHasEnforcedFirewall] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [logs, setLogs] = useState<LogLine[]>([
    { id: '1', type: 'INFO', text: '=== TIER-2 SOC INCIDENT RESPONSE WORKSTATION ===' },
    { id: '2', type: 'INFO', text: 'HIGH SEVERITY ALERT: ALT-9921 (Outbound Data Leak detected on DB-NODE-04)' },
    { id: '3', type: 'INFO', text: 'STEP 1: Triage alert ALT-9921 in the Triage Console.' }
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    sound.playKeystroke();

    const newLogs: LogLine[] = [
      ...logs,
      { id: `cmd_${Date.now()}`, type: 'CMD', text: `soc-analyst@workstation[${activeTab}]:~$ ${cmd}` }
    ];

    const lower = cmd.toLowerCase();

    if (lower === 'help') {
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `SOC Analyst Workflow Guide:\n  1. Triage Alert      - soc-triage --alert ALT-9921\n  2. Correlate Logs    - grep "Accepted" /var/log/auth.log (Finds C2 IP 198.51.100.200)\n  3. Terminate Daemon  - ps aux | grep exfil  ->  kill -9 8812\n  4. Firewall Block    - iptables -A OUTPUT -d 198.51.100.200 -j DROP\n  clear                - Clear terminal display`
      });
    } else if (lower === 'clear') {
      setLogs([]);
      setInputVal('');
      return;
    } else if (lower.includes('triage') || lower.includes('alt-9921')) {
      // Step 1: Alert Triage
      sound.playShield();
      setHasTriaged(true);
      setActiveTab('SIEM');
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `[+] Alert ALT-9921 Triaged:\n    Target Host: DB-NODE-04 (IP: 10.0.4.12)\n    Protocol: TCP Stream Outbound Exfiltration\n    Status: Active breach\n\n[>] STEP 1 COMPLETE! Switched to SIEM tab.\n[>] STEP 2: Correlate auth logs with "grep \"Accepted\" /var/log/auth.log" to discover the external C2 IP.`
      });
    } else if (lower.includes('grep') && (lower.includes('accepted') || lower.includes('auth.log'))) {
      // Step 2: Correlate
      if (!hasTriaged) {
        newLogs.push({ id: `err_${Date.now()}`, type: 'ERROR', text: 'Triage alert ALT-9921 in the Triage Console first.' });
      } else {
        sound.playAlert();
        setHasCorrelatedIp(true);
        setActiveTab('HOST_TERMINAL');
        newLogs.push({
          id: `out_${Date.now()}`,
          type: 'OUTPUT',
          text: `Aug 20 04:12:01 db-node-04 sshd[8790]: Accepted publickey for backup_service from 198.51.100.200 port 54192 ssh2\n\n[!] CRITICAL C2 IP IDENTIFIED: 198.51.100.200\n[>] STEP 2 COMPLETE! Connected to DB-NODE-04 host terminal.\n[>] STEP 3: Find rogue process with "ps aux | grep exfil" and kill it with "kill -9 8812".`
        });
      }
    } else if (lower.includes('ps') && lower.includes('exfil')) {
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `backup_s+  8812 89.2  4.1  109280 42100 ?  Ssl  04:13  2:41 /tmp/.exfil_daemon --dest 198.51.100.200\n[!] Rogue exfiltration daemon running under PID 8812! Execute "kill -9 8812".`
      });
    } else if (lower.includes('kill') && lower.includes('8812')) {
      // Step 3: Kill
      if (!hasCorrelatedIp) {
        newLogs.push({ id: `err_${Date.now()}`, type: 'ERROR', text: 'Identify the attacker session and PID first.' });
      } else {
        sound.playShield();
        setHasKilledDaemon(true);
        setActiveTab('FIREWALL');
        newLogs.push({
          id: `out_${Date.now()}`,
          type: 'OUTPUT',
          text: `[+] SIGKILL sent to PID 8812.\n[+] Process /tmp/.exfil_daemon terminated.\n\n[>] STEP 3 COMPLETE! Rogue daemon eliminated on DB-NODE-04.\n[>] FINAL STEP 4: Blacklist C2 IP on perimeter firewall using "iptables -A OUTPUT -d 198.51.100.200 -j DROP".`
        });
      }
    } else if (lower.includes('iptables') && lower.includes('198.51.100.200') && lower.includes('drop')) {
      // Step 4: Firewall Block
      if (!hasKilledDaemon) {
        newLogs.push({ id: `err_${Date.now()}`, type: 'ERROR', text: 'Kill the running exfiltration daemon (PID 8812) before applying perimeter lock.' });
      } else {
        sound.playSuccess();
        setHasEnforcedFirewall(true);
        setIsCompleted(true);
        newLogs.push({
          id: `out_${Date.now()}`,
          type: 'OUTPUT',
          text: `[+] Firewall Drop Rule applied: OUTPUT -d 198.51.100.200 -j DROP\n[+] Ingress/Egress completely blocked. Threat infrastructure quarantined.\n==================================================\n>>> SOC INCIDENT CASE ALT-9921 100% RESOLVED! <<<\nFLAG: SOC_MASTER{TIER2_INCIDENT_REMEDIATION_COMPLETE}`
        });
        newLogs.push({
          id: `succ_${Date.now()}`,
          type: 'SUCCESS',
          text: `>>> CONGRATULATIONS: BLUE PILL TRACK 100% MASTERED! <<<`
        });
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } else {
      newLogs.push({
        id: `err_${Date.now()}`,
        type: 'ERROR',
        text: `bash: ${cmd}: command unrecognized in SOC context. Type "help" for step guidance.`
      });
    }

    setLogs(newLogs);
    setInputVal('');
  };

  const handleQuickRun = (cmd: string) => {
    handleCommand(cmd);
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 text-left space-y-4 font-sans">
      {/* Objective Banner */}
      <div className="p-3.5 rounded-xl border border-green-500/40 bg-black/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-pulse" />
          <span className="text-[#00E5FF] font-bold uppercase">SOC OPERATIONS:</span>
          <span className="text-slate-300">Case ALT-9921 (Data Exfiltration on DB-NODE-04)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="min-h-[32px] px-2.5 py-1 rounded bg-black/80 border border-green-500/30 text-green-400 hover:text-white hover:border-green-400 text-[11px] flex items-center gap-1.5 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>{showGuide ? 'Hide SOP' : 'SOC Playbook'}</span>
          </button>
          {isCompleted && (
            <span className="text-[#00FF66] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> CASE RESOLVED
            </span>
          )}
        </div>
      </div>

      {/* 4-Step SOC Workflow & IOC Tracker Board */}
      <div className="p-4 sm:p-5 rounded-xl border border-green-500/30 bg-black/80 backdrop-blur-md space-y-3.5 font-mono text-xs shadow-[0_0_30px_rgba(0,255,102,0.05)]">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-green-500/20 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('TRIAGE')}
            className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              activeTab === 'TRIAGE'
                ? 'bg-[#00FF66] text-black border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                : 'bg-black text-slate-400 border-green-500/20 hover:text-white hover:border-green-500/40'
            }`}
          >
            1. Alert Triage {hasTriaged && '✓'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SIEM')}
            className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              activeTab === 'SIEM'
                ? 'bg-[#00FF66] text-black border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                : 'bg-black text-slate-400 border-green-500/20 hover:text-white hover:border-green-500/40'
            }`}
          >
            2. SIEM Log Correlation {hasCorrelatedIp && '✓'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HOST_TERMINAL')}
            className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              activeTab === 'HOST_TERMINAL'
                ? 'bg-[#00FF66] text-black border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                : 'bg-black text-slate-400 border-green-500/20 hover:text-white hover:border-green-500/40'
            }`}
          >
            3. Endpoint Host Shell {hasKilledDaemon && '✓'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('FIREWALL')}
            className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              activeTab === 'FIREWALL'
                ? 'bg-[#00FF66] text-black border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                : 'bg-black text-slate-400 border-green-500/20 hover:text-white hover:border-green-500/40'
            }`}
          >
            4. Perimeter Firewall {hasEnforcedFirewall && '✓'}
          </button>
        </div>

        {/* Live IOC Board */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
          <div className="p-2.5 rounded-lg bg-black border border-green-500/20">
            <span className="text-green-400/70 block text-[10px]">Target Host:</span>
            <strong className="text-white">{hasTriaged ? 'DB-NODE-04 (10.0.4.12)' : 'Pending Triage'}</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-black border border-green-500/20">
            <span className="text-green-400/70 block text-[10px]">Attacker C2 IP:</span>
            <strong className={hasCorrelatedIp ? 'text-[#FF3366] font-bold' : 'text-slate-500'}>
              {hasCorrelatedIp ? '198.51.100.200' : 'Uncorrelated'}
            </strong>
          </div>
          <div className="p-2.5 rounded-lg bg-black border border-green-500/20">
            <span className="text-green-400/70 block text-[10px]">Malicious Process:</span>
            <strong className={hasKilledDaemon ? 'text-[#00FF66]' : 'text-slate-500'}>
              {hasKilledDaemon ? 'PID 8812 (KILLED)' : 'PID 8812 (Active)'}
            </strong>
          </div>
          <div className="p-2.5 rounded-lg bg-black border border-green-500/20">
            <span className="text-green-400/70 block text-[10px]">Firewall Rule:</span>
            <strong className={hasEnforcedFirewall ? 'text-[#00FF66]' : 'text-slate-500'}>
              {hasEnforcedFirewall ? 'DROP 198.51.100.200' : 'Open'}
            </strong>
          </div>
        </div>

        {/* Status note */}
        <div className="flex items-center justify-between pt-2 border-t border-green-500/20 text-[11px] text-slate-400">
          <span>Active Investigation Context: <strong className="text-white">DB-NODE-04</strong></span>
          <span>Execute investigation queries in console below</span>
        </div>
      </div>

      {/* Guide */}
      {showGuide && (
        <div className="p-4 sm:p-5 rounded-xl bg-black/90 border border-green-500/30 text-xs font-mono text-slate-300 space-y-3 animate-in fade-in duration-150">
          <div className="font-bold text-[#00FF66] uppercase">SOC Analyst Standard Operating Procedure (SOP):</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Investigate and mitigate the incident in order: triage alert telemetry → correlate authentication logs to discover C2 IP → terminate malicious endpoint daemon → block the attacker IP at the firewall gateway.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-black border border-green-500/20 space-y-1">
              <strong className="text-[#00FF66] block">1. SIEM Triage:</strong>
              <code className="text-[#00E5FF] text-[10px] block">soc-triage --alert ALT-9921</code>
              <span className="text-slate-400 text-[10px]">Triages alert and displays affected server hostname.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black border border-green-500/20 space-y-1">
              <strong className="text-[#00FF66] block">2. Auth Correlation:</strong>
              <code className="text-[#00E5FF] text-[10px] block">grep "Accepted" /var/log/auth.log</code>
              <span className="text-slate-400 text-[10px]">Finds external IP used for unauthorized access.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black border border-green-500/20 space-y-1">
              <strong className="text-[#00FF66] block">3. Endpoint Process Hunt:</strong>
              <code className="text-[#00E5FF] text-[10px] block">ps aux | grep exfil</code>
              <code className="text-[#FF3366] text-[10px] block">kill -9 8812</code>
              <span className="text-slate-400 text-[10px]">Identifies and terminates exfiltration daemon.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black border border-green-500/20 space-y-1">
              <strong className="text-[#00FF66] block">4. Firewall Enforcement:</strong>
              <code className="text-[#00FF66] text-[10px] block">iptables -A OUTPUT -d 198.51.100.200 -j DROP</code>
              <span className="text-slate-400 text-[10px]">Blocks outbound connection to attacker IP.</span>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Window */}
      <div className="rounded-xl border border-green-500/30 bg-black/90 shadow-[0_0_35px_rgba(0,255,102,0.08)] overflow-hidden font-mono text-xs backdrop-blur-md">
        <div className="px-4 py-2.5 bg-black/95 border-b border-green-500/20 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] inline-block" />
            <span className="text-white font-bold">soc-analyst@workstation — [{activeTab}]</span>
          </div>
          <span className="text-[10px] text-green-400/60">SOC TIER-2 SHELL</span>
        </div>

        <div 
          onClick={() => inputRef.current?.focus()}
          className="p-4 min-h-[200px] max-h-[300px] overflow-y-auto space-y-1.5 cursor-text"
        >
          {logs.map((log) => {
            if (log.type === 'CMD') {
              return <div key={log.id} className="text-white font-bold">{log.text}</div>;
            }
            if (log.type === 'ERROR') {
              return <div key={log.id} className="text-[#FF3366] whitespace-pre-wrap">{log.text}</div>;
            }
            if (log.type === 'SUCCESS') {
              return <div key={log.id} className="text-[#00FF66] font-bold bg-green-950/40 p-2.5 rounded border border-green-500/50 whitespace-pre-wrap shadow-[0_0_15px_rgba(0,255,102,0.2)]">{log.text}</div>;
            }
            if (log.type === 'INFO') {
              return <div key={log.id} className="text-green-400/80">{log.text}</div>;
            }
            return <pre key={log.id} className="text-[#00E5FF] whitespace-pre-wrap">{log.text}</pre>;
          })}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommand(inputVal);
          }}
          className="px-3 sm:px-4 py-2.5 sm:py-3 bg-black/95 border-t border-green-500/20 flex items-center gap-1.5 sm:gap-2"
        >
          <span className="text-[#00E5FF] font-bold text-xs shrink-0 hidden sm:inline">soc-analyst:~$</span>
          <span className="text-[#00E5FF] font-bold text-xs shrink-0 sm:hidden">analyst:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type command (e.g. soc-triage, grep Accepted auth.log, ps aux | grep exfil)..."
            className="flex-1 min-w-0 bg-transparent text-[#00FF66] font-mono text-xs focus:outline-none placeholder:text-slate-600"
            autoFocus
          />
          <button type="submit" className="min-h-[34px] min-w-[34px] sm:min-h-[36px] sm:min-w-[36px] p-1.5 rounded bg-black border border-green-500/30 hover:border-green-400 text-green-400 hover:text-white transition-colors flex items-center justify-center shrink-0" aria-label="Execute command">
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
