import React, { useState, useRef, useEffect } from 'react';
import { MissionData, PacketItem } from '../../../types/cyberlab';
import { Shield, ShieldAlert, CheckCircle2, Terminal as TermIcon, CornerDownLeft, Network, Eye, Lock, FileCode, HelpCircle } from 'lucide-react';
import { sound } from '../../../utils/audio';

interface NetworkAlertLabProps {
  mission: MissionData;
  onSuccess: () => void;
}

interface LogLine {
  id: string;
  type: 'CMD' | 'OUTPUT' | 'ERROR' | 'SUCCESS' | 'INFO';
  text: string;
}

const PACKETS: PacketItem[] = [
  { id: 'pkt-1', timestamp: '12:00:01.102', sourceIp: '10.0.1.5', sourcePort: 53210, destIp: '8.8.8.8', destPort: 53, protocol: 'DNS', payload: 'Standard query 0x12a A api.internal', flags: 'UDP', isMalicious: false },
  { id: 'pkt-2', timestamp: '12:00:01.340', sourceIp: '10.0.1.5', sourcePort: 49120, destIp: '104.244.42.1', destPort: 443, protocol: 'TLSv1.3', payload: 'Client Hello, TLS Encrypted Session', flags: 'ACK', isMalicious: false },
  { id: 'pkt-3', timestamp: '12:00:02.890', sourceIp: '10.0.1.5', sourcePort: 49822, destIp: '203.0.113.88', destPort: 4444, protocol: 'TCP (RAW)', payload: 'EXFIL: [CHUNK 1/4] customers_db.tar.gz [CREDIT_CARDS_RAW]', flags: 'PSH, ACK', isMalicious: true },
  { id: 'pkt-4', timestamp: '12:00:03.110', sourceIp: '203.0.113.88', sourcePort: 4444, destIp: '10.0.1.5', destPort: 49822, protocol: 'TCP (RAW)', payload: 'C2_ACK: Received 4096 bytes', flags: 'ACK', isMalicious: true },
  { id: 'pkt-5', timestamp: '12:00:03.450', sourceIp: '10.0.1.5', sourcePort: 49822, destIp: '203.0.113.88', destPort: 4444, protocol: 'TCP (RAW)', payload: 'EXFIL: [CHUNK 2/4] customers_db.tar.gz [PASS_HASHES]', flags: 'PSH, ACK', isMalicious: true }
];

