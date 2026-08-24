import React, { useState } from 'react';
import { MissionData } from '../../../types/cyberlab';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, Play, RotateCcw, Activity, HelpCircle, HardDrive, Terminal as TermIcon } from 'lucide-react';
import { sound } from '../../../utils/audio';

interface IncidentResponseLabProps {
  mission: MissionData;
  onSuccess: () => void;
}

interface IncidentStageDecision {
  stageNumber: number;
  stageName: string;
  scenario: string;
  options: Array<{
    id: string;
    label: string;
    command: string;
    isCorrect: boolean;
    evidenceScoreChange: number;
    consequence: string;
    teachingNote: string;
  }>;
}

const STAGES: IncidentStageDecision[] = [
  {
    stageNumber: 1,
    stageName: '1. Identification & Evidence Preservation',
    scenario: 'SOC SIEM triggered a high-severity alert: Unauthorized web shell running in RAM on WEB-NODE-01. What is the immediate first action?',
    options: [
      {
        id: 'opt-1a',
        label: 'Pull physical power cord from the server',
        command: 'poweroff --force',
        isCorrect: false,
        evidenceScoreChange: -40,
        consequence: 'CRITICAL MISTAKE: Powering off wipes volatile RAM contents instantly, destroying in-memory malware artifacts, encryption keys, and active network connections.',
        teachingNote: 'Digital forensics Rule #1: Never power off live RAM without dumping volatile memory.'
      },
      {
        id: 'opt-1b',
        label: 'Capture RAM memory dump and isolate host to quarantine VLAN',
        command: 'dump-ram --format raw && isolate-vlan --host web-node-01',
        isCorrect: true,
        evidenceScoreChange: +25,
        consequence: 'EXCELLENT: Volatile RAM image captured safely for forensic timeline analysis, and network VLAN isolation prevented lateral movement.',
        teachingNote: 'Capturing RAM preserves crucial forensic evidence (injected code, open sockets, decrypted keys).'
      }
    ]
  },
  {
    stageNumber: 2,
    stageName: '2. Containment & Blast Radius',
    scenario: 'The attacker is actively scanning adjacent database nodes from the compromised host. How do you contain the blast radius?',
    options: [
      {
        id: 'opt-2a',
        label: 'Format and reinstall the operating system immediately',
        command: 'mkfs.ext4 /dev/sda1',
        isCorrect: false,
        evidenceScoreChange: -30,
        consequence: 'PREMATURE ACTION: Formatting the disk destroys the forensic timeline and attacker entry logs before root-cause analysis is completed.',
        teachingNote: 'Containment means isolating the threat without destroying evidence.'
      },
      {
        id: 'opt-2b',
        label: 'Apply perimeter micro-segmentation & revoke all compromised API tokens',
        command: 'revoke-tokens --all && firewall-isolate --host web-node-01',
        isCorrect: true,
        evidenceScoreChange: +25,
        consequence: 'SUCCESS: Lateral movement severed. Compromised credentials invalidated without wiping disk logs.',
        teachingNote: 'Revoking active tokens stops the attacker while preserving disk artifacts.'
      }
    ]
  },
  {
    stageNumber: 3,
    stageName: '3. Eradication & Persistence Removal',
    scenario: 'Forensic inspection revealed a persistence cronjob `/etc/cron.d/.update` and a vulnerable unpatched CMS vulnerability (CVE-2024-8812).',
    options: [
      {
        id: 'opt-3a',
        label: 'Delete the persistence cronjob & patch CMS vulnerability to latest secure version',
        command: 'rm /etc/cron.d/.update && patch-cms --version 3.4.1-sec',
        isCorrect: true,
        evidenceScoreChange: +25,
        consequence: 'SUCCESS: Attacker persistence mechanism eradicated and root vulnerability patched.',
        teachingNote: 'Eradication requires eliminating all backdoors AND fixing the entry point.'
      },
      {
        id: 'opt-3b',
        label: 'Just restart the web service container',
        command: 'docker restart web-node-01',
        isCorrect: false,
        evidenceScoreChange: -20,
        consequence: 'FAILURE: The persistence cronjob re-injected the backdoor within 60 seconds.',
        teachingNote: 'Service restarts do not clean file-based cron persistence or unpatched vulnerabilities.'
      }
    ]
  },
  {
    stageNumber: 4,
    stageName: '4. Recovery & Post-Mortem',
    scenario: 'Threat is neutralized. How do you safely return WEB-NODE-01 to production?',
    options: [
      {
        id: 'opt-4a',
        label: 'Restore from validated pre-infection backup, deploy EDR monitoring, and enforce MFA',
        command: 'restore-backup --verified && deploy-edr --agent sentinel',
        isCorrect: true,
        evidenceScoreChange: +25,
        consequence: 'SUCCESS: Clean recovery established with 24/7 EDR detection and multi-factor authentication.',
        teachingNote: 'Recovery must include hardened telemetry and post-incident verification.'
      },
      {
        id: 'opt-4b',
        label: 'Reconnect the existing server directly back to the public internet',
        command: 'iptables -F',
        isCorrect: false,
        evidenceScoreChange: -25,
        consequence: 'RISK: Re-exposing an unverified system invites re-infection.',
        teachingNote: 'Always verify recovery from known-clean golden images with telemetry in place.'
      }
    ]
  }
];

