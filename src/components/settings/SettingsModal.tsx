import React, { useState } from 'react';
import { PlayerProgress } from '../../types/cyberlab';
import { resetPlayerProgress, savePlayerProgress } from '../../utils/storage';
import { X, Volume2, VolumeX, RotateCcw, Terminal, Key, ShieldCheck, Check, AlertCircle, Zap } from 'lucide-react';
import { sound } from '../../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  playerProgress: PlayerProgress;
  onClose: () => void;
  onUpdateProgress: (newProgress: PlayerProgress) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  playerProgress,
  onClose,
  onUpdateProgress
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [passcodeSuccess, setPasscodeSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSuperuser = playerProgress.isSuperuserActive ?? false;

  const handleToggleSound = () => {
    const newVal = !playerProgress.settings.soundEnabled;
    sound.setEnabled(newVal);
    if (newVal) sound.playClick();

    const updated: PlayerProgress = {
      ...playerProgress,
      settings: {
        ...playerProgress.settings,
        soundEnabled: newVal
      }
    };
    onUpdateProgress(updated);
    savePlayerProgress(updated);
  };

  const handleUnlockSuperuser = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcodeInput.trim().toLowerCase();
    const validSignatures = ['umer', 'umer khan'];

    if (validSignatures.includes(clean)) {
      sound.playAccessGranted();
      setPasscodeError(null);
      setPasscodeSuccess('[+] ROOT CLEARANCE GRANTED');
      
      const updated: PlayerProgress = {
        ...playerProgress,
        isSuperuserActive: true
      };
      onUpdateProgress(updated);
      savePlayerProgress(updated);
      setPasscodeInput('');
    } else {
      sound.playAlert();
      setPasscodeSuccess(null);
      setPasscodeError('[-] ACCESS DENIED: INVALID SIGNATURE');
    }
  };

  const handleDisableSuperuser = () => {
    sound.playClick();
    setPasscodeSuccess(null);
    setPasscodeError(null);

    const updated: PlayerProgress = {
      ...playerProgress,
      isSuperuserActive: false
    };
    onUpdateProgress(updated);
    savePlayerProgress(updated);
  };

  const handleResetData = () => {
    sound.playAlert();
    const fresh = resetPlayerProgress();
    onUpdateProgress(fresh);
    setConfirmReset(false);
    setPasscodeError(null);
    setPasscodeSuccess(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border border-green-500/30 bg-black/95 p-5 sm:p-6 shadow-[0_0_40px_rgba(0,255,102,0.15)] text-left space-y-5 no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-green-500/20 pb-3 sticky top-0 bg-black/95 z-10">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase">
            <Terminal className="w-4 h-4 text-[#00FF66]" />
            <span className="tracking-wide text-green-400">Terminal Configuration</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="min-h-[36px] min-w-[36px] p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4 font-mono text-xs">
          {/* Sound FX */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/80 border border-green-500/20">
            <div className="flex items-center gap-3">
              {playerProgress.settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#00FF66]" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <span className="font-bold text-white block">Audio & Tactical Sound FX</span>
                <span className="text-[11px] text-slate-400">Web Audio synthesis feedback</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleSound}
              className={`min-h-[36px] px-3 py-1 rounded-lg font-bold uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                playerProgress.settings.soundEnabled
                  ? 'bg-[#00FF66] text-black shadow-[0_0_10px_rgba(0,255,102,0.4)]'
                  : 'bg-black/60 text-slate-400 border border-slate-800'
              }`}
            >
              {playerProgress.settings.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Superuser Bypass (Unlock All Labs) Card */}
          <div className="p-4 rounded-xl bg-black/60 border border-amber-500/30 space-y-3 shadow-[0_0_20px_rgba(245,158,11,0.08)] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold text-amber-300">Superuser Bypass (Unlock All Labs)</span>
              </div>
              {isSuperuser && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>

            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              Finding it too difficult? Enter the developer's name to unlock root clearance.
            </p>

            {isSuperuser ? (
              /* State B: Active Superuser Override */
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/50 text-amber-300 text-[11px] font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <span className="truncate">⚡ ROOT OVERRIDE ACTIVE // ALL LABS UNLOCKED</span>
                </div>

                <button
                  type="button"
                  onClick={handleDisableSuperuser}
                  className="w-full min-h-[38px] px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 hover:border-amber-500/70 text-amber-300 font-bold uppercase tracking-wider text-[11px] transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <span>DISABLE SUPERUSER</span>
                </button>
              </div>
            ) : (
              /* State A: Superuser Disabled (Passcode Form) */
              <form onSubmit={handleUnlockSuperuser} className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-1.5 bg-black/90 border border-amber-500/30 rounded-lg px-2.5 py-1.5 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 min-w-0">
                    <span className="text-amber-500 font-bold text-[11px] shrink-0 select-none">
                      passcode:~$
                    </span>
                    <input
                      type="text"
                      value={passcodeInput}
                      onChange={(e) => {
                        setPasscodeInput(e.target.value);
                        if (passcodeError) setPasscodeError(null);
                        if (passcodeSuccess) setPasscodeSuccess(null);
                      }}
                      placeholder="Enter developer name..."
                      className="w-full bg-transparent text-white font-mono text-[11px] placeholder:text-slate-600 focus:outline-none min-w-0"
                    />
                  </div>

                  <button
                    type="submit"
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase text-[11px] tracking-wider transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] shrink-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <span>UNLOCK</span>
                  </button>
                </div>

                {/* Error Banner */}
                {passcodeError && (
                  <div className="flex items-center gap-1.5 text-[11px] text-red-400 animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passcodeError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {passcodeSuccess && (
                  <div className="flex items-center gap-1.5 text-[11px] text-green-400 animate-in fade-in duration-150">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>{passcodeSuccess}</span>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Reset Progress Section */}
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#FF3366]" />
                <span className="font-bold text-red-300">Reset Local Progress</span>
              </div>

              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="min-h-[36px] px-3 py-1 rounded-lg bg-red-950/80 border border-red-500/50 hover:bg-red-900 text-red-300 text-[11px] font-bold uppercase transition-colors"
                >
                  Clear Data
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleResetData}
                    className="min-h-[36px] px-3 py-1 rounded-lg bg-[#FF3366] text-white font-bold text-[11px] uppercase shadow-[0_0_10px_rgba(255,51,102,0.4)] hover:bg-red-500 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="min-h-[36px] px-2.5 py-1 rounded-lg bg-black text-slate-400 text-[11px] uppercase hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {confirmReset && (
              <p className="text-[11px] text-red-400 font-sans leading-tight">
                Warning: This resets all completed levels on both Red Pill and Blue Pill tracks.
              </p>
            )}
          </div>
        </div>

        {/* Footer Attribution */}
        <div className="pt-2 border-t border-green-500/20 text-center font-mono text-[11px] text-slate-500">
          CYBER LABS — Developed by <strong className="text-green-400">Umer Khan</strong>
        </div>
      </div>
    </div>
  );
};
