import React, { useState, useRef, useEffect } from 'react';
import { MissionData } from '../../../types/cyberlab';
import { Search, ShieldAlert, CheckCircle2, Terminal as TermIcon, CornerDownLeft, FileText, AlertTriangle, Filter, Check, HelpCircle } from 'lucide-react';
import { sound } from '../../../utils/audio';

interface LogHuntLabProps {
  mission: MissionData;
  onSuccess: () => void;
}

interface LogLine {
  id: string;
  type: 'CMD' | 'OUTPUT' | 'ERROR' | 'SUCCESS' | 'INFO';
  text: string;
}

const RAW_AUTH_LOGS = [
  "Aug 20 03:14:01 auth-01 sshd[1020]: Failed password for invalid user root from 198.51.100.22 port 48210 ssh2",
  "Aug 20 03:14:02 auth-01 sshd[1022]: Failed password for invalid user admin from 198.51.100.22 port 48212 ssh2",
  "Aug 20 03:14:04 auth-01 sshd[1025]: Failed password for invalid user test from 198.51.100.22 port 48214 ssh2",
  "Aug 20 03:14:05 auth-01 sshd[1028]: Failed password for invalid user oracle from 198.51.100.22 port 48216 ssh2",
  "Aug 20 03:14:07 auth-01 sshd[1030]: Failed password for invalid user deploy from 198.51.100.22 port 48218 ssh2",
  "Aug 20 03:14:09 auth-01 sshd[1033]: Failed password for invalid user support from 198.51.100.22 port 48220 ssh2",
  "Aug 20 03:14:11 auth-01 CRON[1035]: pam_unix(cron:session): session opened for user root by (uid=0)",
  "Aug 20 03:14:12 auth-01 sshd[1038]: Failed password for invalid user ubuntu from 198.51.100.22 port 48222 ssh2",
  "Aug 20 03:14:14 auth-01 sshd[1041]: Failed password for invalid user dev from 198.51.100.22 port 48224 ssh2",
  "Aug 20 03:14:16 auth-01 sshd[1044]: Accepted password for sysadmin from 198.51.100.22 port 48226 ssh2",
  "Aug 20 03:14:17 auth-01 sshd[1044]: pam_unix(sshd:session): session opened for user sysadmin by (uid=0)",
  "Aug 20 03:14:20 auth-01 sudo: sysadmin : TTY=pts/0 ; PWD=/home/sysadmin ; USER=root ; COMMAND=/bin/bash"
];

