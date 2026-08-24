import React, { useState, useRef, useEffect } from 'react';
import { MissionData } from '../../../types/cyberlab';
import { CornerDownLeft, CheckCircle2, Terminal as TermIcon, HelpCircle } from 'lucide-react';
import { sound } from '../../../utils/audio';

interface TerminalSandboxProps {
  mission: MissionData;
  onSuccess: () => void;
}

interface LogLine {
  id: string;
  type: 'CMD' | 'OUTPUT' | 'ERROR' | 'SUCCESS' | 'INFO';
  text: string;
}

export const TerminalSandbox: React.FC<TerminalSandboxProps> = ({
  mission,
  onSuccess
}) => {
  const terminalData = mission.terminalData;
  const [currentPath, setCurrentPath] = useState<string>(terminalData?.initialPath || '/home/operative');
  const [inputVal, setInputVal] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [hasFoundHiddenFile, setHasFoundHiddenFile] = useState(false);

  const [logs, setLogs] = useState<LogLine[]>([
    { id: '1', type: 'INFO', text: '=== CYBER LABS INTERACTIVE TERMINAL v2.5 ===' },
    { id: '2', type: 'INFO', text: `Connected to ${terminalData?.promptHost || 'sandbox'} as user "${terminalData?.promptUser || 'operative'}".` },
    { id: '3', type: 'INFO', text: 'Type "help" to see available Linux commands.' },
    { id: '4', type: 'INFO', text: 'Objective: Explore the filesystem, locate the hidden dotfile, and inspect its contents.' }
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIdx + 1 < history.length ? historyIdx + 1 : historyIdx;
        setHistoryIdx(nextIdx);
        setInputVal(history[history.length - 1 - nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInputVal(history[history.length - 1 - nextIdx] || '');
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInputVal('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabCompletion();
    }
  };

  const handleTabCompletion = () => {
    const fs = terminalData?.filesystem || {};
    const currentDir = fs[currentPath];
    if (!currentDir) return;

    const parts = inputVal.split(' ');
    const lastWord = parts[parts.length - 1] || '';

    const candidates = currentDir.files
      .map(f => f.name)
      .concat(['workspace', 'projects', 'notes.txt', '.secret_config', 'readme.txt'])
      .filter(name => name.toLowerCase().startsWith(lastWord.toLowerCase()) && name !== lastWord);

    if (candidates.length === 1) {
      parts[parts.length - 1] = candidates[0];
      setInputVal(parts.join(' '));
      sound.playKeystroke();
    }
  };

  const handleCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    sound.playKeystroke();
    setHistory(prev => [...prev, cmd]);
    setHistoryIdx(-1);

    const newLogs: LogLine[] = [
      ...logs,
      { id: `cmd_${Date.now()}`, type: 'CMD', text: `${terminalData?.promptUser || 'operative'}@${terminalData?.promptHost || 'box'}:${currentPath}$ ${cmd}` }
    ];

    const parts = cmd.split(' ').filter(Boolean);
    const mainCmd = parts[0].toLowerCase();
    const arg = parts[1];

    const fs = terminalData?.filesystem || {};
    const currentDir = fs[currentPath];

    if (mainCmd === 'help') {
      newLogs.push({
        id: `out_${Date.now()}`,
        type: 'OUTPUT',
        text: `Linux Command Reference:\n  pwd          - Print current working directory path\n  ls           - List visible files in directory\n  ls -a        - List ALL files including hidden dotfiles (starts with .)\n  ls -l        - List files with permissions and file size\n  cd <dir>     - Change directory (e.g. "cd workspace" or "cd ..")\n  cat <file>   - Read and display file contents (e.g. "cat notes.txt")\n  clear        - Clear terminal screen buffer\n  whoami       - Display active shell username`
      });
    } else if (mainCmd === 'whoami') {
      newLogs.push({ id: `out_${Date.now()}`, type: 'OUTPUT', text: terminalData?.promptUser || 'operative' });
    } else if (mainCmd === 'clear') {
      setLogs([]);
      setInputVal('');
      return;
    } else if (mainCmd === 'pwd') {
      newLogs.push({ id: `out_${Date.now()}`, type: 'OUTPUT', text: currentPath });
    } else if (mainCmd === 'ls') {
      const showHidden = parts.includes('-a') || parts.includes('-la') || parts.includes('-al') || parts.includes('-all');
      const showLong = parts.includes('-l') || parts.includes('-la') || parts.includes('-al');

      if (!currentDir) {
        newLogs.push({ id: `err_${Date.now()}`, type: 'ERROR', text: 'Directory not found.' });
      } else {
        if (showHidden) {
          setHasFoundHiddenFile(true);
        }

        if (showLong) {
          const lines = currentDir.files
            .filter(f => showHidden || !f.isHidden)
            .map(f => `${f.permissions || '-rw-r--r--'} 1 operative staff ${f.type === 'directory' ? '4096' : '1024'} Aug 20 12:00 ${f.type === 'directory' ? f.name + '/' : f.name}`)
            .join('\n');
          newLogs.push({ id: `out_${Date.now()}`, type: 'OUTPUT', text: `total ${currentDir.files.length}\n${lines}` });
        } else {
          const fileNames = currentDir.files
            .filter(f => showHidden || !f.isHidden)
            .map(f => (f.type === 'directory' ? `${f.name}/` : f.name))
            .join('   ');
          newLogs.push({ id: `out_${Date.now()}`, type: 'OUTPUT', text: fileNames || '(empty directory)' });
        }

        if (showHidden && currentDir.files.some(f => f.name === '.secret_config')) {
          newLogs.push({
            id: `info_${Date.now()}`,
            type: 'INFO',
            text: '[*] Clue: Found hidden dotfile ".secret_config". Inspect it using "cat .secret_config".'
          });
        }
      }
    } else if (mainCmd === 'cd') {
      if (!arg || arg === '~') {
        setCurrentPath('/home/operative');
      } else if (arg === '..') {
        if (currentPath.includes('/')) {
          const segments = currentPath.split('/').filter(Boolean);
          if (segments.length > 2) {
            segments.pop();
            setCurrentPath('/' + segments.join('/'));
          } else {
            newLogs.push({ id: `err_${Date.now()}`, type: 'ERROR', text: 'Root sandbox limit reached: Cannot navigate above /home/operative' });
          }
        }
      } else {
        const targetPath = `${currentPath}/${arg.replace(/^\//, '')}`.replace(/\/+/g, '/');
        const resolvedPath = arg.startsWith('/') ? arg : targetPath;
        if (fs[resolvedPath]) {
          setCurrentPath(resolvedPath);
        } else {
          newLogs.push({ id: `err_${Date.now()}`, type: 'ERROR', text: `bash: cd: ${arg}: No such file or directory` });
        }
      }
    } else if (mainCmd === 'cat') {
      if (!arg) {
        newLogs.push({ id: `err_${Date.now()}`, type: 'ERROR', text: 'Usage: cat <filename> (e.g. cat notes.txt or cat .secret_config)' });
      } else {
        const targetFileName = arg.split('/').pop() || arg;
        const file = currentDir?.files.find(f => f.name === targetFileName);

        if (!file) {
          newLogs.push({ id: `err_${Date.now()}`, type: 'ERROR', text: `cat: ${arg}: No such file or directory. Check directory with "ls" or "ls -a".` });
        } else if (file.type === 'directory') {
          newLogs.push({ id: `err_${Date.now()}`, type: 'ERROR', text: `cat: ${arg}: Is a directory. Use "cd ${arg}" instead.` });
        } else {
          newLogs.push({ id: `out_${Date.now()}`, type: 'OUTPUT', text: file.content || '' });

          if (file.name === '.secret_config') {
            setIsCompleted(true);
            sound.playSuccess();
            newLogs.push({
              id: `succ_${Date.now()}`,
              type: 'SUCCESS',
              text: '==================================================\n>>> MISSION OBJECTIVE COMPLETE! HIDDEN FLAG CAPTURED! <<<\nFLAG: SECRET{LINUX_DOTFILES_REVEALED_9021}'
            });
            setTimeout(() => {
              onSuccess();
            }, 1400);
          }
        }
      }
    } else {
      newLogs.push({
        id: `err_${Date.now()}`,
        type: 'ERROR',
        text: `bash: ${cmd}: command not found. Type "help" to see available terminal commands.`
      });
    }

    setLogs(newLogs);
    setInputVal('');
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 text-left space-y-4 font-mono">
      {/* Objective Reminder Pill */}
      <div className="p-3.5 rounded-xl border border-red-500/40 bg-black/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366] animate-pulse" />
          <span className="text-[#FF3366] font-bold uppercase">TARGET OBJECTIVE:</span>
          <span className="text-slate-300">{mission.shortObjective}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCheatSheet(!showCheatSheet)}
            className="min-h-[32px] px-2.5 py-1 rounded bg-black/80 border border-green-500/30 text-green-400 hover:text-white hover:border-green-400 text-[11px] flex items-center gap-1.5 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>{showCheatSheet ? 'Hide SOP' : 'Bash Guide'}</span>
          </button>
          {isCompleted && (
            <span className="text-[#00FF66] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> SUCCESS
            </span>
          )}
        </div>
      </div>

      {/* Optional Cheat Sheet Panel */}
      {showCheatSheet && (
        <div className="p-4 rounded-xl bg-black/90 border border-green-500/30 text-xs text-slate-300 space-y-2 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-[#00FF66] uppercase flex items-center gap-1.5">
            <TermIcon className="w-3.5 h-3.5" />
            <span>Bash Command Manual:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-black/80 border border-green-500/20">
              <strong className="text-[#00FF66]">ls -a</strong>: Reveals hidden files starting with dot <code className="text-[#FF3366]">.</code>
            </div>
            <div className="p-2 rounded bg-black/80 border border-green-500/20">
              <strong className="text-[#00FF66]">cat &lt;file&gt;</strong>: Prints file contents to terminal stdout
            </div>
            <div className="p-2 rounded bg-black/80 border border-green-500/20">
              <strong className="text-[#00FF66]">cd &lt;folder&gt; / cd ..</strong>: Move between directory levels
            </div>
            <div className="p-2 rounded bg-black/80 border border-green-500/20">
              <strong className="text-[#00FF66]">pwd</strong>: Prints absolute path of active working directory
            </div>
          </div>
        </div>
      )}

      {/* Simulated Terminal Window */}
      <div className="rounded-xl border border-green-500/30 bg-black/90 shadow-[0_0_35px_rgba(0,255,102,0.08)] overflow-hidden font-mono backdrop-blur-md">
        {/* Terminal Title Bar */}
        <div className="px-4 py-2.5 bg-black/95 border-b border-green-500/20 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] inline-block" />
            </div>
            <span className="font-bold text-white ml-2">bash — {currentPath}</span>
          </div>
          <span className="text-[10px] text-green-400/60 hidden sm:inline">interactive shell [tab completion & history enabled]</span>
        </div>

        {/* Terminal Body */}
        <div 
          onClick={() => inputRef.current?.focus()}
          className="p-4 min-h-[340px] max-h-[440px] overflow-y-auto space-y-2 text-xs cursor-text"
        >
          {logs.map((log) => {
            if (log.type === 'CMD') {
              return (
                <div key={log.id} className="text-white font-bold">
                  {log.text}
                </div>
              );
            }
            if (log.type === 'ERROR') {
              return (
                <div key={log.id} className="text-[#FF3366]">
                  {log.text}
                </div>
              );
            }
            if (log.type === 'SUCCESS') {
              return (
                <div key={log.id} className="text-[#00FF66] font-bold bg-green-950/40 p-2.5 rounded border border-green-500/50 whitespace-pre-wrap shadow-[0_0_15px_rgba(0,255,102,0.2)]">
                  {log.text}
                </div>
              );
            }
            if (log.type === 'INFO') {
              return (
                <div key={log.id} className="text-green-400/80">
                  {log.text}
                </div>
              );
            }
            return (
              <pre key={log.id} className="text-[#00E5FF] whitespace-pre-wrap">
                {log.text}
              </pre>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Terminal Input Line */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommand(inputVal);
          }}
          className="px-3 sm:px-4 py-2.5 sm:py-3 bg-black/95 border-t border-green-500/20 flex items-center gap-1.5 sm:gap-2"
        >
          {/* Desktop full prompt */}
          <span className="text-[#FF3366] font-bold text-xs shrink-0 hidden sm:inline">
            {terminalData?.promptUser || 'operative'}@{terminalData?.promptHost || 'box'}:{currentPath}$
          </span>
          {/* Mobile concise prompt */}
          <span className="text-[#FF3366] font-bold text-xs shrink-0 sm:hidden">
            {terminalData?.promptUser || 'operative'}:{currentPath === '/home/operative' ? '~' : currentPath.split('/').pop() || '/'}$
          </span>

          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type command (e.g. ls -a, cat .secret_config)..."
            className="flex-1 min-w-0 bg-transparent text-[#00FF66] font-mono text-xs focus:outline-none placeholder:text-slate-600"
            autoFocus
          />
          <button
            type="submit"
            className="min-h-[34px] min-w-[34px] sm:min-h-[36px] sm:min-w-[36px] p-1.5 sm:p-2 rounded bg-black border border-green-500/30 hover:border-green-400 text-green-400 hover:text-white transition-colors flex items-center justify-center shrink-0"
            aria-label="Execute command"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
