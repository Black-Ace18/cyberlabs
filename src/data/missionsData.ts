import { MissionData } from '../types/cyberlab';

export const RED_MISSIONS: MissionData[] = [
  {
    id: 'red-1',
    path: 'RED',
    level: 1,
    title: 'Terminal Initiation',
    subtitle: 'Navigating Linux Filesystems & Hidden Files',
    shortObjective: 'Explore the terminal to locate and read the hidden configuration file.',
    difficulty: 'BEGINNER',
    type: 'TERMINAL_EXPLORATION',
    conceptName: 'Linux Navigation & Hidden Dotfiles',
    conceptTags: ['Linux CLI', 'Filesystem Navigation', 'Hidden Dotfiles'],
    objectiveLabel: 'Artifacts Recovered: [1 / 1]',
    briefing: {
      overview: 'Every offensive cybersecurity operation begins with orientation in the command line.',
      scenario: 'You have obtained basic shell access to an internal development workstation. The developers left an unencrypted secret key hidden somewhere in their workspace.',
      objectiveText: 'Use basic Linux navigation commands (`pwd`, `ls`, `ls -a`, `cd`, `cat`) to explore directories and find the hidden `.secret_config` file.',
      keyPrerequisiteKnowledge: [
        'pwd: Print Current Working Directory',
        'ls: List files in current folder',
        'ls -a: List ALL files including hidden files (starting with a dot .)',
        'cd <folder>: Change directory into a folder',
        'cat <file>: Read and output file contents'
      ],
      hint: 'In Linux, files starting with a dot (like .env or .secret_config) are hidden from regular "ls". Use "ls -a" to reveal them.'
    },
    terminalData: {
      initialPath: '/home/operative',
      promptUser: 'operative',
      promptHost: 'cyber-sandbox',
      targetFlagOrFile: '.secret_config',
      filesystem: {
        '/home/operative': {
          path: '/home/operative',
          files: [
            { name: 'projects', type: 'directory' },
            { name: 'notes.txt', type: 'file', content: 'Reminder: The server backup key was moved to the /workspace directory.' },
            { name: 'workspace', type: 'directory' }
          ]
        },
        '/home/operative/projects': {
          path: '/home/operative/projects',
          files: [
            { name: 'web_app.js', type: 'file', content: 'console.log("App running on port 3000");' },
            { name: 'readme.md', type: 'file', content: 'Project documentation: check workspace folder for config files.' }
          ]
        },
        '/home/operative/workspace': {
          path: '/home/operative/workspace',
          files: [
            { name: 'index.html', type: 'file', content: '<h1>Internal Staging Portal</h1>' },
            { name: '.secret_config', type: 'file', isHidden: true, content: 'ACCESS_GRANTED: KEY{INITIATION_SUCCESS_9918}' },
            { name: 'style.css', type: 'file', content: 'body { background: #000; }' }
          ]
        }
      }
    },
    debrief: {
      conceptSummary: 'Linux command line is the primary interface for system discovery. Files beginning with a dot (.) are hidden from standard directory listings.',
      whyItWorked: 'By executing `ls -a` inside the `/home/operative/workspace` directory, you revealed the hidden `.secret_config` file and extracted the secret key using `cat`.',
      realWorldRelevance: 'Developers often stash API keys, database credentials, and session tokens in hidden dotfiles (e.g. `.env`, `.gitconfig`, `.aws/credentials`). Finding them is a key step in offensive reconnaissance.',
      keyTakeaway: 'Always remember: in Linux, `ls -a` reveals hidden files that standard directory listings omit.'
    }
  },
  {
    id: 'red-2',
    path: 'RED',
    level: 2,
    title: 'Access & Permissions',
    subtitle: 'Understanding Linux Permissions & Executable Bits',
    shortObjective: 'Diagnose why a script fails to run, modify its permissions, and execute it.',
    difficulty: 'BEGINNER',
    type: 'PERMISSIONS_SANDBOX',
    conceptName: 'Linux File Permissions (rwx) & chmod',
    conceptTags: ['File Permissions', 'Octal Masking', 'chmod Privilege'],
    objectiveLabel: 'Scripts Armed: [1 / 1]',
    briefing: {
      overview: 'In Linux, every file has specific read (r), write (w), and execute (x) permission bits for the owner, group, and others.',
      scenario: 'You found an automated reconnaissance script `recon_scanner.sh` on the system, but when you attempt to run it with `./recon_scanner.sh`, the system responds with "Permission denied".',
      objectiveText: 'Inspect the permission flags with `ls -l`, apply execution rights using `chmod +x recon_scanner.sh`, and run the script.',
      keyPrerequisiteKnowledge: [
        'r (Read = 4): Allows viewing file content',
        'w (Write = 2): Allows modifying file content',
        'x (Execute = 1): Allows running the file as a program or script',
        'chmod +x <file>: Adds execute permissions to a file',
        'chmod 755 <file>: Sets rwx for owner, rx for group and others'
      ],
      hint: 'If a file lacks the "x" (executable) flag, the OS refuses to execute it. Use "chmod +x <filename>" to grant execution permission.'
    },
    terminalData: {
      initialPath: '/opt/tools',
      promptUser: 'operative',
      promptHost: 'cyber-sandbox',
      targetFlagOrFile: 'recon_scanner.sh',
      filesystem: {
        '/opt/tools': {
          path: '/opt/tools',
          files: [
            { name: 'readme.txt', type: 'file', permissions: '-rw-r--r--', owner: 'operative', content: 'Use recon_scanner.sh to extract internal network telemetry.' },
            { name: 'recon_scanner.sh', type: 'file', permissions: '-rw-r--r--', owner: 'operative', content: '#!/bin/bash\necho "Running internal recon..."\necho "Extracted Token: KEY{CHMOD_EXECUTABLE_7731}"' },
            { name: 'system_info.log', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: 'Kernel: Linux 6.1.0-amd64' }
          ]
        }
      }
    },
    debrief: {
      conceptSummary: 'Linux security enforces least-privilege permissions. Scripts cannot be executed unless the execute flag `x` is explicitly enabled on the file.',
      whyItWorked: 'The script originally had `-rw-r--r--` (Read and Write only). Running `chmod +x recon_scanner.sh` changed the flags to `-rwxr-xr-x`, allowing the shell to execute the script.',
      realWorldRelevance: 'Misconfigured file permissions allow unprivileged users to execute dangerous scripts or modify system files. Security audits regularly scan for over-permissive files.',
      keyTakeaway: 'Permissions control access: without `x`, a script cannot execute; with excessive write permissions (`777`), anyone can alter your code.'
    }
  },
  {
    id: 'red-3',
    path: 'RED',
    level: 3,
    title: 'Exploitation Basics',
    subtitle: 'Understanding Input Flaws: Vulnerability → Input → Effect',
    shortObjective: 'Test different input vectors to trigger a vulnerability and observe the resulting effect.',
    difficulty: 'EASY',
    type: 'EXPLOIT_SANDBOX',
    conceptName: 'Input Validation Vulnerabilities & Injection',
    conceptTags: ['SQL Injection', 'Input Sanitization', 'Tautology Bypass'],
    objectiveLabel: 'Payloads Tested: [1 / 1]',
    briefing: {
      overview: 'Vulnerabilities occur when applications blindly trust user input and concatenate it directly into commands or database queries.',
      scenario: 'You are targeting a search endpoint `https://portal.corp/api/lookup?user=<input>`. The backend executes a direct query without sanitizing special characters.',
      objectiveText: 'Select and inject different payload inputs to see how benign input behaves versus an injection attack that alters the execution logic.',
      keyPrerequisiteKnowledge: [
        'Benign Input: Normal text like "john" or "alice"',
        'Special Characters: Quotes (\', "), semicolons (;), and comment markers (-- or #) change how code is parsed',
        'Tautology: An expression that is always true (e.g. "OR 1=1")',
        'Vulnerability Mechanism: Mixing user data with program code instructions'
      ],
      hint: 'An injection payload uses special characters (like quotes or comments) to break out of the intended data field and trick the parser into executing attacker logic.'
    },
    exploitData: {
      targetUrl: 'https://portal.corp/api/lookup?user=',
      vulnerableParameter: 'user',
      options: [
        {
          id: 'pay_1',
          label: 'Standard Benign Input (Normal User)',
          payload: 'sarah',
          isExploit: false,
          output: 'Status: 200 OK\nQuery Executed: SELECT * FROM users WHERE username = \'sarah\'\nResult: 1 record returned [User: Sarah | Role: Employee]',
          explanation: 'Normal search query. The input "sarah" stays within the quotes as intended literal data.'
        },
        {
          id: 'pay_2',
          label: 'Single Quote Syntax Probe',
          payload: 'sarah\'',
          isExploit: false,
          output: 'Status: 500 Internal Server Error\nError: Unclosed quotation mark after the character string \'\'\nQuery: SELECT * FROM users WHERE username = \'sarah\'\'',
          explanation: 'The unescaped quote broke the SQL syntax, causing a database syntax error. This proves the input is directly concatenated without sanitization!'
        },
        {
          id: 'pay_3',
          label: 'SQL Logic Tautology Bypass',
          payload: 'admin\' OR \'1\'=\'1\' --',
          isExploit: true,
          output: 'Status: 200 OK — VULNERABILITY EXPLOITED!\nQuery Executed: SELECT * FROM users WHERE username = \'admin\' OR \'1\'=\'1\' --\'\nReturned: ALL 48 SYSTEM ACCOUNTS DUMPED!\nSuperuser Token: KEY{INJECTION_TAUTOLOGY_BYPASS_8841}',
          explanation: 'The payload closed the username quote, added the always-true condition "OR 1=1", and commented out the rest of the query. The database returned all accounts!'
        }
      ]
    },
    debrief: {
      conceptSummary: 'Injection occurs when untrusted user input is interpreted by an interpreter (SQL, shell, or DOM) as program code rather than passive text.',
      whyItWorked: 'By inserting `admin\' OR \'1\'=\'1\' --`, the query condition evaluated to true for every single row in the database table regardless of the username.',
      realWorldRelevance: 'SQL Injection has ranked among the OWASP Top 10 vulnerabilities for over two decades and has resulted in the theft of billions of user records.',
      keyTakeaway: 'Never concatenate user input into queries or system commands. Use Parameterized Queries (Prepared Statements).'
    }
  },
  {
    id: 'red-4',
    path: 'RED',
    level: 4,
    title: 'PACKET INJECTION',
    subtitle: 'Traffic Interception & Dynamic Payload Injection',
    shortObjective: 'Inspect live data streams lacking SSL, tamper headers to HTTP, and inject shell payloads.',
    difficulty: 'INTERMEDIATE',
    type: 'PACKET_INJECTION',
    conceptName: 'Traffic Interception & Payload Injection',
    conceptTags: ['Traffic Interception', 'Payload Injection', 'Protocol Exploitation'],
    objectiveLabel: 'Payloads Injected: [X / 3]',
    briefing: {
      overview: 'Unencrypted network protocols transmit data in cleartext across physical and wireless conduits, enabling Adversary-in-the-Middle (AitM) packet sniffing and header tampering.',
      scenario: 'You have positioned an offensive C2 interception proxy along the network conduit leading to the Target Core Server. Unencrypted raw telemetry is flowing without SSL encryption.',
      objectiveText: 'Inspect the live packet stream in real time. Identify 3 unencrypted transmission frames lacking SSL certificates, tamper protocol headers to HTTP, and inject malicious shell payloads within 25 seconds before frames reach the core server.',
      keyPrerequisiteKnowledge: [
        'HTTP (Port 80): Unencrypted cleartext protocol vulnerable to inline header tampering and payload injection',
        'TLS/HTTPS (Port 443): Cryptographically signed traffic protected by SSL/TLS certificates',
        'DNS (Port 53): UDP name resolution requests containing domain lookups',
        'Packet Tampering: Modifying raw header fields and replacing payload bytes with exploit shellcode in transit'
      ],
      hint: 'Target unencrypted frames lacking SSL certificates. Set protocol header to HTTP and execute payload injection.'
    },
    debrief: {
      conceptSummary: 'Packet injection exploits unencrypted communication channels by altering packet contents in transit before they reach the destination socket.',
      whyItWorked: 'Because the target application transmitted data without SSL/TLS encryption, your C2 interception proxy was able to tamper protocol headers and inject shellcode payloads directly into the live TCP stream.',
      realWorldRelevance: 'Plaintext network traffic remains a severe threat across legacy OT/SCADA systems, open Wi-Fi networks, and misconfigured microservices. This is why TLS encryption everywhere is standard protocol.',
      keyTakeaway: 'Always enforce end-to-end TLS encryption: unencrypted packets can be sniffed and modified by any adversary positioned along the network route.'
    }
  },
  {
    id: 'red-5',
    path: 'RED',
    level: 5,
    title: 'KALI LINUX WI-FI PENETRATION',
    subtitle: 'Aircrack-ng Handshake Capture & WPA2 Dictionary Attack',
    shortObjective: 'Operate a Kali Linux terminal to sniff beacon traffic, capture the WPA2 handshake, and crack the PSK.',
    difficulty: 'ADVANCED',
    type: 'KILL_CHAIN_INTRUSION',
    conceptName: '802.11 Pentesting & Handshake Cracking',
    conceptTags: ['Kali Linux', 'Aircrack-ng', 'Deauth Attack', 'WPA2 Cracking'],
    objectiveLabel: 'Attack Steps: [X / 5]',
    briefing: {
      overview: 'Wi-Fi penetration testing tests the physical and RF perimeter of an organization. By forcing 802.11 monitor mode, an attacker can capture the 4-way EAPOL cryptographic handshake exchange between access points and connected client stations, then conduct offline dictionary cracking against the Pre-Shared Key (PSK).',
      scenario: 'You are deployed on an authorized Red Team engagement against Target_Corp. Positioned within wireless range with an Atheros dual-band adapter on Kali Linux, your objective is to infiltrate the corporate WPA2-PSK network.',
      objectiveText: 'Execute the 5-step Aircrack-ng attack chain sequentially inside your virtual Kali Linux terminal: Enable Monitor Mode (airmon-ng) ➔ Scan Spectrum (airodump-ng) ➔ Sniff BSSID Handshake (airodump-ng) ➔ Deauthenticate Station (aireplay-ng) ➔ Offline Dictionary Attack (aircrack-ng).',
      keyPrerequisiteKnowledge: [
        'Step 1 - Monitor Mode: Places the wireless NIC into RF listening mode to intercept all local 802.11 frames regardless of destination MAC.',
        'Step 2 - Spectrum Reconnaissance: Identifies BSSIDs, operating channels, encryption standards (WPA2-CCMP), and connected clients.',
        'Step 3 & 4 - Deauthentication & 4-Way Handshake: Forces a client to disconnect; upon reconnection, the 4-way EAPOL key exchange is recorded to disk.',
        'Step 5 - PBKDF2 Dictionary Attack: Uses wordlists to compute pairwise transient keys (PTK) offline until the valid PSK passphrase is recovered.'
      ],
      hint: 'Type your commands directly into the virtual Kali bash prompt. If you need syntax guidance, click the "Need a Hint? (Intel Manual)" button.'
    },
    debrief: {
      conceptSummary: 'WPA/WPA2-PSK networks rely on a 4-way handshake to establish session keys. When captured, this handshake can be cracked offline without sending any further packets to the target network.',
      whyItWorked: 'By transmitting spoofed 802.11 deauthentication frames, the client disconnected and re-authenticated, exposing the 4-way EAPOL exchange. Aircrack-ng then matched the passphrase in wordlist.txt.',
      realWorldRelevance: 'Weak Wi-Fi passwords and legacy WPA2-PSK protocols allow nearby adversaries to breach corporate networks. Enterprise security mandates WPA3 with Protected Management Frames (PMF) and 802.1X EAP authentication.',
      keyTakeaway: 'Enforce strong passphrase entropy or upgrade to WPA3-Enterprise with 802.1X; activate 802.11w Protected Management Frames (PMF) to mitigate wireless deauthentication attacks.'
    }
  }
];