export const NetworkAlertLab: React.FC<NetworkAlertLabProps> = ({
  mission,
  onSuccess
}) => {
  const [selectedPacket, setSelectedPacket] = useState<PacketItem>(PACKETS[2]);
  const [showStreamDecoder, setShowStreamDecoder] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockIpInput, setBlockIpInput] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [logs, setLogs] = useState<LogLine[]>([
    { id: '1', type: 'INFO', text: '=== CYBER LAB NETWORK PACKET DISSECTOR & FIREWALL ===' },
    { id: '2', type: 'INFO', text: 'Network Interface: eth0 (Promiscuous Mode)' },
    { id: '3', type: 'INFO', text: 'Objective: Inspect packets to identify suspicious C2 beacon on port 4444, then block the destination IP.' }
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
      { id: `cmd_${Date.now()}`, type: 'CMD', text: `root@firewall-gateway:~# ${cmd}` }
    ];

    const lower = cmd.toLowerCase();

    if (lower === 'help') {
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `Firewall Gateway Commands:\n  iptables -L                                  - List active packet filtering rules\n  iptables -A OUTPUT -d <IP> -j DROP           - Drop outbound traffic to destination IP\n  iptables -A OUTPUT -p tcp --dport 4444 -j DROP - Drop outbound traffic on port 4444\n  tcpdump -r capture.pcap                      - Print packet capture dump\n  clear                                        - Clear terminal display`
      });
    } else if (lower === 'clear') {
      setLogs([]);
      setInputVal('');
      return;
    } else if (lower === 'iptables -l') {
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: isBlocked
          ? `Chain OUTPUT (policy ACCEPT)\ntarget     prot opt source               destination\nDROP       all  --  anywhere             203.0.113.88`
          : `Chain INPUT (policy ACCEPT)\ntarget     prot opt source               destination\n\nChain OUTPUT (policy ACCEPT)\ntarget     prot opt source               destination\n(0 active rules)`
      });
    } else if (lower.includes('203.0.113.88') && (lower.includes('drop') || lower.includes('reject') || lower.includes('deny'))) {
      sound.playSuccess();
      setIsBlocked(true);
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `[+] Firewall rule committed: OUTPUT -d 203.0.113.88 -j DROP\n[+] Active TCP stream to 203.0.113.88:4444 SEVERED!\n[+] Outbound data exfiltration halted instantly.`
      });
      newLogs.push({
        id: `succ_${Date.now()}`,
        type: 'SUCCESS',
        text: `==================================================\n>>> OBJECTIVE COMPLETE: C2 EGRESS CHANNEL BLOCKED! <<<\nFLAG: DEF_FLAG{EGRESS_FIREWALL_RULE_ENFORCED_0x91}`
      });
      setTimeout(() => {
        onSuccess();
      }, 1400);
    } else if (lower.includes('4444') && (lower.includes('drop') || lower.includes('reject'))) {
      sound.playSuccess();
      setIsBlocked(true);
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `[+] Firewall rule committed: OUTPUT -p tcp --dport 4444 -j DROP\n[+] Rogue reverse shell port blocked! Exfiltration terminated.`
      });
      newLogs.push({
        id: `succ_${Date.now()}`,
        type: 'SUCCESS',
        text: `==================================================\n>>> OBJECTIVE COMPLETE: C2 PORT 4444 BLOCKED! <<<\nFLAG: DEF_FLAG{EGRESS_FIREWALL_RULE_ENFORCED_0x91}`
      });
      setTimeout(() => {
        onSuccess();
      }, 1400);
    } else {
      newLogs.push({
        id: `err_${Date.now()}`,
        type: 'ERROR',
        text: `iptables: Command error. Usage: iptables -A OUTPUT -d <IP> -j DROP`
      });
    }

    setLogs(newLogs);
    setInputVal('');
  };

  const handleBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetIp = blockIpInput.trim();
    if (!targetIp) return;

    handleCommand(`iptables -A OUTPUT -d ${targetIp} -j DROP`);
  };

  const handleSelectPacket = (pkt: PacketItem) => {
    sound.playClick();
    setSelectedPacket(pkt);
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
            <span>{showGuide ? 'Hide SOP' : 'Network Guide'}</span>
          </button>
          {isBlocked && (
            <span className="text-[#00FF66] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> THREAT BLOCKED
            </span>
          )}
        </div>
      </div>

      {/* Packet Sniffer & Stream Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs items-stretch">
        {/* Left: Packet Stream List */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-xl border border-green-500/30 bg-black/80 backdrop-blur-md flex flex-col justify-between space-y-3.5 shadow-[0_0_30px_rgba(0,255,102,0.05)]">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-green-500/20 pb-3">
              <span className="font-bold text-white uppercase flex items-center gap-2">
                <Network className="w-4 h-4 text-[#00FF66]" />
                <span>Live Packet Stream (eth0)</span>
              </span>
              <span className="text-[10px] text-green-400/80">5 Packets Captured</span>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {PACKETS.map(pkt => (
                <div
                  key={pkt.id}
                  onClick={() => handleSelectPacket(pkt)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all text-[11px] ${
                    selectedPacket.id === pkt.id
                      ? 'bg-green-950/70 border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.25)]'
                      : pkt.isMalicious
                        ? 'bg-red-950/40 border-red-500/40 hover:bg-red-950/60'
                        : 'bg-black border-green-500/15 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{pkt.timestamp}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pkt.isMalicious ? 'bg-red-950 text-[#FF3366] border border-red-500/50' : 'bg-black text-slate-300 border border-slate-800'
                    }`}>
                      {pkt.protocol}
                    </span>
                  </div>
                  <div className="text-white mt-1 font-semibold">
                    {pkt.sourceIp}:{pkt.sourcePort} → {pkt.destIp}:{pkt.destPort}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{pkt.payload}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-green-500/20 text-[10px] text-slate-400">
            Click any packet in stream to inspect full headers and payload.
          </div>
        </div>

        {/* Right: Deep Packet Dissection & Firewall Execution */}
        <div className="lg:col-span-5 p-4 sm:p-5 rounded-xl border border-green-500/30 bg-black/80 backdrop-blur-md space-y-3.5 flex flex-col justify-between shadow-[0_0_30px_rgba(0,255,102,0.05)]">
          <div>
            <div className="flex items-center justify-between border-b border-green-500/20 pb-3 text-xs font-bold text-white uppercase">
              <Eye className="w-4 h-4 text-[#00FF66]" />
              <span>Packet Header Inspector</span>
            </div>

            <div className="mt-3 space-y-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-black border border-green-500/20 space-y-1">
                <div className="text-green-400/80">IPv4 Layer:</div>
                <div className="text-white">Source: <strong className="text-[#00E5FF]">{selectedPacket.sourceIp}</strong></div>
                <div className="text-white">Destination: <strong className={selectedPacket.isMalicious ? 'text-[#FF3366] font-bold' : 'text-slate-200'}>{selectedPacket.destIp}</strong></div>
              </div>

              <div className="p-2.5 rounded-lg bg-black border border-green-500/20 space-y-1">
                <div className="text-green-400/80">Transport Layer:</div>
                <div className="text-white">Protocol: {selectedPacket.protocol} | Flags: {selectedPacket.flags}</div>
                <div className="text-white">Target Port: <strong className={selectedPacket.destPort === 4444 ? 'text-[#FF3366] font-bold' : 'text-slate-200'}>{selectedPacket.destPort}</strong></div>
              </div>

              <div className="p-2.5 rounded-lg bg-black border border-green-500/20 space-y-1">
                <div className="text-green-400/80">Data Stream Payload:</div>
                <div className={`break-all ${selectedPacket.isMalicious ? 'text-[#FF3366] font-bold' : 'text-slate-300'}`}>
                  {selectedPacket.payload}
                </div>
              </div>
            </div>
          </div>

          {/* Firewall Block Form */}
          <form onSubmit={handleBlockSubmit} className="pt-3 border-t border-green-500/20 space-y-2">
            <label className="block text-slate-300 font-bold text-[11px]">
              Enter Malicious IP to Block:
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={blockIpInput}
                onChange={(e) => setBlockIpInput(e.target.value)}
                placeholder="e.g. 203.0.113.88"
                className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-black border border-green-500/30 focus:border-[#00FF66] text-[#00FF66] font-mono text-xs focus:outline-none placeholder:text-slate-600 transition-colors"
              />
              <button
                type="submit"
                className="min-h-[38px] px-3.5 py-2 rounded-lg bg-[#FF3366] hover:bg-[#e02b5a] text-white font-mono font-bold text-xs uppercase shadow-[0_0_15px_rgba(255,51,102,0.4)] transition-all shrink-0"
              >
                Execute Block
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Guide */}
      {showGuide && (
        <div className="p-4 rounded-xl bg-black/90 border border-green-500/30 text-xs font-mono text-slate-300 space-y-2 animate-in fade-in duration-150">
          <div className="font-bold text-[#00FF66] uppercase">Network Threat Hunting & iptables Guide:</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Standard protocols use well-known ports (DNS: 53, HTTPS: 443). High unprivileged outbound ports like <code className="text-amber-300">4444</code> transmitting raw sensitive database strings are typical indicators of a reverse shell C2 beacon.
          </p>
          <div className="p-2.5 rounded bg-black border border-green-500/20 text-[11px]">
            <strong className="text-white block mb-1">iptables Egress Block Syntax:</strong>
            <code className="text-[#00FF66] block">iptables -A OUTPUT -d &lt;IP&gt; -j DROP</code>
          </div>
        </div>
      )}

      {/* Terminal Window */}
      <div className="rounded-xl border border-green-500/30 bg-black/90 shadow-[0_0_35px_rgba(0,255,102,0.08)] overflow-hidden font-mono text-xs backdrop-blur-md">
        <div className="px-4 py-2.5 bg-black/95 border-b border-green-500/20 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] inline-block" />
            <span className="text-white font-bold">root@firewall-gateway:~#</span>
          </div>
          <span className="text-[10px] text-green-400/60">PERIMETER FIREWALL SHELL</span>
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
          <span className="text-[#00E5FF] font-bold text-xs shrink-0 hidden sm:inline">root@firewall-gateway:~#</span>
          <span className="text-[#00E5FF] font-bold text-xs shrink-0 sm:hidden">root@fw:~#</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type command (e.g. iptables -A OUTPUT -d <IP> -j DROP)..."
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
