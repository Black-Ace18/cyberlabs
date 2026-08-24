import React, { useState, useRef, useEffect } from 'react';
import { MissionData } from '../../../types/cyberlab';
import { FileCode, Play, CheckCircle2, Terminal as TermIcon, CornerDownLeft, Shield, AlertTriangle, HelpCircle, Lock, Unlock } from 'lucide-react';
import { sound } from '../../../utils/audio';

interface PermissionsLabProps {
  mission: MissionData;
  onSuccess: () => void;
}

interface LogLine {
  id: string;
  type: 'CMD' | 'OUTPUT' | 'ERROR' | 'SUCCESS' | 'INFO';
  text: string;
}

export const PermissionsLab: React.FC<PermissionsLabProps> = ({
  mission,
  onSuccess
}) => {
  // Permission bits: User, Group, Others
  const [userPerms, setUserPerms] = useState({ r: true, w: true, x: false });
  const [groupPerms, setGroupPerms] = useState({ r: true, w: false, x: false });
  const [otherPerms, setOtherPerms] = useState({ r: true, w: false, x: false });

  const [inputVal, setInputVal] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const calculateOctal = (p: { r: boolean; w: boolean; x: boolean }) => {
    return (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0);
  };

  const userOctal = calculateOctal(userPerms);
  const groupOctal = calculateOctal(groupPerms);
  const otherOctal = calculateOctal(otherPerms);
  const fullOctal = `${userOctal}${groupOctal}${otherOctal}`;

  const permString = `-${userPerms.r ? 'r' : '-'}${userPerms.w ? 'w' : '-'}${userPerms.x ? 'x' : '-'}${groupPerms.r ? 'r' : '-'}${groupPerms.w ? 'w' : '-'}${groupPerms.x ? 'x' : '-'}${otherPerms.r ? 'r' : '-'}${otherPerms.w ? 'w' : '-'}${otherPerms.x ? 'x' : '-'}`;

  const [logs, setLogs] = useState<LogLine[]>([
    { id: '1', type: 'INFO', text: '=== CYBER LAB LINUX PERMISSION WORKSTATION ===' },
    { id: '2', type: 'INFO', text: 'Target Tool: /opt/tools/recon_scanner.sh' },
    { id: '3', type: 'INFO', text: 'Type "ls -l" to inspect file permissions, or "help" for guidance.' },
    { id: '4', type: 'INFO', text: 'Objective: Grant execution permission (x) and execute "./recon_scanner.sh".' }
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
      { id: `cmd_${Date.now()}`, type: 'CMD', text: `operative@sandbox:/opt/tools$ ${cmd}` }
    ];

    const parts = cmd.split(' ').filter(Boolean);
    const mainCmd = parts[0].toLowerCase();
    const arg1 = parts[1];
    const arg2 = parts[2];

    if (mainCmd === 'help') {
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `Available Permission Commands:\n  ls -l                        - List directory with detailed permissions\n  chmod +x recon_scanner.sh   - Add execution permission for owner\n  chmod 755 recon_scanner.sh  - Set rwxr-xr-x (standard executable)\n  chmod 700 recon_scanner.sh  - Set rwx------ (private executable)\n  ./recon_scanner.sh          - Execute the script binary\n  cat recon_scanner.sh        - View script source code\n  clear                       - Clear terminal screen`
      });
    } else if (mainCmd === 'clear') {
      setLogs([]);
      setInputVal('');
      return;
    } else if (mainCmd === 'ls') {
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `total 16\n-rw-r--r-- 1 operative staff  512 Aug 20 10:14 readme.txt\n${permString} 1 operative staff 1024 Aug 20 10:15 recon_scanner.sh\n-rw-r--r-- 1 root      root   2048 Aug 20 09:30 system_info.log`
      });
      if (!userPerms.x) {
        newLogs.push({
          id: `info_${Date.now()}`,
          type: 'INFO',
          text: '[!] Notice: "recon_scanner.sh" lacks "x" (execution bit). Apply "chmod +x recon_scanner.sh" or "chmod 755 recon_scanner.sh".'
        });
      }
    } else if (mainCmd === 'cat') {
      if (arg1 === 'recon_scanner.sh') {
        newLogs.push({
          id: `out_${Date.now()}`,
          type: 'OUTPUT',
          text: `#!/bin/bash\n# Recon Scanner v2.4\necho "[*] Probing local network interfaces..."\necho "[*] Decrypting auth registers..."\necho "[+] TARGET_FLAG{CHMOD_EXEC_OCTAL_755}"`
        });
      } else {
        newLogs.push({ id: `out_${Date.now()}`, type: 'OUTPUT', text: 'Usage: cat recon_scanner.sh' });
      }
    } else if (mainCmd === 'chmod') {
      if (!arg1) {
        newLogs.push({ id: `err_${Date.now()}`, type: 'ERROR', text: 'chmod: missing operand. Usage: chmod +x <file> or chmod 755 <file>' });
      } else if (arg1 === '+x' || arg1 === 'u+x' || arg1 === 'a+x') {
        setUserPerms(p => ({ ...p, x: true }));
        setGroupPerms(p => ({ ...p, x: true }));
        setOtherPerms(p => ({ ...p, x: true }));
        sound.playShield();
        newLogs.push({
          id: `out_${Date.now()}`,
          type: 'OUTPUT',
          text: `Permissions updated: -rwxr-xr-x (755). Execution bit granted! You can now execute "./recon_scanner.sh".`
        });
      } else if (arg1 === '755' || arg1 === '777' || arg1 === '700' || arg1 === '750') {
        const u = parseInt(arg1[0], 10);
        const g = parseInt(arg1[1], 10);
        const o = parseInt(arg1[2], 10);

        setUserPerms({ r: (u & 4) !== 0, w: (u & 2) !== 0, x: (u & 1) !== 0 });
        setGroupPerms({ r: (g & 4) !== 0, w: (g & 2) !== 0, x: (g & 1) !== 0 });
        setOtherPerms({ r: (o & 4) !== 0, w: (o & 2) !== 0, x: (o & 1) !== 0 });
        sound.playShield();
        newLogs.push({
          id: `out_${Date.now()}`,
          type: 'OUTPUT',
          text: `Permissions updated to mode ${arg1}. Execution bit set!`
        });
      } else if (arg1 === '644' || arg1 === '-x') {
        setUserPerms(p => ({ ...p, x: false }));
        setGroupPerms(p => ({ ...p, x: false }));
        setOtherPerms(p => ({ ...p, x: false }));
        newLogs.push({
          id: `out_${Date.now()}`,
          type: 'OUTPUT',
          text: `Permissions updated to -rw-r--r-- (644). Execution bit removed.`
        });
      } else {
        newLogs.push({
          id: `err_${Date.now()}`,
          type: 'ERROR',
          text: `chmod: invalid mode: "${arg1}". Try "chmod +x recon_scanner.sh" or "chmod 755 recon_scanner.sh".`
        });
      }
    } else if (mainCmd === './recon_scanner.sh' || (mainCmd === 'bash' && arg1 === 'recon_scanner.sh') || (mainCmd === 'sh' && arg1 === 'recon_scanner.sh')) {
      if (!userPerms.x) {
        sound.playAlert();
        newLogs.push({
          id: `err_${Date.now()}`,
          type: 'ERROR',
          text: `bash: ./recon_scanner.sh: Permission denied.\n[!] Cause: The file has mode ${fullOctal} (${permString}). It lacks the execution bit (+x).\n[+] Fix: Run "chmod +x recon_scanner.sh" before running.`
        });
      } else {
        sound.playSuccess();
        setIsCompleted(true);
        newLogs.push({
          id: `out_${Date.now()}`,
          type: 'OUTPUT',
          text: `[*] Initializing recon_scanner v2.4 (PID 9102)...\n[*] Probing internal subnet memory registers...\n[*] Scanning memory segment 0x7FFF80...\n[+] SUCCESS! Authentication register decrypted!`
        });
        newLogs.push({
          id: `succ_${Date.now()}`,
          type: 'SUCCESS',
          text: `==================================================\n>>> OBJECTIVE COMPLETE: PERMISSION ESCALATED & TOOL EXECUTED! <<<\nFLAG: KEY{CHMOD_EXECUTABLE_OCTAL_755_SUCCESS}`
        });
        setTimeout(() => {
          onSuccess();
        }, 1400);
      }
    } else {
      newLogs.push({
        id: `err_${Date.now()}`,
        type: 'ERROR',
        text: `bash: ${cmd}: command not found. Type "help" or "ls -l".`
      });
    }

    setLogs(newLogs);
    setInputVal('');
  };

  const handleToggleBit = (role: 'user' | 'group' | 'other', bit: 'r' | 'w' | 'x') => {
    sound.playClick();
    if (role === 'user') {
      setUserPerms(prev => ({ ...prev, [bit]: !prev[bit] }));
    } else if (role === 'group') {
      setGroupPerms(prev => ({ ...prev, [bit]: !prev[bit] }));
    } else {
      setOtherPerms(prev => ({ ...prev, [bit]: !prev[bit] }));
    }
  };

  const handleApplyQuickPreset = (preset: '644' | '755' | '777') => {
    handleCommand(`chmod ${preset} recon_scanner.sh`);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 text-left space-y-4 font-sans">
      {/* Objective Banner */}
      <div className="p-3.5 rounded-xl border border-red-500/40 bg-black/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366] animate-pulse" />
          <span className="text-[#FF3366] font-bold uppercase">TARGET OBJECTIVE:</span>
          <span className="text-slate-300">{mission.shortObjective}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelper(!showHelper)}
            className="min-h-[32px] px-2.5 py-1 rounded bg-black/80 border border-green-500/30 text-green-400 hover:text-white hover:border-green-400 text-[11px] flex items-center gap-1.5 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>{showHelper ? 'Hide SOP' : 'Octal Guide'}</span>
          </button>
          {isCompleted && (
            <span className="text-[#00FF66] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> SUCCESS
            </span>
          )}
        </div>
      </div>

      {/* Permission Bit Matrix Interactive Studio */}
      <div className="p-4 sm:p-5 rounded-xl border border-green-500/30 bg-black/80 backdrop-blur-md space-y-4 font-mono shadow-[0_0_30px_rgba(0,255,102,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-green-500/20 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
            <FileCode className="w-4 h-4 text-[#00FF66]" />
            <span>File Attributes: recon_scanner.sh</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Octal Mode:</span>
            <span className="px-2.5 py-0.5 rounded bg-black border border-green-500/40 font-bold text-[#00FF66]">
              {fullOctal}
            </span>
            <span className="text-slate-300 font-bold tracking-wider">
              {permString}
            </span>
          </div>
        </div>

        {/* Interactive 3-Column Bit Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Owner Bits */}
          <div className="p-3.5 rounded-lg bg-black/90 border border-green-500/20 space-y-2.5">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>Owner (User)</span>
              <span className="text-amber-400">{userOctal}</span>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleToggleBit('user', 'r')}
                className={`flex-1 min-h-[36px] py-1 rounded text-center font-bold border transition-all ${userPerms.r ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' : 'bg-black border-slate-800 text-slate-600'}`}
              >
                r (4)
              </button>
              <button
                type="button"
                onClick={() => handleToggleBit('user', 'w')}
                className={`flex-1 min-h-[36px] py-1 rounded text-center font-bold border transition-all ${userPerms.w ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' : 'bg-black border-slate-800 text-slate-600'}`}
              >
                w (2)
              </button>
              <button
                type="button"
                onClick={() => handleToggleBit('user', 'x')}
                className={`flex-1 min-h-[36px] py-1 rounded text-center font-bold border transition-all ${userPerms.x ? 'bg-green-950/80 border-[#00FF66] text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.3)]' : 'bg-black border-slate-800 text-slate-600'}`}
              >
                x (1)
              </button>
            </div>
          </div>

          {/* Group Bits */}
          <div className="p-3.5 rounded-lg bg-black/90 border border-green-500/20 space-y-2.5">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>Group</span>
              <span className="text-amber-400">{groupOctal}</span>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleToggleBit('group', 'r')}
                className={`flex-1 min-h-[36px] py-1 rounded text-center font-bold border transition-all ${groupPerms.r ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' : 'bg-black border-slate-800 text-slate-600'}`}
              >
                r (4)
              </button>
              <button
                type="button"
                onClick={() => handleToggleBit('group', 'w')}
                className={`flex-1 min-h-[36px] py-1 rounded text-center font-bold border transition-all ${groupPerms.w ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' : 'bg-black border-slate-800 text-slate-600'}`}
              >
                w (2)
              </button>
              <button
                type="button"
                onClick={() => handleToggleBit('group', 'x')}
                className={`flex-1 min-h-[36px] py-1 rounded text-center font-bold border transition-all ${groupPerms.x ? 'bg-green-950/80 border-[#00FF66] text-[#00FF66]' : 'bg-black border-slate-800 text-slate-600'}`}
              >
                x (1)
              </button>
            </div>
          </div>

          {/* Others Bits */}
          <div className="p-3.5 rounded-lg bg-black/90 border border-green-500/20 space-y-2.5">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>Others</span>
              <span className="text-amber-400">{otherOctal}</span>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleToggleBit('other', 'r')}
                className={`flex-1 min-h-[36px] py-1 rounded text-center font-bold border transition-all ${otherPerms.r ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' : 'bg-black border-slate-800 text-slate-600'}`}
              >
                r (4)
              </button>
              <button
                type="button"
                onClick={() => handleToggleBit('other', 'w')}
                className={`flex-1 min-h-[36px] py-1 rounded text-center font-bold border transition-all ${otherPerms.w ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' : 'bg-black border-slate-800 text-slate-600'}`}
              >
                w (2)
              </button>
              <button
                type="button"
                onClick={() => handleToggleBit('other', 'x')}
                className={`flex-1 min-h-[36px] py-1 rounded text-center font-bold border transition-all ${otherPerms.x ? 'bg-green-950/80 border-[#00FF66] text-[#00FF66]' : 'bg-black border-slate-800 text-slate-600'}`}
              >
                x (1)
              </button>
            </div>
          </div>
        </div>

        {/* Execution Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs">
            {userPerms.x ? (
              <span className="text-[#00FF66] font-bold flex items-center gap-1.5">
                <Unlock className="w-4 h-4" /> Executable bit is active (+x)
              </span>
            ) : (
              <span className="text-[#FF3366] font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> Missing execution bit (Script cannot run)
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Execute commands in terminal below
          </div>
        </div>
      </div>

      {/* Optional Octal Guide */}
      {showHelper && (
        <div className="p-4 rounded-xl bg-black/90 border border-green-500/30 text-xs font-mono text-slate-300 space-y-2 animate-in fade-in duration-150">
          <div className="font-bold text-[#00FF66] uppercase">Linux Permissions & chmod Reference:</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Linux permissions are split into Read (<code className="text-amber-300">r=4</code>), Write (<code className="text-amber-300">w=2</code>), and Execute (<code className="text-[#00FF66]">x=1</code>) across three categories: Owner (u), Group (g), and Others (o).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded bg-black border border-green-500/20">
              <strong className="text-white block mb-1">Symbolic Mode:</strong>
              <code className="text-[#00FF66] block">chmod +x recon_scanner.sh</code>
              <span className="text-slate-400 text-[10px]">Grants executable permission to the file.</span>
            </div>
            <div className="p-2.5 rounded bg-black border border-green-500/20">
              <strong className="text-white block mb-1">Octal Numeric Mode:</strong>
              <code className="text-[#00FF66] block">chmod 755 recon_scanner.sh</code>
              <span className="text-slate-400 text-[10px]">Sets rwxr-xr-x (Owner=7, Group=5, Others=5).</span>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Terminal Window */}
      <div className="rounded-xl border border-green-500/30 bg-black/90 shadow-[0_0_35px_rgba(0,255,102,0.08)] overflow-hidden font-mono text-xs backdrop-blur-md">
        <div className="px-4 py-2.5 bg-black/95 border-b border-green-500/20 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366] inline-block" />
            <span className="text-white font-bold">bash — /opt/tools</span>
          </div>
          <span className="text-[10px] text-green-400/60">interactive permissions shell</span>
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
          <span className="text-[#FF3366] font-bold text-xs shrink-0 hidden sm:inline">operative@sandbox:/opt/tools$</span>
          <span className="text-[#FF3366] font-bold text-xs shrink-0 sm:hidden">operative:tools$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type command (e.g. ls -l, chmod +x recon_scanner.sh)..."
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
