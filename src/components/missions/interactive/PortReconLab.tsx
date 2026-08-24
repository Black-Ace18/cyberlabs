import React, { useState, useRef, useEffect } from 'react';
import { MissionData } from '../../../types/cyberlab';
import { Radio, Search, CheckCircle2, Terminal as TermIcon, CornerDownLeft, Shield, Network, Server, Key, HelpCircle } from 'lucide-react';
import { sound } from '../../../utils/audio';

interface PortReconLabProps {
  mission: MissionData;
  onSuccess: () => void;
}

interface LogLine {
  id: string;
  type: 'CMD' | 'OUTPUT' | 'ERROR' | 'SUCCESS' | 'INFO';
  text: string;
}

interface DiscoveredPort {
  port: number;
  protocol: string;
  service: string;
  version: string;
  state: 'OPEN' | 'FILTERED';
  isVulnerable: boolean;
  banner: string;
}

export const PortReconLab: React.FC<PortReconLabProps> = ({
  mission,
  onSuccess
}) => {
  const [hasScanned, setHasScanned] = useState(false);
  const [inNetcatSession, setInNetcatSession] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  const [discoveredPorts, setDiscoveredPorts] = useState<DiscoveredPort[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [logs, setLogs] = useState<LogLine[]>([
    { id: '1', type: 'INFO', text: '=== CYBER LAB NETWORK RECONNAISSANCE CONSOLE ===' },
    { id: '2', type: 'INFO', text: 'Target Host: 192.168.1.50 (Internal Subnet Server)' },
    { id: '3', type: 'INFO', text: 'Objective: Scan target host using "nmap 192.168.1.50", locate exposed debug service, and interrogate it using "nc 192.168.1.50 8080".' },
    { id: '4', type: 'INFO', text: 'Type "help" for a list of reconnaissance commands.' }
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    sound.playKeystroke();

    if (inNetcatSession) {
      // Remote Netcat interactive prompt
      const newLogs: LogLine[] = [
        ...logs,
        { id: `nc_${Date.now()}`, type: 'CMD', text: `[NC 192.168.1.50:8080]> ${cmd}` }
      ];

      const lower = cmd.toLowerCase();
      if (lower === 'exit' || lower === 'quit') {
        setInNetcatSession(false);
        newLogs.push({ id: `nc_out_${Date.now()}`, type: 'INFO', text: 'Connection to 192.168.1.50 closed.' });
      } else if (lower === 'help') {
        newLogs.push({
          id: `nc_out_${Date.now()}`,
          type: 'OUTPUT',
          text: `DEBUG CONSOLE COMMANDS:\n  status       - Server uptime & debug status\n  dump flag    - Extract admin access key\n  whoami       - Current remote session user\n  exit         - Terminate netcat connection`
        });
      } else if (lower === 'status') {
        newLogs.push({
          id: `nc_out_${Date.now()}`,
          type: 'OUTPUT',
          text: `STATUS: ONLINE | DEBUG_MODE: ENABLED | AUTH_CHECK: DISABLED (VULNERABLE)\nRun "dump flag" to retrieve registration tokens.`
        });
      } else if (lower === 'whoami') {
        newLogs.push({ id: `nc_out_${Date.now()}`, type: 'OUTPUT', text: 'uid=0(root) gid=0(root) groups=0(root) [REMOTE DEBUG INTERFACE]' });
      } else if (lower.includes('flag') || lower.includes('dump') || lower.includes('auth') || lower.includes('key')) {
        sound.playSuccess();
        setIsCompleted(true);
        newLogs.push({
          id: `nc_out_${Date.now()}`,
          type: 'OUTPUT',
          text: `[*] Decrypting core debug buffer registers...\n[+] DUMP SUCCESSFUL: TARGET_FLAG{NMAP_BANNER_GRAB_PORT_8080_PWNED}`
        });
        newLogs.push({
          id: `succ_${Date.now()}`,
          type: 'SUCCESS',
          text: `==================================================\n>>> MISSION OBJECTIVE COMPLETE: EXPOSED DEBUG SERVICE PWNED! <<<\nFLAG: TARGET_FLAG{NMAP_BANNER_GRAB_PORT_8080_PWNED}`
        });
        setTimeout(() => {
          onSuccess();
        }, 1400);
      } else {
        newLogs.push({
          id: `nc_out_${Date.now()}`,
          type: 'OUTPUT',
          text: `Unrecognized debug directive: "${cmd}". Type "help" or "dump flag".`
        });
      }

      setLogs(newLogs);
      setInputVal('');
      return;
    }

    // Standard shell
    const newLogs: LogLine[] = [
      ...logs,
      { id: `cmd_${Date.now()}`, type: 'CMD', text: `operative@sandbox:~$ ${cmd}` }
    ];

    const parts = cmd.split(' ').filter(Boolean);
    const mainCmd = parts[0].toLowerCase();
    const target = parts[parts.length - 1];

    if (mainCmd === 'help') {
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `Network Reconnaissance Tools:\n  nmap 192.168.1.50          - Port scan target host\n  nmap -sV 192.168.1.50      - Scan ports & fingerprint service versions\n  nc 192.168.1.50 8080       - Netcat banner grab / interactive connect to port 8080\n  curl 192.168.1.50:8080     - Interrogate web / API service\n  ping 192.168.1.50          - Test ICMP connectivity\n  clear                      - Clear terminal display`
      });
    } else if (mainCmd === 'clear') {
      setLogs([]);
      setInputVal('');
      return;
    } else if (mainCmd === 'ping') {
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `PING 192.168.1.50 (192.168.1.50) 56(84) bytes of data.\n64 bytes from 192.168.1.50: icmp_seq=1 ttl=64 time=1.42 ms\n64 bytes from 192.168.1.50: icmp_seq=2 ttl=64 time=1.15 ms\n--- 192.168.1.50 ping statistics --- 2 packets transmitted, 2 received, 0% packet loss`
      });
    } else if (mainCmd === 'nmap') {
      sound.playAlert();
      setHasScanned(true);
      const ports: DiscoveredPort[] = [
        { port: 22, protocol: 'TCP', service: 'ssh', version: 'OpenSSH 8.9p1 (Ubuntu)', state: 'OPEN', isVulnerable: false, banner: 'SSH-2.0-OpenSSH_8.9p1' },
        { port: 80, protocol: 'TCP', service: 'http', version: 'nginx 1.18.0', state: 'OPEN', isVulnerable: false, banner: 'nginx/1.18.0 (Ubuntu)' },
        { port: 8080, protocol: 'TCP', service: 'http-proxy / debug', version: 'Node.js Debug Console (Unauthenticated)', state: 'OPEN', isVulnerable: true, banner: 'Debug Console v1.0.4' },
        { port: 3306, protocol: 'TCP', service: 'mysql', version: 'MySQL 8.0.28', state: 'FILTERED', isVulnerable: false, banner: 'Filtered by firewall' }
      ];
      setDiscoveredPorts(ports);

      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `Starting Nmap 7.94 ( https://nmap.org ) at 2026-08-20 12:45 UTC\nNmap scan report for 192.168.1.50\nHost is up (0.0012s latency).\nNot shown: 996 closed tcp ports\n\nPORT     STATE    SERVICE     VERSION\n22/tcp   open     ssh         OpenSSH 8.9p1 Ubuntu\n80/tcp   open     http        nginx 1.18.0\n8080/tcp open     http-proxy  Node.js Debug Console (Unauthenticated!)\n3306/tcp filtered mysql       MySQL Database\n\n[!] ANOMALY FOUND: Port 8080 is exposing an unauthenticated Debug Console!\n[+] Action: Connect to port 8080 via "nc 192.168.1.50 8080" to interrogate the remote service.`
      });
    } else if (mainCmd === 'nc' || mainCmd === 'netcat') {
      const portArg = parts[2] || parts[1];
      if (portArg === '8080' || cmd.includes('8080')) {
        sound.playShield();
        setInNetcatSession(true);
        newLogs.push({
          id: `out_${Date.now()}`,
          type: 'OUTPUT',
          text: `Connected to 192.168.1.50:8080!\n=======================================================\n>>> EMERGENCY BACKDOOR DEBUG PROMPT v1.0.4 <<<\nWARNING: INTERNAL USE ONLY. TYPE "help" OR "dump flag".\n=======================================================`
        });
      } else if (portArg === '22' || cmd.includes('22')) {
        newLogs.push({ id: `out_${Date.now()}`, type: 'OUTPUT', text: `SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.1\nProtocol mismatch or key required.` });
      } else if (portArg === '80' || cmd.includes('80')) {
        newLogs.push({ id: `out_${Date.now()}`, type: 'OUTPUT', text: `HTTP/1.1 400 Bad Request\nServer: nginx/1.18.0\nContent-Type: text/html` });
      } else {
        newLogs.push({ id: `err_${Date.now()}`, type: 'ERROR', text: `nc: connect to 192.168.1.50 port ${portArg || ''} failed: Connection refused.` });
      }
    } else if (mainCmd === 'curl') {
      if (cmd.includes('8080')) {
        sound.playSuccess();
        setIsCompleted(true);
        newLogs.push({
          id: `out_${Date.now()}`,
          type: 'OUTPUT',
          text: `HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "status": "DEBUG_ACTIVE",\n  "auth_bypass": true,\n  "secret_token": "TARGET_FLAG{NMAP_BANNER_GRAB_PORT_8080_PWNED}"\n}`
        });
        newLogs.push({
          id: `succ_${Date.now()}`,
          type: 'SUCCESS',
          text: `==================================================\n>>> MISSION OBJECTIVE COMPLETE: EXPOSED DEBUG SERVICE PWNED! <<<\nFLAG: TARGET_FLAG{NMAP_BANNER_GRAB_PORT_8080_PWNED}`
        });
        setTimeout(() => {
          onSuccess();
        }, 1400);
      } else {
        newLogs.push({
          id: `out_${Date.now()}`,
          type: 'OUTPUT',
          text: `<html><body><h1>Welcome to 192.168.1.50 Web Portal</h1><p>Standard static web page.</p></body></html>`
        });
      }
    } else {
      newLogs.push({
        id: `err_${Date.now()}`,
        type: 'ERROR',
        text: `bash: ${cmd}: command not found. Type "help" to see available recon tools.`
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
            <span>{showHelper ? 'Hide Help' : 'Recon Manual'}</span>
          </button>
          {isCompleted && (
            <span className="text-[#00FF66] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> SUCCESS
            </span>
          )}
        </div>
      </div>

      {/* Optional Recon Manual */}
      {showHelper && (
        <div className="p-4 rounded-xl bg-black/90 border border-green-500/30 text-xs font-mono text-slate-300 space-y-2 animate-in fade-in duration-150">
          <div className="font-bold text-[#00FF66] uppercase">Network Reconnaissance & Probing Manual:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2.5 rounded bg-black border border-green-500/20 space-y-1">
              <strong className="text-[#00FF66] block">1. Nmap Port Scan:</strong>
              <code className="text-[#00E5FF] text-[10px] block">nmap 192.168.1.50</code>
              <span className="text-slate-400 text-[10px]">Scans target host for open TCP ports and running services.</span>
            </div>
            <div className="p-2.5 rounded bg-black border border-green-500/20 space-y-1">
              <strong className="text-[#00FF66] block">2. Netcat Interaction:</strong>
              <code className="text-[#00E5FF] text-[10px] block">nc 192.168.1.50 8080</code>
              <span className="text-slate-400 text-[10px]">Opens an interactive raw socket to the debug console.</span>
            </div>
            <div className="p-2.5 rounded bg-black border border-green-500/20 space-y-1">
              <strong className="text-[#00FF66] block">3. Curl HTTP Probe:</strong>
              <code className="text-[#00E5FF] text-[10px] block">curl 192.168.1.50:8080</code>
              <span className="text-slate-400 text-[10px]">Sends an HTTP GET request to test web endpoints.</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Port Grid / Topology Monitor */}
      <div className="p-4 sm:p-5 rounded-xl border border-green-500/30 bg-black/80 backdrop-blur-md space-y-4 font-mono shadow-[0_0_30px_rgba(0,255,102,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-green-500/20 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
            <Network className="w-4 h-4 text-[#00FF66]" />
            <span>Target Host Telemetry: 192.168.1.50</span>
          </div>
          <span className="text-[11px] text-green-400/80">
            {hasScanned ? '4 Ports Enumerated' : 'Port State: Unscanned'}
          </span>
        </div>

        {hasScanned ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {discoveredPorts.map(p => (
              <div
                key={p.port}
                className={`p-3.5 rounded-lg border text-xs space-y-1.5 transition-all ${
                  p.isVulnerable
                    ? 'bg-red-950/60 border-[#FF3366] shadow-[0_0_18px_rgba(255,51,102,0.3)]'
                    : 'bg-black/90 border-green-500/25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">PORT {p.port}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    p.state === 'OPEN' ? 'bg-green-950/80 text-[#00FF66] border border-green-500/50' : 'bg-black text-slate-400 border border-slate-800'
                  }`}>
                    {p.state}
                  </span>
                </div>
                <div className="text-[11px] text-green-300 font-semibold">{p.service}</div>
                <div className="text-[10px] text-slate-400 truncate">{p.version}</div>
                {p.isVulnerable && (
                  <div className="text-[10px] text-[#FF3366] font-bold pt-1.5 border-t border-red-500/40">
                    ⚠ Unauthenticated Debug Console
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 rounded-lg bg-black/90 border border-green-500/20 text-center text-xs text-slate-400">
            Target host active on subnet. Execute <code className="text-[#00FF66]">nmap 192.168.1.50</code> in the terminal to probe open services.
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-green-500/20 text-[11px] text-slate-400">
          <span>Target IP: <strong className="text-white">192.168.1.50</strong></span>
          <span>{inNetcatSession ? 'Status: Connected via Netcat Socket' : 'Status: Ready for Probe Commands'}</span>
        </div>
      </div>

      {/* Terminal Window */}
      <div className="rounded-xl border border-green-500/30 bg-black/90 shadow-[0_0_35px_rgba(0,255,102,0.08)] overflow-hidden font-mono text-xs backdrop-blur-md">
        <div className="px-4 py-2.5 bg-black/95 border-b border-green-500/20 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366] inline-block" />
            <span className="text-white font-bold">
              {inNetcatSession ? 'netcat session — 192.168.1.50:8080' : 'bash — operative@sandbox'}
            </span>
          </div>
          <span className="text-[10px] text-green-400/60">
            {inNetcatSession ? 'REMOTE INTERACTIVE SOCKET' : 'LOCAL RECON SHELL'}
          </span>
        </div>

        <div 
          onClick={() => inputRef.current?.focus()}
          className="p-4 min-h-[220px] max-h-[320px] overflow-y-auto space-y-1.5 cursor-text"
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
          <span className="text-[#FF3366] font-bold text-xs shrink-0 hidden sm:inline">
            {inNetcatSession ? '[NC 192.168.1.50:8080]>' : 'operative@sandbox:~$'}
          </span>
          <span className="text-[#FF3366] font-bold text-xs shrink-0 sm:hidden">
            {inNetcatSession ? '[NC]>' : 'operative:~$'}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={
              inNetcatSession 
                ? 'Type debug command (e.g. dump flag, status, help, exit)...' 
                : 'Type command (e.g. nmap 192.168.1.50, nc 192.168.1.50 8080)...'
            }
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
