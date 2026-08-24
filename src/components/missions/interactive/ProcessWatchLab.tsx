import React, { useState, useRef, useEffect } from 'react';
import { MissionData, ProcessItem } from '../../../types/cyberlab';
import { Activity, ShieldAlert, CheckCircle2, Terminal as TermIcon, CornerDownLeft, Cpu, AlertTriangle, Eye, HelpCircle } from 'lucide-react';
import { sound } from '../../../utils/audio';

interface ProcessWatchLabProps {
  mission: MissionData;
  onSuccess: () => void;
}

interface LogLine {
  id: string;
  type: 'CMD' | 'OUTPUT' | 'ERROR' | 'SUCCESS' | 'INFO';
  text: string;
}

export const ProcessWatchLab: React.FC<ProcessWatchLabProps> = ({
  mission,
  onSuccess
}) => {
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [isKilled, setIsKilled] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [processes, setProcesses] = useState<ProcessItem[]>([
    { pid: 1, name: 'systemd', user: 'root', cpu: '0.1%', mem: '0.4%', path: '/sbin/init', parentPid: 0, isSuspicious: false, notes: 'System initialization manager.' },
    { pid: 412, name: 'sshd', user: 'root', cpu: '0.0%', mem: '0.2%', path: '/usr/sbin/sshd', parentPid: 1, isSuspicious: false, notes: 'Secure Shell daemon.' },
    { pid: 890, name: 'nginx', user: 'www-data', cpu: '1.2%', mem: '1.1%', path: '/usr/sbin/nginx', parentPid: 1, isSuspicious: false, notes: 'Production reverse proxy.' },
    { pid: 4821, name: 'kworker_crypto', user: 'www-data', cpu: '94.8%', mem: '14.2%', path: '/tmp/.kworker_crypto', parentPid: 890, isSuspicious: true, notes: 'CRITICAL ANOMALY: Masquerading kernel name but running from /tmp/ by www-data user!' },
    { pid: 5120, name: 'cron', user: 'root', cpu: '0.0%', mem: '0.1%', path: '/usr/sbin/cron', parentPid: 1, isSuspicious: false, notes: 'Periodic job scheduler.' }
  ]);

  const [logs, setLogs] = useState<LogLine[]>([
    { id: '1', type: 'INFO', text: '=== CYBER LAB HOST ENDPOINT FORENSICS WORKSTATION ===' },
    { id: '2', type: 'INFO', text: 'Host: SVR-PROD-01 | CPU Load: 98.4% (CRITICAL SPIKE DETECTED)' },
    { id: '3', type: 'INFO', text: 'Objective: Analyze running processes with "ps aux", find rogue miner PID, and terminate it using "kill -9 <PID>".' },
    { id: '4', type: 'INFO', text: 'Type "help" for forensic command list.' }
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
      { id: `cmd_${Date.now()}`, type: 'CMD', text: `analyst@svr-prod-01:~$ ${cmd}` }
    ];

    const parts = cmd.split(' ').filter(Boolean);
    const mainCmd = parts[0].toLowerCase();
    const arg = parts[1];

    if (mainCmd === 'help') {
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `Endpoint Forensics Commands:\n  ps aux                     - List all running processes and resource usage\n  top                        - Live interactive process manager\n  lsof -p <PID>              - List open files and network sockets for PID\n  kill -9 <PID>              - Force terminate a specific process ID\n  file <path>                - Inspect file header information\n  clear                      - Clear terminal display`
      });
    } else if (mainCmd === 'clear') {
      setLogs([]);
      setInputVal('');
      return;
    } else if (mainCmd === 'ps' || mainCmd === 'top') {
      sound.playClick();
      const output = processes.map(p => 
        `${p.user.padEnd(9)} ${String(p.pid).padEnd(6)} ${p.cpu.padEnd(6)} ${p.mem.padEnd(6)} ${p.path}`
      ).join('\n');

      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `USER      PID    %CPU   %MEM   COMMAND\n${output}`
      });

      if (!isKilled) {
        newLogs.push({
          id: `info_${Date.now()}`,
          type: 'INFO',
          text: '[!] Forensic Notice: PID 4821 is consuming 94.8% CPU from suspicious path "/tmp/.kworker_crypto".'
        });
      }
    } else if (mainCmd === 'lsof') {
      if (arg === '4821' || cmd.includes('4821')) {
        sound.playAlert();
        newLogs.push({
          id: `out_${Date.now()}`,
          type: 'OUTPUT',
          text: `COMMAND    PID     USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\nkworker   4821 www-data  cwd    DIR    8,1     4096  102 /tmp\nkworker   4821 www-data    3u  IPv4  89102      0t0  TCP 10.0.1.5:49182->198.51.100.99:3333 (ESTABLISHED)\n[!] Suspicious active socket connected to external cryptomining pool!`
        });
      } else {
        newLogs.push({ id: `out_${Date.now()}`, type: 'OUTPUT', text: `lsof: Specify target PID, e.g. "lsof -p 4821"` });
      }
    } else if (mainCmd === 'kill') {
      const pidToKill = parts.find(p => !p.startsWith('-') && p !== 'kill');
      if (pidToKill === '4821' || arg === '4821') {
        sound.playSuccess();
        setIsKilled(true);
        setProcesses(prev => prev.filter(p => p.pid !== 4821));
        newLogs.push({
          id: `out_${Date.now()}`,
          type: 'OUTPUT',
          text: `[+] SIGKILL signal dispatched to PID 4821.\n[+] Process terminated.\n[+] Host CPU usage dropped from 98.4% -> 2.1% (NOMINAL).`
        });
        newLogs.push({
          id: `succ_${Date.now()}`,
          type: 'SUCCESS',
          text: `==================================================\n>>> OBJECTIVE COMPLETE: ROGUE CRYPTOMINER NEUTRALIZED! <<<\nFLAG: DEF_FLAG{ROGUE_PROCESS_PID_4821_TERMINATED}`
        });
        setTimeout(() => {
          onSuccess();
        }, 1400);
      } else if (pidToKill === '1' || pidToKill === '412' || pidToKill === '890' || pidToKill === '5120') {
        sound.playAlert();
        newLogs.push({
          id: `err_${Date.now()}`,
          type: 'ERROR',
          text: `[CRITICAL WARNING] You attempted to kill critical system daemon PID ${pidToKill}! This will crash the production server. Target the malicious process in /tmp/.`
        });
      } else {
        newLogs.push({
          id: `err_${Date.now()}`,
          type: 'ERROR',
          text: `kill: (${arg || ''}) - No such process. Usage: kill -9 <PID>`
        });
      }
    } else {
      newLogs.push({
        id: `err_${Date.now()}`,
        type: 'ERROR',
        text: `bash: ${cmd}: command not found. Type "help" or "ps aux".`
      });
    }

    setLogs(newLogs);
    setInputVal('');
  };

  const handleSelectProcess = (p: ProcessItem) => {
    sound.playClick();
    setSelectedPid(p.pid);
    handleCommand(`lsof -p ${p.pid}`);
  };

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
            <span>{showGuide ? 'Hide SOP' : 'Process Guide'}</span>
          </button>
          {isKilled && (
            <span className="text-[#00FF66] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> THREAT ELIMINATED
            </span>
          )}
        </div>
      </div>

      {/* Host Metrics & Process Table */}
      <div className="p-4 sm:p-5 rounded-xl border border-green-500/30 bg-black/80 backdrop-blur-md space-y-4 font-mono text-xs shadow-[0_0_30px_rgba(0,255,102,0.05)]">
        {/* Host CPU & Memory Gauge */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-green-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#00FF66]" />
            <span className="font-bold text-white uppercase">Endpoint Telemetry: SVR-PROD-01</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Total CPU:</span>
            <span className={`px-2.5 py-0.5 rounded font-bold ${
              isKilled ? 'bg-green-950/80 text-[#00FF66] border border-green-500/50' : 'bg-red-950/80 text-[#FF3366] border border-red-500/50 animate-pulse'
            }`}>
              {isKilled ? '2.1% (Nominal)' : '98.4% (CRITICAL)'}
            </span>
          </div>
        </div>

        {/* Process List Table */}
        <div className="overflow-x-auto border border-green-500/30 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/90 text-green-400 border-b border-green-500/20 text-[11px]">
              <tr>
                <th className="p-2.5">PID</th>
                <th className="p-2.5">USER</th>
                <th className="p-2.5">CPU%</th>
                <th className="p-2.5">MEM%</th>
                <th className="p-2.5">PATH</th>
                <th className="p-2.5">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-500/10 bg-black/70">
              {processes.map(p => (
                <tr 
                  key={p.pid} 
                  className="text-slate-300 hover:bg-slate-900/60 transition-colors"
                >
                  <td className="p-2.5 font-bold text-white">{p.pid}</td>
                  <td className="p-2.5">{p.user}</td>
                  <td className={`p-2.5 font-bold ${parseFloat(p.cpu) > 50 ? 'text-[#FF3366]' : 'text-[#00FF66]'}`}>{p.cpu}</td>
                  <td className="p-2.5">{p.mem}</td>
                  <td className="p-2.5 font-mono text-[11px]">{p.path}</td>
                  <td className="p-2.5">
                    <button
                      type="button"
                      onClick={() => handleSelectProcess(p)}
                      className="min-h-[28px] px-2.5 py-0.5 rounded bg-black border border-green-500/30 hover:border-green-400 text-green-300 hover:text-white text-[11px] transition-all"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide */}
      {showGuide && (
        <div className="p-4 rounded-xl bg-black/90 border border-green-500/30 text-xs font-mono text-slate-300 space-y-2 animate-in fade-in duration-150">
          <div className="font-bold text-[#00FF66] uppercase">Host Endpoint Forensics Guide:</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            1. Run <code className="text-[#00FF66]">ps aux</code> or inspect the table to discover unusual CPU usage, anomalous binary paths (such as <code className="text-amber-300">/tmp/</code>), or mismatched usernames.<br/>
            2. Run <code className="text-[#00E5FF]">lsof -p &lt;PID&gt;</code> to trace open network sockets.<br/>
            3. Run <code className="text-[#FF3366]">kill -9 &lt;PID&gt;</code> to terminate the rogue process.
          </p>
        </div>
      )}

      {/* Forensic Terminal */}
      <div className="rounded-xl border border-green-500/30 bg-black/90 shadow-[0_0_35px_rgba(0,255,102,0.08)] overflow-hidden font-mono text-xs backdrop-blur-md">
        <div className="px-4 py-2.5 bg-black/95 border-b border-green-500/20 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] inline-block" />
            <span className="text-white font-bold">analyst@svr-prod-01:~$</span>
          </div>
          <span className="text-[10px] text-green-400/60">ENDPOINT INVESTIGATION SHELL</span>
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
          <span className="text-[#00E5FF] font-bold text-xs shrink-0 hidden sm:inline">analyst@svr-prod-01:~$</span>
          <span className="text-[#00E5FF] font-bold text-xs shrink-0 sm:hidden">analyst:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type command (e.g. ps aux, lsof -p <PID>, kill -9 <PID>)..."
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
