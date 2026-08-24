export type PillPath = 'RED' | 'BLUE';

export type MissionDifficulty = 'BEGINNER' | 'EASY' | 'INTERMEDIATE' | 'ADVANCED';

export type MissionType = 
  | 'TERMINAL_EXPLORATION'
  | 'PERMISSIONS_SANDBOX'
  | 'PORT_RECON'
  | 'PACKET_INJECTION'
  | 'EXPLOIT_SANDBOX'
  | 'MULTI_STEP_OPERATION'
  | 'KILL_CHAIN_INTRUSION'
  | 'PROCESS_INVESTIGATION'
  | 'LOG_ANALYSIS'
  | 'NETWORK_TRAFFIC'
  | 'TRAFFIC_INTERCEPTION'
  | 'INCIDENT_RESPONSE'
  | 'SOC_INVESTIGATION'
  | 'INCIDENT_COMMAND_MATRIX';

export interface FileItem {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  permissions?: string;
  owner?: string;
  isHidden?: boolean;
}

export interface DirectoryNode {
  path: string;
  files: FileItem[];
}

export interface NetworkService {
  port: number;
  protocol: 'TCP' | 'UDP';
  service: string;
  version: string;
  status: 'OPEN' | 'FILTERED' | 'CLOSED';
  isVulnerable?: boolean;
  description: string;
  vulnerabilityDetails?: string;
}

export interface ProcessItem {
  pid: number;
  name: string;
  user: string;
  cpu: string;
  mem: string;
  path: string;
  parentPid: number;
  isSuspicious: boolean;
  notes: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  service: string;
  ip: string;
  user: string;
  status: 'SUCCESS' | 'FAILED' | 'WARN' | 'INFO';
  message: string;
  isThreat?: boolean;
}

export interface PacketItem {
  id: string;
  timestamp: string;
  sourceIp: string;
  sourcePort: number;
  destIp: string;
  destPort: number;
  protocol: string;
  payload: string;
  flags: string;
  isMalicious: boolean;
}

export interface IncidentChoice {
  id: string;
  title: string;
  description: string;
  isCorrect: boolean;
  consequence: string;
  teachingNote: string;
}

export interface IncidentStage {
  stageNumber: number;
  title: string;
  situation: string;
  choices: IncidentChoice[];
}

export interface MissionData {
  id: string;
  path: PillPath;
  level: number;
  title: string;
  subtitle: string;
  shortObjective: string;
  difficulty: MissionDifficulty;
  type: MissionType;
  conceptName: string;
  conceptTags?: string[];
  objectiveLabel?: string;
  
  briefing: {
    overview: string;
    scenario: string;
    objectiveText: string;
    keyPrerequisiteKnowledge: string[];
    hint?: string;
  };

  // Specific simulation payload data
  terminalData?: {
    initialPath: string;
    promptUser: string;
    promptHost: string;
    targetFlagOrFile: string;
    filesystem: Record<string, DirectoryNode>;
    customCommandEvaluator?: string;
  };

  servicesData?: NetworkService[];
  processesData?: ProcessItem[];
  logsData?: LogEntry[];
  networkData?: {
    packets: PacketItem[];
    targetSuspiciousIp: string;
    targetExfiltratedFile: string;
  };

  exploitData?: {
    targetUrl: string;
    vulnerableParameter: string;
    options: Array<{
      id: string;
      label: string;
      payload: string;
      isExploit: boolean;
      output: string;
      explanation: string;
    }>;
  };

  incidentStages?: IncidentStage[];

  debrief: {
    conceptSummary: string;
    whyItWorked: string;
    realWorldRelevance: string;
    keyTakeaway: string;
    mistakeAnalysis?: string;
  };
}

export interface PlayerSettings {
  soundEnabled: boolean;
  reducedMotion: boolean;
  fontSize: 'sm' | 'base' | 'lg';
}

export interface PlayerProgress {
  userName?: string;
  completedRedLevels: string[]; // e.g. ['red-1', 'red-2']
  completedBlueLevels: string[]; // e.g. ['blue-1']
  unlockedRedLevel: number; // 1 to 5
  unlockedBlueLevel: number; // 1 to 5
  lastPlayedPath: PillPath;
  isSuperuserActive?: boolean;
  settings: PlayerSettings;
}
