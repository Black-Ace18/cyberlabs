import React, { useState, useRef, useEffect } from 'react';
import { MissionData } from '../../../types/cyberlab';
import { CheckCircle2, CornerDownLeft, Sparkles, Terminal as TermIcon, ShieldAlert, Target, Award, HelpCircle } from 'lucide-react';
import { sound } from '../../../utils/audio';

interface MultiStepOperationProps {
  mission: MissionData;
  onSuccess: () => void;
}

interface LogLine {
  id: string;
  type: 'CMD' | 'OUTPUT' | 'ERROR' | 'SUCCESS' | 'INFO';
  text: string;
}

export const MultiStepOperation: React.FC<MultiStepOperationProps> = ({
  mission,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [inputVal, setInputVal] = useState('');
  const [hasScannedSubnet, setHasScannedSubnet] = useState(false);
  const [hasScannedHost, setHasScannedHost] = useState(false);
  const [hasChmodTool, setHasChmodTool] = useState(false);
  const [hasExploited, setHasExploited] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [logs, setLogs] = useState<LogLine[]>([
    { id: '1', type: 'INFO', text: '=== CYBER LAB RED TEAM MULTI-VECTOR OPERATION ===' },
    { id: '2', type: 'INFO', text: 'Target Subnet: 10.10.40.0/24 | Operative Shell: Kali-Sandbox' },
    { id: '3', type: 'INFO', text: 'STEP 1: Run "nmap -sn 10.10.40.0/24" (or ping-sweep) to locate live target hosts.' }
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
      { id: `cmd_${Date.now()}`, type: 'CMD', text: `root@kali-sandbox:~# ${cmd}` }
    ];

    const lower = cmd.toLowerCase();

    if (lower === 'help') {
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `Operation Command Guide:\n  Step 1: nmap -sn 10.10.40.0/24           - Discover live subnet hosts\n  Step 2: nmap -sV 10.10.40.15             - Fingerprint services on target\n  Step 3: chmod +x /opt/tools/exploit.sh   - Make exploit binary executable\n  Step 4: /opt/tools/exploit.sh            - Deliver payload to 10.10.40.15:8443\n  Step 5: cat /var/vault/root_flag.txt     - Capture root flag\n  clear                                    - Clear screen`
      });
    } else if (lower === 'clear') {
      setLogs([]);
      setInputVal('');
      return;
    } else if (lower.includes('10.10.40.0') || lower.includes('ping-sweep') || (lower.startsWith('nmap') && !lower.includes('10.10.40.15'))) {
      // Step 1: Subnet Recon
      sound.playAlert();
      setHasScannedSubnet(true);
      if (currentStep === 1) setCurrentStep(2);
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `Starting Nmap Ping Sweep on 10.10.40.0/24...\n[+] Host 10.10.40.1  - Gateway [UP]\n[+] Host 10.10.40.15 - INTERNAL VAULT SERVER [UP]\n\n[>] STEP 1 COMPLETE: Target identified at 10.10.40.15!\n[>] NEXT STEP 2: Fingerprint target host with "nmap -sV 10.10.40.15".`
      });
    } else if (lower.includes('nmap') && lower.includes('10.10.40.15')) {
      // Step 2: Host Service Recon
      if (!hasScannedSubnet) {
        newLogs.push({ id: `err_${Date.now()}`, type: 'ERROR', text: 'Subnet not yet mapped. Run "nmap -sn 10.10.40.0/24" first.' });
      } else {
        sound.playAlert();
        setHasScannedHost(true);
        if (currentStep === 2) setCurrentStep(3);
        newLogs.push({
          id: `out_${Date.now()}`,
          type: 'OUTPUT',
          text: `Nmap scan report for 10.10.40.15\nPORT     STATE SERVICE VERSION\n8443/tcp open  https   Enterprise API Gateway (Vulnerable to SQL injection!)\n\n[>] STEP 2 COMPLETE: Vulnerable service located on port 8443.\n[>] NEXT STEP 3: Check /opt/tools/exploit.sh permissions and grant +x.`
        });
      }
    } else if (lower.startsWith('ls') && lower.includes('/opt/tools')) {
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `-rw-r--r-- 1 root root 4096 Aug 20 11:30 /opt/tools/exploit.sh\n[!] Note: File lacks execution bit (+x). Run "chmod +x /opt/tools/exploit.sh".`
      });
    } else if (lower.startsWith('chmod') && lower.includes('exploit.sh')) {
      // Step 3: chmod +x
      sound.playShield();
      setHasChmodTool(true);
      if (currentStep === 3) setCurrentStep(4);
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `Permissions updated: -rwxr-xr-x 1 root root /opt/tools/exploit.sh\n[>] STEP 3 COMPLETE: Exploit tool is now executable!\n[>] NEXT STEP 4: Run "/opt/tools/exploit.sh" to compromise 10.10.40.15.`
      });
    } else if (lower.includes('exploit.sh')) {
      // Step 4: Exploit execution
      if (!hasChmodTool) {
        sound.playAlert();
        newLogs.push({
          id: `err_${Date.now()}`,
          type: 'ERROR',
          text: `bash: /opt/tools/exploit.sh: Permission denied. Run "chmod +x /opt/tools/exploit.sh" first!`
        });
      } else {
        sound.playSuccess();
        setHasExploited(true);
        if (currentStep === 4) setCurrentStep(5);
        newLogs.push({
          id: `out_${Date.now()}`,
          type: 'OUTPUT',
          text: `[*] Executing /opt/tools/exploit.sh against 10.10.40.15:8443...\n[*] Injecting SQL payload: "' OR 1=1 --"\n[+] AUTH BYPASS SUCCEEDED! Superadmin session spawned on target!\n[+] Target remote filesystem mounted at /var/vault/\n\n[>] STEP 4 COMPLETE: Remote root compromise established!\n[>] FINAL STEP 5: Run "cat /var/vault/root_flag.txt" to extract the master flag.`
        });
      }
    } else if (lower.includes('cat') && (lower.includes('root_flag') || lower.includes('/var/vault'))) {
      // Step 5: Flag retrieval
      if (!hasExploited) {
        newLogs.push({ id: `err_${Date.now()}`, type: 'ERROR', text: 'cat: /var/vault/root_flag.txt: No such file or directory. Exploit target host first!' });
      } else {
        sound.playSuccess();
        setIsCompleted(true);
        newLogs.push({
          id: `out_${Date.now()}`,
          type: 'OUTPUT',
          text: `==================================================\nROOT FLAG CAPTURED:\nFLAG{FULL_KILL_CHAIN_RED_TEAM_MASTERY_0x992}\n==================================================`
        });
        newLogs.push({
          id: `succ_${Date.now()}`,
          type: 'SUCCESS',
          text: `>>> 100% OPERATION SUCCESS: RED PILL TRACK CONQUERED! <<<`
        });
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } else {
      newLogs.push({
        id: `err_${Date.now()}`,
        type: 'ERROR',
        text: `bash: ${cmd}: command unrecognized in operation context. Type "help" for step commands.`
      });
    }

    setLogs(newLogs);
    setInputVal('');
  };

  const handleQuickAction = (cmd: string) => {
    handleCommand(cmd);
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 text-left space-y-4 font-sans">
      {/* Objective Banner */}
      <div className="p-3.5 rounded-xl border border-red-500/40 bg-black/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366] animate-pulse" />
          <span className="text-[#FF3366] font-bold uppercase">OPERATION OBJECTIVE:</span>
          <span className="text-slate-300">{mission.shortObjective}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="min-h-[32px] px-2.5 py-1 rounded bg-black/80 border border-green-500/30 text-green-400 hover:text-white hover:border-green-400 text-[11px] flex items-center gap-1.5 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>{showGuide ? 'Hide SOP' : 'Attack Plan'}</span>
          </button>
          {isCompleted && (
            <span className="text-[#00FF66] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> OPERATION MASTERED
            </span>
          )}
        </div>
      </div>

      {/* Guide & Attack Plan Modal */}
      {showGuide && (
        <div className="p-4 sm:p-5 rounded-xl bg-black/90 border border-green-500/30 text-xs font-mono text-slate-300 space-y-3.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-green-500/20 pb-2">
            <span className="font-bold text-[#00FF66] uppercase">Red Team Multi-Vector Attack Playbook:</span>
            <span className="text-[#FF3366] font-bold">Phase {currentStep}/5</span>
          </div>

          <p className="text-[11px] text-slate-400">
            Execute each step manually in the terminal by chaining discovery, enumeration, privilege escalation, exploitation, and flag exfiltration:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[10px]">
            <div className={`p-2.5 rounded-lg border ${hasScannedSubnet ? 'bg-green-950/80 border-green-500 text-[#00FF66]' : 'bg-black border-slate-800 text-slate-400'}`}>
              <strong className="text-white block mb-1">1. Subnet Recon</strong>
              <code>nmap -sn 10.10.40.0/24</code>
            </div>
            <div className={`p-2.5 rounded-lg border ${hasScannedHost ? 'bg-green-950/80 border-green-500 text-[#00FF66]' : 'bg-black border-slate-800 text-slate-400'}`}>
              <strong className="text-white block mb-1">2. Service Recon</strong>
              <code>nmap -sV 10.10.40.15</code>
            </div>
            <div className={`p-2.5 rounded-lg border ${hasChmodTool ? 'bg-green-950/80 border-green-500 text-[#00FF66]' : 'bg-black border-slate-800 text-slate-400'}`}>
              <strong className="text-white block mb-1">3. Grant Permissions</strong>
              <code>chmod +x /opt/tools/exploit.sh</code>
            </div>
            <div className={`p-2.5 rounded-lg border ${hasExploited ? 'bg-green-950/80 border-green-500 text-[#00FF66]' : 'bg-black border-slate-800 text-slate-400'}`}>
              <strong className="text-white block mb-1">4. Exploit Target</strong>
              <code>/opt/tools/exploit.sh</code>
            </div>
            <div className={`p-2.5 rounded-lg border ${isCompleted ? 'bg-green-950/80 border-green-500 text-[#00FF66]' : 'bg-black border-slate-800 text-slate-400'}`}>
              <strong className="text-white block mb-1">5. Read Flag</strong>
              <code>cat /var/vault/root_flag.txt</code>
            </div>
          </div>
        </div>
      )}

      {/* Target Environment Telemetry */}
      <div className="p-4 rounded-xl border border-green-500/30 bg-black/80 backdrop-blur-md space-y-2.5 font-mono text-xs shadow-[0_0_30px_rgba(0,255,102,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-green-500/20 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-white uppercase">
            <Target className="w-4 h-4 text-[#FF3366]" />
            <span>Target Environment: Subnet 10.10.40.0/24</span>
          </div>
          <span className="text-[11px] text-green-400/80">
            Operative Shell: Kali-Sandbox
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="p-2 rounded bg-black border border-green-500/20">
            <span className="text-slate-400 text-[10px] block">Subnet Discovery:</span>
            <span className={hasScannedSubnet ? 'text-[#00FF66] font-bold' : 'text-slate-500'}>
              {hasScannedSubnet ? '10.10.40.15 (Discovered)' : 'Unscanned'}
            </span>
          </div>
          <div className="p-2 rounded bg-black border border-green-500/20">
            <span className="text-slate-400 text-[10px] block">Port Service:</span>
            <span className={hasScannedHost ? 'text-[#00FF66] font-bold' : 'text-slate-500'}>
              {hasScannedHost ? 'Port 8443 (API)' : 'Unscanned'}
            </span>
          </div>
          <div className="p-2 rounded bg-black border border-green-500/20">
            <span className="text-slate-400 text-[10px] block">Exploit Script:</span>
            <span className={hasChmodTool ? 'text-[#00FF66] font-bold' : 'text-slate-500'}>
              {hasChmodTool ? 'Executable (+x)' : 'No +x permission'}
            </span>
          </div>
          <div className="p-2 rounded bg-black border border-green-500/20">
            <span className="text-slate-400 text-[10px] block">Target Shell:</span>
            <span className={hasExploited ? 'text-[#00FF66] font-bold' : 'text-slate-500'}>
              {hasExploited ? 'Superadmin Granted' : 'Locked'}
            </span>
          </div>
        </div>
      </div>

      {/* Terminal Window */}
      <div className="rounded-xl border border-green-500/30 bg-black/90 shadow-[0_0_35px_rgba(0,255,102,0.08)] overflow-hidden font-mono text-xs backdrop-blur-md">
        <div className="px-4 py-2.5 bg-black/95 border-b border-green-500/20 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366] inline-block" />
            <span className="text-white font-bold">root@kali-sandbox:~#</span>
          </div>
          <span className="text-[10px] text-green-400/60">OFFENSIVE ATTACK SHELL</span>
        </div>

        <div 
          onClick={() => inputRef.current?.focus()}
          className="p-4 min-h-[260px] max-h-[360px] overflow-y-auto space-y-1.5 cursor-text"
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
          <span className="text-[#FF3366] font-bold text-xs shrink-0 hidden sm:inline">root@kali-sandbox:~#</span>
          <span className="text-[#FF3366] font-bold text-xs shrink-0 sm:hidden">root@kali:~#</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type command (e.g. nmap -sn 10.10.40.0/24)..."
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