export const BLUE_MISSIONS: MissionData[] = [
  {
    id: 'blue-1',
    path: 'BLUE',
    level: 1,
    title: 'System Watch',
    subtitle: 'Process Inspection & Identifying Rogue Daemons',
    shortObjective: 'Inspect active system processes and terminate the suspicious rogue background daemon.',
    difficulty: 'BEGINNER',
    type: 'PROCESS_INVESTIGATION',
    conceptName: 'Process Monitoring, PIDs & Baseline Behavior',
    conceptTags: ['Process Forensics', 'PID Inspection', 'Malware Detection'],
    objectiveLabel: 'Daemons Neutralized: [1 / 1]',
    briefing: {
      overview: 'Defensive analysts monitor running processes to ensure unauthorized programs or malware are not executing on hosts.',
      scenario: 'High CPU usage alerts have triggered on web server `srv-app-01`. You must inspect the process table, examine process names, paths, and parent PIDs, and kill the rogue process.',
      objectiveText: 'Review the running processes table, identify the malicious process disguised as a system service, and terminate it.',
      keyPrerequisiteKnowledge: [
        'PID (Process ID): Unique number assigned to each running program',
        'PPID (Parent PID): The process that launched this process',
        'Legitimate paths: Standard binaries run from `/usr/bin/`, `/usr/sbin/`, or `/lib/systemd/`',
        'Suspicious paths: Malware often hides in `/tmp/`, `/dev/shm/`, or hidden folders like `/var/tmp/.hidden/`'
      ],
      hint: 'Legitimate system processes run from system directories. Look for processes running from temporary folders like /tmp/ with unusually high CPU usage.'
    },
    processesData: [
      {
        pid: 1,
        name: 'systemd',
        user: 'root',
        cpu: '0.1%',
        mem: '12 MB',
        path: '/sbin/init',
        parentPid: 0,
        isSuspicious: false,
        notes: 'Core Linux system and service manager. Normal.'
      },
      {
        pid: 842,
        name: 'sshd',
        user: 'root',
        cpu: '0.0%',
        mem: '8 MB',
        path: '/usr/sbin/sshd',
        parentPid: 1,
        isSuspicious: false,
        notes: 'OpenSSH server daemon for administrative logins. Normal.'
      },
      {
        pid: 1204,
        name: 'nginx: master process',
        user: 'www-data',
        cpu: '1.2%',
        mem: '45 MB',
        path: '/usr/sbin/nginx',
        parentPid: 1,
        isSuspicious: false,
        notes: 'Primary web server listening on port 80/443. Normal.'
      },
      {
        pid: 9942,
        name: 'kworker_sys_update',
        user: 'www-data',
        cpu: '98.4%',
        mem: '512 MB',
        path: '/tmp/.hidden_bin/xm_miner',
        parentPid: 1204,
        isSuspicious: true,
        notes: 'SUSPICIOUS: Running from /tmp/ with 98% CPU usage. Disguised name attempting to mimic Linux kernel threads (kworker)!'
      }
    ],
    debrief: {
      conceptSummary: 'Process monitoring compares running binaries against established baselines to detect anomalous or unauthorized execution.',
      whyItWorked: 'You identified PID 9942 (`kworker_sys_update`) running from `/tmp/.hidden_bin/xm_miner` consuming 98.4% CPU and terminated it.',
      realWorldRelevance: 'Cryptominers and reverse shell backdoors frequently masquerade as legitimate kernel processes (`kworker`, `systemd-resolve`) while executing from world-writable `/tmp` directories.',
      keyTakeaway: 'Always verify process paths and parentage: a real kernel worker never executes from a `/tmp/` directory or runs under the `www-data` web user.'
    }
  },
  {
    id: 'blue-2',
    path: 'BLUE',
    level: 2,
    title: 'Log Hunt',
    subtitle: 'Authentication Log Forensics & Brute-Force Detection',
    shortObjective: 'Analyze authentication logs to identify a brute-force attack pattern and flag the attacker IP.',
    difficulty: 'BEGINNER',
    type: 'LOG_ANALYSIS',
    conceptName: 'Log Auditing, Authentication Events & Brute-Force Patterns',
    conceptTags: ['SIEM Auditing', 'Auth Forensics', 'Brute-Force Detection'],
    objectiveLabel: 'Threats Flagged: [1 / 1]',
    briefing: {
      overview: 'System logs record timestamped events. Security analysts inspect authentication logs (`/var/log/auth.log`) to uncover unauthorized access attempts.',
      scenario: 'An alert indicates abnormal authentication volume on the corporate SSH gateway. You need to analyze the log entries to identify the attacking IP and the compromised account.',
      objectiveText: 'Search through the log entries, identify the IP performing repeated rapid failed login attempts that culminate in a breach, and report the threat.',
      keyPrerequisiteKnowledge: [
        'Failed Login: Logged as "Failed password for <user> from <ip>"',
        'Brute-Force Pattern: High frequency of failed logins within seconds from the same source IP',
        'Compromised Account: Consecutive failed logins followed immediately by "Accepted password"'
      ],
      hint: 'Look for an IP address with dozens of failed password attempts across multiple usernames that eventually gains successful access.'
    },
    logsData: [
      {
        id: 'log_1',
        timestamp: '14:20:01',
        service: 'sshd',
        ip: '192.168.1.15',
        user: 'alice',
        status: 'SUCCESS',
        message: 'Accepted publickey for alice from 192.168.1.15 port 52310 ssh2'
      },
      {
        id: 'log_2',
        timestamp: '14:22:10',
        service: 'sshd',
        ip: '198.51.100.77',
        user: 'root',
        status: 'FAILED',
        message: 'Failed password for root from 198.51.100.77 port 41011',
        isThreat: true
      },
      {
        id: 'log_3',
        timestamp: '14:22:12',
        service: 'sshd',
        ip: '198.51.100.77',
        user: 'admin',
        status: 'FAILED',
        message: 'Failed password for admin from 198.51.100.77 port 41012',
        isThreat: true
      },
      {
        id: 'log_4',
        timestamp: '14:22:15',
        service: 'sshd',
        ip: '198.51.100.77',
        user: 'backup',
        status: 'FAILED',
        message: 'Failed password for backup from 198.51.100.77 port 41014',
        isThreat: true
      },
      {
        id: 'log_5',
        timestamp: '14:22:18',
        service: 'sshd',
        ip: '198.51.100.77',
        user: 'service_acc',
        status: 'FAILED',
        message: 'Failed password for service_acc from 198.51.100.77 port 41016',
        isThreat: true
      },
      {
        id: 'log_6',
        timestamp: '14:22:20',
        service: 'sshd',
        ip: '198.51.100.77',
        user: 'service_acc',
        status: 'SUCCESS',
        message: 'Accepted password for service_acc from 198.51.100.77 port 41018 (BRUTE FORCE BREACH)',
        isThreat: true
      },
      {
        id: 'log_7',
        timestamp: '14:25:00',
        service: 'cron',
        ip: '127.0.0.1',
        user: 'root',
        status: 'INFO',
        message: 'CRON[1402]: (root) CMD (hourly_metrics_sync.sh)'
      }
    ],
    debrief: {
      conceptSummary: 'Log analysis correlates events over time to reveal malicious activity that individual events do not show in isolation.',
      whyItWorked: 'You identified IP `198.51.100.77` rapidly attempting passwords against `root`, `admin`, `backup`, and finally compromising `service_acc` at 14:22:20.',
      realWorldRelevance: 'Automated brute-force and credential-stuffing bots continually bombard public SSH and RDP services. Security tools like Fail2ban and SIEMs rely on this exact log pattern to auto-ban malicious IPs.',
      keyTakeaway: 'Detect early: A cluster of failed logins from a single IP is a high-confidence indicator of automated password guessing.'
    }
  },
  {
    id: 'blue-3',
    path: 'BLUE',
    level: 3,
    title: 'Incident Response',
    subtitle: 'Executing the 4-Phase Incident Response Lifecycle',
    shortObjective: 'Guide defensive decisions through Detect → Investigate → Contain → Verify stages.',
    difficulty: 'EASY',
    type: 'INCIDENT_RESPONSE',
    conceptName: 'Incident Response Lifecycle (NIST / SANS Framework)',
    conceptTags: ['Incident Triage', 'Evidence Preservation', 'Containment Strategy'],
    objectiveLabel: 'Phases Executed: [4 / 4]',
    briefing: {
      overview: 'Incident Response (IR) follows structured phases: Detection, Investigation, Containment, and Verification. Making the wrong decision can destroy forensic evidence.',
      scenario: 'A workstation in the Finance department began beaconing to an unknown external IP address after an employee opened an invoice attachment.',
      objectiveText: 'Navigate the 4 response phases by choosing the correct tactical action at each stage while avoiding critical forensic mistakes.',
      keyPrerequisiteKnowledge: [
        'Phase 1 Detect: Confirm whether an alert represents a true positive',
        'Phase 2 Investigate: Gather evidence (memory snapshot, active connections) BEFORE altering the machine',
        'Phase 3 Contain: Isolate host from the local network to stop lateral spread while keeping power on',
        'Phase 4 Verify: Confirm threat eradication and restore services securely'
      ],
      hint: 'Never immediately reboot or delete files on a compromised host before preserving evidence, and isolate the network interface to prevent lateral movement.'
    },
    incidentStages: [
      {
        stageNumber: 1,
        title: 'Phase 1: Detection & Triage',
        situation: 'The EDR alert reports suspicious process execution `powershell.exe -enc ...` spawned by Microsoft Excel on workstation `FIN-DESK-09`. What is your initial triage step?',
        choices: [
          {
            id: 'c1_bad',
            title: 'Dismiss the alert as a false positive without investigation',
            description: 'Assume the accounting macro is normal finance software.',
            isCorrect: false,
            consequence: 'FAILURE: The malware continues running silently and encrypts shared network shares.',
            teachingNote: 'Never dismiss encoded PowerShell commands spawned by Office documents without forensic verification.'
          },
          {
            id: 'c1_good',
            title: 'Verify process tree and confirm True Positive security incident',
            description: 'Inspect parent process (Excel -> cmd -> PowerShell) and flag as confirmed malware.',
            isCorrect: true,
            consequence: 'SUCCESS: Incident verified as True Positive macro-based malware execution.',
            teachingNote: 'Analyzing the parent-child relationship (Office spawning command interpreters) is a gold-standard detection technique.'
          }
        ]
      },
      {
        stageNumber: 2,
        title: 'Phase 2: Investigation & Evidence Preservation',
        situation: 'The threat is confirmed active. You need to investigate what the malware is doing. What action preserves forensic integrity?',
        choices: [
          {
            id: 'c2_bad',
            title: 'Immediately reboot the computer to clear RAM',
            description: 'Restart the machine to try stopping the process.',
            isCorrect: false,
            consequence: 'FAILURE: Rebooting permanently destroyed volatile RAM evidence, active encryption keys, and network connection artifacts!',
            teachingNote: 'Rebooting destroys volatile memory. Attackers often operate exclusively in RAM (fileless malware).'
          },
          {
            id: 'c2_good',
            title: 'Capture volatile memory (RAM snapshot) and active network connections',
            description: 'Preserve volatile forensic artifacts before making any system changes.',
            isCorrect: true,
            consequence: 'SUCCESS: RAM snapshot captured, preserving injected DLLs and C2 IP artifacts.',
            teachingNote: 'Order of Volatility dictates collecting live RAM before shutting down or altering disk state.'
          }
        ]
      },
      {
        stageNumber: 3,
        title: 'Phase 3: Containment',
        situation: 'Evidence is secured. The infected host is actively trying to scan other machines on the subnet. How do you contain the threat?',
        choices: [
          {
            id: 'c3_good',
            title: 'Isolate host from the network (VLAN / EDR Network Isolation)',
            description: 'Sever all network connectivity while leaving the machine powered on for analysis.',
            isCorrect: true,
            consequence: 'SUCCESS: Lateral movement blocked. The infected machine cannot contact any other host.',
            teachingNote: 'Network isolation stops malware from spreading across the local subnet without powering off the host.'
          },
          {
            id: 'c3_bad',
            title: 'Send a company-wide email warning everyone not to open invoices',
            description: 'Rely on user behavior while leaving the infected machine connected.',
            isCorrect: false,
            consequence: 'FAILURE: The worm autonomously propagated across open SMB shares before users could read the email.',
            teachingNote: 'Administrative policies cannot replace immediate technical containment of an active infection.'
          }
        ]
      },
      {
        stageNumber: 4,
        title: 'Phase 4: Eradication & Verification',
        situation: 'The malware binary and persistence keys have been removed. How do you verify the system is safe before rejoining the network?',
        choices: [
          {
            id: 'c4_good',
            title: 'Reset compromised user credentials, verify scheduled tasks, and monitor outbound traffic',
            description: 'Ensure no secondary backdoors or persistence mechanisms remain.',
            isCorrect: true,
            consequence: 'SUCCESS: All credentials rotated, persistence mechanisms verified clean, host securely reconnected.',
            teachingNote: 'Verification ensures all footholds (backdoor accounts, registry run keys, scheduled tasks) are neutralized.'
          },
          {
            id: 'c4_bad',
            title: 'Reconnect the machine immediately since the single file was deleted',
            description: 'Assume deleting the downloaded payload removed all attacker footholds.',
            isCorrect: false,
            consequence: 'FAILURE: The attacker had established a secondary scheduled task backdoor which reinfected the host 1 hour later.',
            teachingNote: 'Attackers regularly establish multiple persistence mechanisms to survive simple file deletion.'
          }
        ]
      }
    ],
    debrief: {
      conceptSummary: 'Structured incident response prioritizes evidence preservation, rapid network containment, and verified eradication over impulsive actions.',
      whyItWorked: 'You methodically confirmed the threat, preserved volatile memory, isolated the host to prevent lateral movement, and rotated credentials before reconnecting.',
      realWorldRelevance: 'Industry standard frameworks like NIST SP 800-61 and SANS IR guide real-world cybersecurity teams in responding to ransomware and enterprise breaches.',
      keyTakeaway: 'Contain without destroying evidence: isolate the network interface first, capture RAM, then eradicate persistence.'
    }
  },
  {
    id: 'blue-4',
    path: 'BLUE',
    level: 4,
    title: 'NETWORK TRAFFIC INTERCEPTION',
    subtitle: 'Deep Packet Inspection & Threat Neutralization',
    shortObjective: 'Monitor traffic in real time. Intercept and neutralize rogue cleartext HTTP exfiltration streams.',
    difficulty: 'INTERMEDIATE',
    type: 'TRAFFIC_INTERCEPTION',
    conceptName: 'Deep Packet Inspection & Egress Defense',
    conceptTags: ['Deep Packet Inspection', 'Perimeter Defense', 'Egress Filtering'],
    objectiveLabel: 'Threats Neutralized: [X / 3]',
    briefing: {
      overview: 'Deep Packet Inspection (DPI) empowers defensive security operations to inspect network payloads in real time and sever malicious data exfiltration channels before proprietary assets leave the network.',
      scenario: 'Intrusion Detection telemetry has detected active unencrypted data exfiltration targeting internal enterprise databases across the firewall perimeter.',
      objectiveText: 'Monitor the live network traffic conduit between client endpoints and database hubs. Identify and neutralize 3 rogue unencrypted HTTP exfiltration packets within 10 seconds to restore perimeter security.',
      keyPrerequisiteKnowledge: [
        'DPI (Deep Packet Inspection): Real-time analysis of packet data payloads beyond simple headers',
        'Rogue Cleartext HTTP: Unencrypted exfiltration attempts attempting to slip past egress controls',
        'Legitimate TLS Traffic: Encrypted and verified business applications passing through normal channels',
        'Perimeter Threat Neutralization: Immediate packet drop and firewall isolation of rogue streams'
      ],
      hint: 'Inspect packets traversing the pipeline. Click or tap rogue unencrypted HTTP exfiltration streams to neutralize them before they reach internal databases.'
    },
    debrief: {
      conceptSummary: 'Real-time Deep Packet Inspection enables perimeter defense systems to detect anomalies inside packet payloads and drop malicious streams on the fly.',
      whyItWorked: 'By intercepting and neutralizing rogue cleartext HTTP exfiltration streams in real time, you prevented proprietary database contents from leaking outside the corporate boundary.',
      realWorldRelevance: 'Enterprise Next-Generation Firewalls (NGFW) and EDR systems continuously perform deep packet inspection to disrupt ransomware data extortion schemes and C2 beacons.',
      keyTakeaway: 'Inspect and enforce: Continuous DPI combined with automated egress blocking neutralizes active data exfiltration.'
    }
  },
  {
    id: 'blue-5',
    path: 'BLUE',
    level: 5,
    title: 'WIRESHARK SOC NETWORK FORENSICS',
    subtitle: 'Deep Packet PCAP Analysis, Protocol Filtering & Threat Quarantine',
    shortObjective: 'Analyze live PCAPs in Wireshark. Filter rogue HTTP traffic, inspect ASCII bytes, and quarantine C2 tokens.',
    difficulty: 'ADVANCED',
    type: 'INCIDENT_COMMAND_MATRIX',
    conceptName: 'Wireshark PCAP & Protocol Forensics',
    conceptTags: ['Wireshark', 'PCAP Forensics', 'Display Filters', 'Packet Inspection'],
    objectiveLabel: 'Artifacts Quarantined: [X / 2]',
    briefing: {
      overview: 'Wireshark is the industry-standard network protocol analyzer used by SOC analysts and forensic investigators to capture, filter, and inspect raw packet transmissions across internal and perimeter networks.',
      scenario: 'Perimeter network telemetry has captured an active data exfiltration incident. A compromised host is leaking credentials and sensitive assets over unencrypted protocols.',
      objectiveText: 'Operate the interactive Wireshark SOC Forensics Suite: apply display filters (`http`) to isolate both unencrypted HTTP conduits (Beacon Sync & Data Exfiltration), inspect their packet trees and raw byte streams to extract both rogue destination IPs and leaked auth tokens, and execute perimeter quarantine.',
      keyPrerequisiteKnowledge: [
        'Display Filters: Use syntax like `http` or `dns` in the Wireshark filter bar to isolate relevant traffic frames',
        'Packet Tree Hierarchy: Drill down through Frame ➔ Ethernet II ➔ IPv4 ➔ TCP ➔ HTTP application headers',
        'Raw ASCII / Hex Payload: Examine raw bytes to extract unencrypted tokens (`X-Auth-Token`) and target endpoints',
        'SOC Quarantine & Containment: Block both rogue destination IPs and revoke leaked authentication tokens to neutralize all threat vectors'
      ],
      hint: 'Apply the filter "http" to isolate both unencrypted frames. Inspect Frame 2 and Frame 5 to extract their respective destination IPs and X-Auth-Token headers.'
    },
    debrief: {
      conceptSummary: 'Wireshark PCAP forensics enables defensive analysts to pinpoint unencrypted data leaks, trace adversary IP conduits, and extract compromised authentication tokens directly from wire transmissions.',
      whyItWorked: 'By filtering for HTTP traffic, you isolated both adversary conduits (Frame 2 Beacon Stager: 198.51.100.22 & Frame 5 Exfil Ingress: 203.0.113.88), extracted their auth tokens from cleartext headers, and executed complete perimeter quarantine.',
      realWorldRelevance: 'SOC Tier-2/Tier-3 incident response engineers rely daily on Wireshark, Zeek, and Suricata to perform deep packet inspection during high-impact data exfiltration and APT intrusions.',
      keyTakeaway: 'Always analyze the wire: Unencrypted communications expose full payload headers and authentication secrets to any analyst or adversary inspecting the conduit.'
    }
  }
];

export const ALL_MISSIONS_DATA: Record<string, MissionData> = {
  ...RED_MISSIONS.reduce((acc, m) => ({ ...acc, [m.id]: m }), {}),
  ...BLUE_MISSIONS.reduce((acc, m) => ({ ...acc, [m.id]: m }), {})
};