export const LogHuntLab: React.FC<LogHuntLabProps> = ({
  mission,
  onSuccess
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'FAILED' | 'ACCEPTED'>('ALL');
  const [attackerIpInput, setAttackerIpInput] = useState('');
  const [attackTypeInput, setAttackTypeInput] = useState('BRUTE_FORCE');
  const [compromisedUserInput, setCompromisedUserInput] = useState('');
  
  const [inputVal, setInputVal] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [logs, setLogs] = useState<LogLine[]>([
    { id: '1', type: 'INFO', text: '=== CYBER LAB SIEM LOG INVESTIGATION SHELL ===' },
    { id: '2', type: 'INFO', text: 'Log Source: /var/log/auth.log | Service: OpenSSH Authentication' },
    { id: '3', type: 'INFO', text: 'Objective: Correlate failed & accepted logins using "grep", find the attacker IP and compromised account, then submit the IOC Report.' }
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
      { id: `cmd_${Date.now()}`, type: 'CMD', text: `siem-analyst@soc-workstation:~$ ${cmd}` }
    ];

    const lower = cmd.toLowerCase();

    if (lower === 'help') {
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `Log Forensics Shell Commands:\n  grep "Failed" /var/log/auth.log      - Filter all failed SSH login attempts\n  grep "Accepted" /var/log/auth.log    - Filter successful logins\n  grep 198.51.100.22 auth.log          - Track activity from specific IP\n  cat /var/log/auth.log                - Dump entire auth log file\n  clear                                - Clear screen buffer`
      });
    } else if (lower === 'clear') {
      setLogs([]);
      setInputVal('');
      return;
    } else if (lower.includes('grep') && lower.includes('failed')) {
      sound.playClick();
      const failedLines = RAW_AUTH_LOGS.filter(l => l.includes('Failed'));
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: failedLines.join('\n') + `\n\n[*] Found ${failedLines.length} failed attempts from IP: 198.51.100.22 targeting dictionary usernames!`
      });
    } else if (lower.includes('grep') && lower.includes('accepted')) {
      sound.playClick();
      const acceptedLines = RAW_AUTH_LOGS.filter(l => l.includes('Accepted') || l.includes('session opened'));
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: acceptedLines.join('\n') + `\n\n[!] CRITICAL IOC: IP 198.51.100.22 succeeded with user "sysadmin" at 03:14:16!`
      });
    } else if (lower.includes('grep') && lower.includes('198.51.100.22')) {
      sound.playClick();
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: RAW_AUTH_LOGS.filter(l => l.includes('198.51.100.22')).join('\n')
      });
    } else if (lower.includes('cat') && lower.includes('auth.log')) {
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: RAW_AUTH_LOGS.join('\n')
      });
    } else {
      newLogs.push({
        id: `err_${Date.now()}`,
        type: 'ERROR',
        text: `bash: ${cmd}: command unrecognized. Try "grep \"Failed\" /var/log/auth.log" or "help".`
      });
    }

    setLogs(newLogs);
    setInputVal('');
  };

  const handleSubmitIocReport = (e: React.FormEvent) => {
    e.preventDefault();

    const ipMatch = attackerIpInput.trim() === '198.51.100.22';
    const userMatch = compromisedUserInput.trim().toLowerCase() === 'sysadmin';

    if (ipMatch && userMatch) {
      sound.playSuccess();
      setIsCompleted(true);
      setLogs(prev => [
        ...prev,
        '',
        '>>> [IOC VALIDATION SUCCEEDED] Incident Report Verified & Closed!',
        '[+] Attacker IP: 198.51.100.22 (Blacklisted on Perimeter Firewall)',
        '[+] Threat Type: SSH Brute Force / Credential Stuffing',
        '[+] Compromised User: sysadmin (Credentials Revoked & Session Terminated)',
        '==================================================',
        '>>> OBJECTIVE COMPLETE: LOG HUNT FORENSICS RESOLVED! <<<'
      ]);
      setTimeout(() => {
        onSuccess();
      }, 1400);
    } else {
      sound.playAlert();
      setLogs(prev => [
        ...prev,
        '',
        `[!] IOC VERIFICATION REJECTED:`,
        `    Attacker IP: ${attackerIpInput || '(empty)'} -> ${ipMatch ? 'VALID' : 'INVALID (Check auth logs)'}`,
        `    Compromised User: ${compromisedUserInput || '(empty)'} -> ${userMatch ? 'VALID' : 'INVALID (Check Accepted logs)'}`
      ]);
    }
  };

  const filteredLogs = RAW_AUTH_LOGS.filter(line => {
    if (filterMode === 'FAILED') return line.includes('Failed');
    if (filterMode === 'ACCEPTED') return line.includes('Accepted') || line.includes('session opened');
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 text-left space-y-4 font-sans">
      {/* Objective Banner */}
      <div className="p-3.5 rounded-xl border border-green-500/40 bg-black/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-pulse" />
          <span className="text-[#00E5FF] font-bold uppercase">ANALYST OBJECTIVE:</span>
          <span className="text-slate-300">{mission.shortObjective}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="min-h-[32px] px-2.5 py-1 rounded bg-black/80 border border-green-500/30 text-green-400 hover:text-white hover:border-green-400 text-[11px] flex items-center gap-1.5 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>{showGuide ? 'Hide SOP' : 'SIEM Guide'}</span>
          </button>
          {isCompleted && (
            <span className="text-[#00FF66] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> IOC REPORT VERIFIED
            </span>
          )}
        </div>
      </div>

      {/* Main Workspace: Left Log Stream & Right IOC Report Submission */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs">
        {/* Left: Raw Log Stream with Quick Filter Chips */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-xl border border-green-500/30 bg-black/80 backdrop-blur-md space-y-3.5 shadow-[0_0_30px_rgba(0,255,102,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-green-500/20 pb-3">
            <div className="flex items-center gap-2 font-bold text-white uppercase">
              <FileText className="w-4 h-4 text-[#00FF66]" />
              <span>/var/log/auth.log Stream</span>
            </div>
            <div className="flex gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => setFilterMode('ALL')}
                className={`min-h-[28px] px-2.5 py-0.5 rounded-lg border transition-all ${filterMode === 'ALL' ? 'bg-[#00FF66] text-black font-bold border-[#00FF66]' : 'bg-black text-slate-400 border-slate-800'}`}
              >
                ALL
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('FAILED')}
                className={`min-h-[28px] px-2.5 py-0.5 rounded-lg border transition-all ${filterMode === 'FAILED' ? 'bg-red-950 text-[#FF3366] border-red-500 font-bold shadow-[0_0_10px_rgba(255,51,102,0.3)]' : 'bg-black text-slate-400 border-slate-800'}`}
              >
                FAILED
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('ACCEPTED')}
                className={`min-h-[28px] px-2.5 py-0.5 rounded-lg border transition-all ${filterMode === 'ACCEPTED' ? 'bg-green-950 text-[#00FF66] border-green-500 font-bold shadow-[0_0_10px_rgba(0,255,102,0.3)]' : 'bg-black text-slate-400 border-slate-800'}`}
              >
                ACCEPTED
              </button>
            </div>
          </div>

          {/* Log Window */}
          <div className="p-3 rounded-lg bg-black border border-green-500/20 h-[220px] overflow-y-auto space-y-1 text-[11px] font-mono">
            {filteredLogs.map((line, idx) => (
              <div 
                key={idx}
                className={`p-1.5 rounded transition-colors ${
                  line.includes('Accepted')
                    ? 'bg-green-950/70 text-[#00FF66] border border-green-500/50 shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                    : line.includes('Failed')
                      ? 'text-[#FF3366] hover:bg-red-950/30'
                      : 'text-slate-400'
                }`}
              >
                {line}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-green-500/20 text-[11px] text-slate-400">
            <span>Log file: /var/log/auth.log</span>
            <span>Use terminal grep or filters above</span>
          </div>
        </div>

        {/* Right: IOC Incident Report Submission Form */}
        <div className="lg:col-span-5 p-4 sm:p-5 rounded-xl border border-green-500/30 bg-black/80 backdrop-blur-md space-y-3.5 flex flex-col justify-between shadow-[0_0_30px_rgba(0,255,102,0.05)]">
          <div>
            <div className="flex items-center gap-2 border-b border-green-500/20 pb-3 text-xs font-bold text-white uppercase">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Incident Response IOC Report</span>
            </div>

            <form onSubmit={handleSubmitIocReport} className="mt-3.5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Attacker IP Address:</label>
                <input
                  type="text"
                  value={attackerIpInput}
                  onChange={(e) => setAttackerIpInput(e.target.value)}
                  placeholder="Find target IP and enter here"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-green-500/30 focus:border-[#00FF66] text-[#00FF66] font-mono text-xs focus:outline-none placeholder:text-slate-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Attack Classification:</label>
                <select
                  value={attackTypeInput}
                  onChange={(e) => setAttackTypeInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black border border-green-500/30 focus:border-[#00FF66] text-[#00FF66] font-mono text-xs focus:outline-none transition-colors"
                >
                  <option value="BRUTE_FORCE">SSH Brute Force / Password Spray</option>
                  <option value="SQLI">SQL Injection</option>
                  <option value="DDOS">Distributed Denial of Service</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Compromised User Account:</label>
                <input
                  type="text"
                  value={compromisedUserInput}
                  onChange={(e) => setCompromisedUserInput(e.target.value)}
                  placeholder="Find target username and enter here"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-green-500/30 focus:border-[#00FF66] text-[#00FF66] font-mono text-xs focus:outline-none placeholder:text-slate-600 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[42px] mt-2 py-2.5 rounded-lg bg-[#00FF66] hover:bg-[#00e059] text-black font-mono font-bold text-xs uppercase shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Submit Forensic Report</span>
              </button>
            </form>
          </div>

          <div className="text-[10px] text-slate-400 border-t border-green-500/20 pt-2.5">
            Tip: Inspect both "Failed" patterns and the eventual "Accepted" login to identify which user was compromised.
          </div>
        </div>
      </div>

      {/* Guide */}
      {showGuide && (
        <div className="p-4 rounded-xl bg-black/90 border border-green-500/30 text-xs font-mono text-slate-300 space-y-2 animate-in fade-in duration-150">
          <div className="font-bold text-[#00FF66] uppercase">SIEM Forensics & Correlation Guide:</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            A brute force attack displays repeated failed attempts from a single source IP targeting multiple usernames, followed by an accepted authentication event for a legitimate account.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded bg-black border border-green-500/20">
              <strong className="text-white block mb-1">Filter Failed Logins:</strong>
              <code className="text-[#00FF66] text-[10px] block">grep "Failed" /var/log/auth.log</code>
            </div>
            <div className="p-2.5 rounded bg-black border border-green-500/20">
              <strong className="text-white block mb-1">Filter Accepted Logins:</strong>
              <code className="text-[#00FF66] text-[10px] block">grep "Accepted" /var/log/auth.log</code>
            </div>
          </div>
        </div>
      )}

      {/* Shell Terminal Output */}
      <div className="rounded-xl border border-green-500/30 bg-black/90 shadow-[0_0_35px_rgba(0,255,102,0.08)] overflow-hidden font-mono text-xs backdrop-blur-md">
        <div className="px-4 py-2.5 bg-black/95 border-b border-green-500/20 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] inline-block" />
            <span className="text-white font-bold">siem-analyst@soc-workstation</span>
          </div>
          <span className="text-[10px] text-green-400/60">LOG ANALYSIS SHELL</span>
        </div>

        <div 
          onClick={() => inputRef.current?.focus()}
          className="p-4 min-h-[160px] max-h-[240px] overflow-y-auto space-y-1.5 cursor-text"
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
          <span className="text-[#00E5FF] font-bold text-xs shrink-0 hidden sm:inline">siem-analyst:~$</span>
          <span className="text-[#00E5FF] font-bold text-xs shrink-0 sm:hidden">siem:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type command (e.g. grep Failed /var/log/auth.log)..."
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