export const IncidentResponseLab: React.FC<IncidentResponseLabProps> = ({
  mission,
  onSuccess
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [evidenceIntegrity, setEvidenceIntegrity] = useState(100);
  const [stageFeedback, setStageFeedback] = useState<string | null>(null);
  const [isStagePassed, setIsStagePassed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<string[]>([
    '[*] INCIDENT COMMAND CENTER INITIALIZED.',
    '[*] Threat Case: INC-88219 (Web Server Compromise & Lateral Movement)'
  ]);

  const activeStage = STAGES[currentStageIdx];

  const handleSelectOption = (option: typeof STAGES[0]['options'][0]) => {
    if (option.isCorrect) {
      sound.playShield();
      setIsStagePassed(true);
      setStageFeedback(option.consequence);
      setHistoryLogs(prev => [
        ...prev,
        `$ ${option.command}`,
        `[+] ${option.consequence}`,
        `[*] Lesson: ${option.teachingNote}`
      ]);

      if (currentStageIdx + 1 >= STAGES.length) {
        sound.playSuccess();
        setIsCompleted(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } else {
      sound.playAlert();
      setEvidenceIntegrity(prev => Math.max(10, prev + option.evidenceScoreChange));
      setStageFeedback(option.consequence);
      setHistoryLogs(prev => [
        ...prev,
        `$ ${option.command}`,
        `[!] ERROR: ${option.consequence}`,
        `[*] Remediation: ${option.teachingNote}`
      ]);
    }
  };

  const handleNextStage = () => {
    sound.playClick();
    setIsStagePassed(false);
    setStageFeedback(null);
    setCurrentStageIdx(prev => prev + 1);
  };

  const handleResetLab = () => {
    sound.playClick();
    setCurrentStageIdx(0);
    setEvidenceIntegrity(100);
    setStageFeedback(null);
    setIsStagePassed(false);
    setIsCompleted(false);
    setHistoryLogs(['[*] INCIDENT RESPONSE WORKFLOW RESET.']);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 text-left space-y-4 font-sans">
      {/* Objective Banner */}
      <div className="p-3.5 rounded-xl border border-green-500/40 bg-black/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-pulse" />
          <span className="text-[#00E5FF] font-bold uppercase">INCIDENT COMMAND:</span>
          <span className="text-slate-300">Phase {currentStageIdx + 1} of 4: {activeStage.stageName}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Forensic Integrity:</span>
            <span className={`font-bold ${evidenceIntegrity >= 70 ? 'text-[#00FF66]' : 'text-[#FF3366]'}`}>
              {evidenceIntegrity}%
            </span>
          </div>
          {isCompleted && (
            <span className="text-[#00FF66] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> INCIDENT RESOLVED
            </span>
          )}
        </div>
      </div>

      {/* Decision War Room Card */}
      <div className="p-4 sm:p-5 rounded-xl border border-green-500/30 bg-black/80 backdrop-blur-md space-y-4 font-mono text-xs shadow-[0_0_30px_rgba(0,255,102,0.05)]">
        <div className="flex items-center justify-between border-b border-green-500/20 pb-3">
          <div className="flex items-center gap-2 text-white font-bold uppercase">
            <Activity className="w-4 h-4 text-[#00FF66]" />
            <span>{activeStage.stageName}</span>
          </div>
          <span className="text-green-400/70 text-[11px]">NIST SP 800-61 Lifecycle</span>
        </div>

        {/* Scenario Brief */}
        <div className="p-3.5 rounded-lg bg-black border border-green-500/20 text-slate-200 leading-relaxed">
          <span className="text-[#00FF66] font-bold block mb-1">SITUATION TELEMETRY:</span>
          {activeStage.scenario}
        </div>

        {/* Tactical Response Choices */}
        <div className="space-y-2.5">
          <span className="text-slate-300 font-bold block uppercase text-[11px]">
            Choose Forensic Course of Action:
          </span>
          {activeStage.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectOption(opt)}
              disabled={isStagePassed}
              className={`w-full min-h-[48px] p-3.5 rounded-lg border text-left transition-all ${
                isStagePassed && opt.isCorrect
                  ? 'bg-green-950/70 border-[#00FF66] text-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.25)]'
                  : 'bg-black hover:bg-slate-900 border-green-500/20 hover:border-green-400 text-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-bold text-white mb-1">
                <span>{opt.label}</span>
                <code className="text-[11px] text-[#00E5FF] font-normal">$ {opt.command}</code>
              </div>
            </button>
          ))}
        </div>

        {/* Consequence / Feedback Box */}
        {stageFeedback && (
          <div className={`p-4 rounded-lg border leading-relaxed ${
            isStagePassed
              ? 'bg-green-950/40 border-green-500/50 text-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.2)]'
              : 'bg-red-950/40 border-red-500/50 text-[#FF3366] shadow-[0_0_15px_rgba(255,51,102,0.2)]'
          }`}>
            <div className="font-bold mb-1 flex items-center gap-1.5">
              {isStagePassed ? <CheckCircle2 className="w-4 h-4 text-[#00FF66]" /> : <AlertTriangle className="w-4 h-4 text-[#FF3366]" />}
              <span>{isStagePassed ? 'Decision Certified' : 'Forensic Warning'}</span>
            </div>
            <p className="text-[11px] text-slate-200">{stageFeedback}</p>

            {isStagePassed && currentStageIdx + 1 < STAGES.length && (
              <button
                type="button"
                onClick={handleNextStage}
                className="min-h-[36px] mt-3.5 px-4 py-2 rounded-lg bg-[#00FF66] hover:bg-[#00e059] text-black font-bold text-xs uppercase shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all flex items-center gap-1.5"
              >
                <span>Proceed to Stage {currentStageIdx + 2}</span>
                <span>→</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Incident Command Log Stream */}
      <div className="rounded-xl border border-green-500/30 bg-black/90 p-4 sm:p-5 font-mono text-xs min-h-[160px] max-h-[220px] overflow-y-auto space-y-1.5 shadow-[0_0_35px_rgba(0,255,102,0.08)] backdrop-blur-md">
        <div className="text-[10px] text-green-400/70 uppercase font-bold border-b border-green-500/20 pb-2 mb-2.5 flex items-center justify-between">
          <span>Incident Command Audit Log</span>
          <button onClick={handleResetLab} className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] transition-colors">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        {historyLogs.map((line, idx) => (
          <div 
            key={idx}
            className={
              line.startsWith('$')
                ? 'text-white font-bold'
                : line.includes('SUCCESS') || line.includes('EXCELLENT')
                  ? 'text-[#00FF66] font-bold'
                  : line.includes('ERROR') || line.includes('MISTAKE')
                    ? 'text-[#FF3366]'
                    : 'text-slate-400'
            }
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};
