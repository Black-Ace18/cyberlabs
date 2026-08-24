import React, { useState, useMemo } from 'react';
import { MissionData } from '../../../types/cyberlab';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Filter, 
  Radio, 
  Layers, 
  FileText,
  Zap,
  Minus,
  Square,
  X,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { sound } from '../../../utils/audio';

interface IncidentCommandMatrixLabProps {
  mission: MissionData;
  onSuccess: () => void;
}

interface Packet {
  no: number;
  time: string;
  source: string;
  destination: string;
  protocol: 'HTTP' | 'DNS' | 'TLSv1.3' | 'TCP';
  length: number;
  info: string;
  isMalicious?: boolean;
  frame: string;
  ethernet: string;
  ip: {
    version: number;
    src: string;
    dst: string;
    ttl: number;
    checksum: string;
  };
  tcp: {
    srcPort: number;
    dstPort: number;
    seq: number;
    ack: number;
    flags: string;
  };
  http?: {
    requestMethod: string;
    requestUri: string;
    host: string;
    userAgent: string;
    authToken?: string;
    payloadBody?: string;
  };
  rawAscii: string;
  rawHex: string;
}

const PACKET_STREAM: Packet[] = [
  {
    no: 1,
    time: '0.000000',
    source: '10.0.4.12',
    destination: '1.1.1.1',
    protocol: 'DNS',
    length: 74,
    info: 'Standard query 0x1a4b A telemetry.internal.corp',
    frame: 'Frame 1: 74 bytes on wire (592 bits), 74 bytes captured on interface eth0',
    ethernet: 'Ethernet II, Src: 00:0c:29:4f:8e:1a (SOC_ENDPOINT_01), Dst: 00:50:56:fd:a1:02 (Gateway)',
    ip: { version: 4, src: '10.0.4.12', dst: '1.1.1.1', ttl: 64, checksum: '0x321a' },
    tcp: { srcPort: 53210, dstPort: 53, seq: 0, ack: 0, flags: 'UDP [DNS]' },
    rawAscii: '..1a4b..0100..0001..0000..0000..0000.telemetry.internal.corp..',
    rawHex: '00 0c 29 4f 8e 1a 00 50 56 fd a1 02 08 00 45 00 00 4a 1a 4b 01 00 00 01'
  },
  {
    no: 2,
    time: '0.014201',
    source: '10.0.4.12',
    destination: '198.51.100.22',
    protocol: 'HTTP',
    length: 420,
    info: 'GET /api/v1/beacon/sync HTTP/1.1',
    isMalicious: true,
    frame: 'Frame 2: 420 bytes on wire (3360 bits), 420 bytes captured on interface eth0',
    ethernet: 'Ethernet II, Src: 00:0c:29:4f:8e:1a (SOC_ENDPOINT_01), Dst: 00:50:56:fd:a1:02 (Gateway)',
    ip: { version: 4, src: '10.0.4.12', dst: '198.51.100.22', ttl: 64, checksum: '0x49bc' },
    tcp: { srcPort: 51204, dstPort: 80, seq: 1, ack: 1, flags: '[PSH, ACK] Window=65535' },
    http: {
      requestMethod: 'GET',
      requestUri: '/api/v1/beacon/sync',
      host: 'sync-relay.darkops.net (198.51.100.22)',
      userAgent: 'Go-http-client/1.1 (APT29_Stage1_Agent)',
      authToken: 'BEACON_STAGE1_KEY_441',
      payloadBody: '{"action":"HEARTBEAT","node_id":"COMP_01","stage":"INITIAL_ACCESS"}'
    },
    rawAscii: `GET /api/v1/beacon/sync HTTP/1.1\r
Host: 198.51.100.22\r
User-Agent: Go-http-client/1.1 (APT29_Stage1_Agent)\r
Accept: */*\r
X-Auth-Token: BEACON_STAGE1_KEY_441\r
Connection: keep-alive\r
\r
{"action":"HEARTBEAT","node_id":"COMP_01","stage":"INITIAL_ACCESS"}`,
    rawHex: '47 45 54 20 2f 61 70 69 2f 76 31 2f 62 65 61 63 6f 6e 2f 73 79 6e 63 20 48 54 54 50 2f 31 2e 31 0d 0a 48 6f 73 74 3a 20 31 39 38 2e 35 31 2e 31 30 30 2e 32 32'
  },
  {
    no: 3,
    time: '0.048190',
    source: '10.0.4.12',
    destination: '104.244.42.1',
    protocol: 'TLSv1.3',
    length: 517,
    info: 'Client Hello, Version: TLS 1.3 (SNI: auth.okta.com)',
    frame: 'Frame 3: 517 bytes on wire (4136 bits), 517 bytes captured on interface eth0',
    ethernet: 'Ethernet II, Src: 00:0c:29:4f:8e:1a (SOC_ENDPOINT_01), Dst: 00:50:56:fd:a1:02 (Gateway)',
    ip: { version: 4, src: '10.0.4.12', dst: '104.244.42.1', ttl: 64, checksum: '0x88f2' },
    tcp: { srcPort: 49182, dstPort: 443, seq: 1, ack: 1, flags: '[PSH, ACK] Window=65535' },
    rawAscii: '....1.3..ClientHello.auth.okta.com...[ENCRYPTED SESSION CIPHERSUITE]',
    rawHex: '16 03 01 02 00 01 00 01 fc 03 03 a1 b2 c3 d4 e5 f6 07 18 29 3a 4b 5c 6d'
  },
  {
    no: 4,
    time: '0.092410',
    source: '10.0.4.12',
    destination: '8.8.8.8',
    protocol: 'DNS',
    length: 68,
    info: 'Standard query 0x7c91 A sync-relay.darkops.net',
    frame: 'Frame 4: 68 bytes on wire (544 bits), 68 bytes captured on interface eth0',
    ethernet: 'Ethernet II, Src: 00:0c:29:4f:8e:1a (SOC_ENDPOINT_01), Dst: 00:50:56:fd:a1:02 (Gateway)',
    ip: { version: 4, src: '10.0.4.12', dst: '8.8.8.8', ttl: 64, checksum: '0x12dc' },
    tcp: { srcPort: 54109, dstPort: 53, seq: 0, ack: 0, flags: 'UDP [DNS]' },
    rawAscii: '..7c91..0100..0001..0000..0000..0000.sync-relay.darkops.net..',
    rawHex: '00 0c 29 4f 8e 1a 00 50 56 fd a1 02 08 00 45 00 00 44 7c 91 01 00 00 01'
  },
  {
    no: 5,
    time: '0.124502',
    source: '10.0.4.12',
    destination: '203.0.113.88',
    protocol: 'HTTP',
    length: 892,
    info: 'POST /exfil/vault HTTP/1.1 (application/json)',
    isMalicious: true,
    frame: 'Frame 5: 892 bytes on wire (7136 bits), 892 bytes captured on interface eth0',
    ethernet: 'Ethernet II, Src: 00:0c:29:4f:8e:1a (Compromised_Node_01), Dst: 00:50:56:fd:a1:02 (Gateway)',
    ip: { 
      version: 4, 
      src: '10.0.4.12', 
      dst: '203.0.113.88', 
      ttl: 64, 
      checksum: '0xbeef' 
    },
    tcp: { 
      srcPort: 58214, 
      dstPort: 80, 
      seq: 1, 
      ack: 1, 
      flags: '[PSH, ACK] Window=29200 Len=838' 
    },
    http: {
      requestMethod: 'POST',
      requestUri: '/exfil/vault',
      host: 'c2-ingress.darkops.net (203.0.113.88)',
      userAgent: 'Python-urllib/3.11 (APT29_Custom_Stager)',
      authToken: 'C2_TOKEN_992_EXFIL',
      payloadBody: '{"target":"FIN_VAULT_01","dump":"ledger_master_keys.bin","status":"EXFIL_PENDING"}'
    },
    rawAscii: `POST /exfil/vault HTTP/1.1\r
Host: 203.0.113.88\r
User-Agent: Python-urllib/3.11 (APT29_Custom_Stager)\r
Accept: */*\r
Content-Type: application/json\r
X-Auth-Token: C2_TOKEN_992_EXFIL\r
Content-Length: 82\r
\r
{"target":"FIN_VAULT_01","dump":"ledger_master_keys.bin","status":"EXFIL_PENDING"}`,
    rawHex: '50 4f 53 54 20 2f 65 78 66 69 6c 2f 76 61 75 6c 74 20 48 54 54 50 2f 31 2e 31 0d 0a 48 6f 73 74 3a 20 32 30 33 2e 30 2e 31 31 33 2e 38 38 0d 0a 58 2d 41 75 74 68 2d 54 6f 6b 65 6e 3a 20 43 32 5f 54 4f 4b 45 4e 5f 39 39 32 5f 45 58 46 49 4c'
  },
  {
    no: 6,
    time: '0.145890',
    source: '104.244.42.1',
    destination: '10.0.4.12',
    protocol: 'TLSv1.3',
    length: 1420,
    info: 'Server Hello, Change Cipher Spec, Application Data',
    frame: 'Frame 6: 1420 bytes on wire (11360 bits), 1420 bytes captured on interface eth0',
    ethernet: 'Ethernet II, Src: 00:50:56:fd:a1:02, Dst: 00:0c:29:4f:8e:1a',
    ip: { version: 4, src: '104.244.42.1', dst: '10.0.4.12', ttl: 52, checksum: '0x71aa' },
    tcp: { srcPort: 443, dstPort: 49182, seq: 1, ack: 518, flags: '[ACK] Window=64240' },
    rawAscii: '....1.3..ServerHello...ChangeCipherSpec...[APPLICATION DATA ENCRYPTED]',
    rawHex: '16 03 03 00 7a 02 00 00 76 03 03 fc a9 82 11 ee dd cc bb aa 99 88 77 66'
  },
  {
    no: 7,
    time: '0.210982',
    source: '10.0.4.12',
    destination: '10.0.8.20',
    protocol: 'TCP',
    length: 66,
    info: '52190 → 8080 [SYN] Seq=0 Win=64240 Len=0 MSS=1460',
    frame: 'Frame 7: 66 bytes on wire (528 bits), 66 bytes captured on interface eth0',
    ethernet: 'Ethernet II, Src: 00:0c:29:4f:8e:1a, Dst: 00:50:56:fd:a1:02',
    ip: { version: 4, src: '10.0.4.12', dst: '10.0.8.20', ttl: 64, checksum: '0x55ef' },
    tcp: { srcPort: 52190, dstPort: 8080, seq: 0, ack: 0, flags: '[SYN] Window=64240' },
    rawAscii: '........TCP SYN PACKET HANDSHAKE INITIATION..........',
    rawHex: '00 0c 29 4f 8e 1a 00 50 56 fd a1 02 08 00 45 00 00 3c 00 00 40 00 40 06'
  }
];

// Subcomponent: Packet Details Tree Breakdown
interface PacketDetailsTreeProps {
  packet: Packet;
  treeOpen: {
    frame: boolean;
    eth: boolean;
    ip: boolean;
    tcp: boolean;
    http: boolean;
  };
  setTreeOpen: React.Dispatch<React.SetStateAction<{
    frame: boolean;
    eth: boolean;
    ip: boolean;
    tcp: boolean;
    http: boolean;
  }>>;
}

const PacketDetailsTree: React.FC<PacketDetailsTreeProps> = ({
  packet,
  treeOpen,
  setTreeOpen
}) => {
  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px] text-cyan-400 font-bold">
        <span className="flex items-center gap-1.5 truncate">
          <Layers className="w-3.5 h-3.5 text-[#00D4FF] shrink-0" />
          <span className="truncate">Packet Details — Frame {packet.no} ({packet.protocol})</span>
        </span>
        <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-2">{packet.length} bytes</span>
      </div>

      {/* Tree Node: Frame */}
      <div className="space-y-1 text-slate-300 text-[11px]">
        <div 
          onClick={() => setTreeOpen(prev => ({ ...prev, frame: !prev.frame }))}
          className="flex items-center gap-1 cursor-pointer hover:text-white select-none text-slate-300 font-semibold"
        >
          {treeOpen.frame ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
          <span className="truncate">{packet.frame}</span>
        </div>
        {treeOpen.frame && (
          <div className="pl-4 space-y-0.5 text-[10px] text-slate-400 border-l border-cyan-500/30 ml-1.5 bg-black/40 p-2 rounded">
            <div>Interface id: <span className="text-white font-mono">0 (eth0)</span></div>
            <div>Encapsulation type: <span className="text-white font-mono">Ethernet (1)</span></div>
            <div>Arrival Time: <span className="text-cyan-300 font-mono">Aug 23, 2026 22:45:{packet.time} UTC</span></div>
            <div>Frame Number: <span className="text-white font-mono">{packet.no}</span></div>
            <div>Frame Length: <span className="text-white font-mono">{packet.length} bytes ({packet.length * 8} bits)</span></div>
            <div>Capture Length: <span className="text-white font-mono">{packet.length} bytes</span></div>
            <div>Protocols in frame: <span className="text-slate-300 font-mono">eth:ethertype:ip:{packet.protocol.toLowerCase()}</span></div>
          </div>
        )}
      </div>

      {/* Tree Node: Ethernet II */}
      <div className="space-y-1 text-slate-300 text-[11px]">
        <div 
          onClick={() => setTreeOpen(prev => ({ ...prev, eth: !prev.eth }))}
          className="flex items-center gap-1 cursor-pointer hover:text-white select-none text-slate-300 font-semibold"
        >
          {treeOpen.eth ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
          <span className="truncate">{packet.ethernet}</span>
        </div>
        {treeOpen.eth && (
          <div className="pl-4 space-y-0.5 text-[10px] text-slate-400 border-l border-cyan-500/30 ml-1.5 bg-black/40 p-2 rounded">
            <div>Destination MAC: <span className="text-white font-mono">00:50:56:fd:a1:02 (VMware_Gateway)</span></div>
            <div>Source MAC: <span className="text-white font-mono">00:0c:29:4f:8e:1a (SOC_Endpoint_01)</span></div>
            <div>Type: <span className="text-cyan-300 font-mono">IPv4 (0x0800)</span></div>
          </div>
        )}
      </div>

      {/* Tree Node: Internet Protocol Version 4 */}
      <div className="space-y-1 text-slate-300 text-[11px]">
        <div 
          onClick={() => setTreeOpen(prev => ({ ...prev, ip: !prev.ip }))}
          className="flex items-center gap-1 cursor-pointer hover:text-white select-none font-bold text-cyan-300"
        >
          {treeOpen.ip ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
          <span className="truncate">Internet Protocol Version 4, Src: {packet.ip.src}, Dst: {packet.ip.dst}</span>
        </div>
        {treeOpen.ip && (
          <div className="pl-4 space-y-0.5 text-[10px] text-slate-400 border-l border-cyan-500/30 ml-1.5 bg-black/40 p-2 rounded">
            <div>Version: <span className="text-white font-mono">4</span></div>
            <div>Header Length: <span className="text-white font-mono">20 bytes (5)</span></div>
            <div>Source Address: <span className="text-white font-mono">{packet.ip.src}</span></div>
            <div>Destination Address: <span className="text-white font-mono font-bold text-cyan-200">{packet.ip.dst}</span></div>
            <div>Time to Live (TTL): <span className="text-white font-mono">{packet.ip.ttl}</span></div>
            <div>Protocol: <span className="text-cyan-300 font-mono">{packet.protocol === 'DNS' ? 'UDP (17)' : 'TCP (6)'}</span></div>
            <div>Header Checksum: <span className="text-slate-300 font-mono">{packet.ip.checksum} [verified]</span></div>
          </div>
        )}
      </div>

      {/* Tree Node: TCP / UDP */}
      <div className="space-y-1 text-slate-300 text-[11px]">
        <div 
          onClick={() => setTreeOpen(prev => ({ ...prev, tcp: !prev.tcp }))}
          className="flex items-center gap-1 cursor-pointer hover:text-white select-none font-bold text-cyan-300"
        >
          {treeOpen.tcp ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
          <span className="truncate">Transmission Control Protocol, Src Port: {packet.tcp.srcPort}, Dst Port: {packet.tcp.dstPort}</span>
        </div>
        {treeOpen.tcp && (
          <div className="pl-4 space-y-0.5 text-[10px] text-slate-400 border-l border-cyan-500/30 ml-1.5 bg-black/40 p-2 rounded">
            <div>Source Port: <span className="text-white font-mono">{packet.tcp.srcPort}</span></div>
            <div>Destination Port: <span className="text-white font-mono font-bold text-cyan-200">{packet.tcp.dstPort}</span></div>
            <div>Sequence Number: <span className="text-white font-mono">{packet.tcp.seq}</span></div>
            <div>Acknowledgment Number: <span className="text-white font-mono">{packet.tcp.ack}</span></div>
            <div>Flags: <span className="text-slate-300 font-mono">{packet.tcp.flags}</span></div>
          </div>
        )}
      </div>

      {/* Tree Node: HTTP (if available) */}
      {packet.http && (
        <div className="space-y-1 text-green-300 text-[11px]">
          <div 
            onClick={() => setTreeOpen(prev => ({ ...prev, http: !prev.http }))}
            className="flex items-center gap-1 cursor-pointer hover:text-white select-none font-bold text-[#00FF66]"
          >
            {treeOpen.http ? <ChevronDown className="w-3.5 h-3.5 text-green-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-green-600 shrink-0" />}
            <span className="truncate">Hypertext Transfer Protocol ({packet.http.requestMethod} {packet.http.requestUri})</span>
          </div>
          {treeOpen.http && (
            <div className="pl-4 space-y-1 text-[10px] text-green-200/90 border-l border-green-500/40 ml-1.5 bg-green-950/30 p-2.5 rounded">
              <div>Request Method: <span className="text-white font-bold">{packet.http.requestMethod}</span></div>
              <div>Request URI: <span className="text-white font-bold">{packet.http.requestUri}</span></div>
              <div>Host: <span className="text-cyan-300 font-bold">{packet.http.host}</span></div>
              <div>User-Agent: <span className="text-slate-300">{packet.http.userAgent}</span></div>
              {packet.http.authToken && (
                <div className="p-1.5 rounded bg-slate-900 border border-cyan-500/40 text-slate-300">
                  X-Auth-Token: <span className="text-white font-bold select-all text-amber-300">{packet.http.authToken}</span>
                </div>
              )}
              {packet.http.payloadBody && (
                <div className="pt-1">
                  <span className="text-slate-400">Payload Body: </span>
                  <span className="text-slate-200 font-mono break-all">{packet.http.payloadBody}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Subcomponent: Packet Byte Stream (Hex & ASCII)
interface PacketByteStreamProps {
  packet: Packet;
}

const PacketByteStream: React.FC<PacketByteStreamProps> = ({ packet }) => {
  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px] text-cyan-400 font-bold">
        <span className="flex items-center gap-1.5 truncate">
          <FileText className="w-3.5 h-3.5 text-[#00D4FF] shrink-0" />
          <span>Packet Byte Stream</span>
        </span>
        <span className="text-[10px] text-slate-500">ASCII UTF-8</span>
      </div>

      <div className="p-2.5 rounded-lg bg-black border border-cyan-500/30 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto whitespace-pre-wrap selection:bg-[#00FF66] selection:text-black">
        {packet.rawAscii}
      </div>

      <div className="text-[10px] text-slate-500 font-mono">
        <span className="text-cyan-400 font-bold">Hex Stream: </span>
        <span className="break-all">{packet.rawHex}</span>
      </div>
    </div>
  );
};

export const IncidentCommandMatrixLab: React.FC<IncidentCommandMatrixLabProps> = ({
  mission,
  onSuccess
}) => {
  const [filterInput, setFilterInput] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [selectedPacketNo, setSelectedPacketNo] = useState<number>(1);

  // Tree toggle state
  const [treeOpen, setTreeOpen] = useState<{
    frame: boolean;
    eth: boolean;
    ip: boolean;
    tcp: boolean;
    http: boolean;
  }>({
    frame: false,
    eth: false,
    ip: true,
    tcp: true,
    http: true
  });

  // Quarantine state: dual HTTP rogue target quarantine
  const [quarantinedTargets, setQuarantinedTargets] = useState<{
    target1: boolean; // Frame 2: 198.51.100.22 / BEACON_STAGE1_KEY_441
    target2: boolean; // Frame 5: 203.0.113.88 / C2_TOKEN_992_EXFIL
  }>({
    target1: false,
    target2: false
  });

  const [maliciousIpInput, setMaliciousIpInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [quarantineFeedback, setQuarantineFeedback] = useState<{
    type: 'error' | 'success' | 'info';
    message: string;
  } | null>(null);
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [showIntelManual, setShowIntelManual] = useState(false);

  const quarantinedCount = (quarantinedTargets.target1 ? 1 : 0) + (quarantinedTargets.target2 ? 1 : 0);

  // Live filter evaluation
  const filteredPackets = useMemo(() => {
    const query = activeFilter.trim().toLowerCase();
    if (!query) return PACKET_STREAM;

    return PACKET_STREAM.filter(pkt => {
      if (query === 'http') return pkt.protocol === 'HTTP';
      if (query === 'dns') return pkt.protocol === 'DNS';
      if (query === 'tls' || query === 'tlsv1.3' || query === 'ssl') return pkt.protocol === 'TLSv1.3';
      if (query === 'tcp') return pkt.protocol === 'TCP' || pkt.protocol === 'HTTP' || pkt.protocol === 'TLSv1.3';
      if (query.includes('ip.addr') || query.includes('ip.dst') || query.includes('ip.src')) {
        const clean = query.replace(/[^0-9.]/g, '');
        return pkt.source.includes(clean) || pkt.destination.includes(clean);
      }
      return (
        pkt.protocol.toLowerCase().includes(query) ||
        pkt.source.toLowerCase().includes(query) ||
        pkt.destination.toLowerCase().includes(query) ||
        pkt.info.toLowerCase().includes(query)
      );
    });
  }, [activeFilter]);

  const selectedPacket = PACKET_STREAM.find(p => p.no === selectedPacketNo) || PACKET_STREAM[0];

  const handleApplyFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    sound.playClick();
    setActiveFilter(filterInput);
  };

  const handleClearFilter = () => {
    sound.playClick();
    setFilterInput('');
    setActiveFilter('');
  };

  const handleSelectPacket = (pkt: Packet) => {
    sound.playClick();
    setSelectedPacketNo(pkt.no);
  };

  const handleExecuteQuarantine = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIp = maliciousIpInput.trim();
    const cleanToken = tokenInput.trim();

    // Check Match Target 1: Frame 2 (Beacon Stager)
    const isTarget1Match = cleanIp === '198.51.100.22' && cleanToken === 'BEACON_STAGE1_KEY_441';
    // Check Match Target 2: Frame 5 (Exfiltration Ingress)
    const isTarget2Match = cleanIp === '203.0.113.88' && cleanToken === 'C2_TOKEN_992_EXFIL';

    if (isTarget1Match) {
      if (quarantinedTargets.target1) {
        sound.playAlert();
        setQuarantineFeedback({
          type: 'info',
          message: '[!] Target 198.51.100.22 is already quarantined. Inspect the capture stream for the remaining HTTP target.'
        });
        return;
      }

      const nextTarget1 = true;
      const nextTarget2 = quarantinedTargets.target2;
      setQuarantinedTargets({ target1: nextTarget1, target2: nextTarget2 });
      setMaliciousIpInput('');
      setTokenInput('');

      if (nextTarget2) {
        // Both targets neutralised!
        sound.playThreatNeutralized();
        setIsSuccess(true);
        sound.playSuccess();
        setQuarantineFeedback({
          type: 'success',
          message: '[+] ALL 2/2 HTTP THREATS NEUTRALIZED! Perimeter quarantine active. Incident resolved.'
        });
        setTimeout(() => {
          onSuccess();
        }, 2200);
      } else {
        sound.playThreatNeutralized();
        setQuarantineFeedback({
          type: 'success',
          message: '[+] THREAT 1/2 ISOLATED: Target Alpha (198.51.100.22) blackholed. 1 HTTP threat remaining!'
        });
      }
    } else if (isTarget2Match) {
      if (quarantinedTargets.target2) {
        sound.playAlert();
        setQuarantineFeedback({
          type: 'info',
          message: '[!] Target 203.0.113.88 is already quarantined. Inspect the capture stream for the remaining HTTP target.'
        });
        return;
      }

      const nextTarget1 = quarantinedTargets.target1;
      const nextTarget2 = true;
      setQuarantinedTargets({ target1: nextTarget1, target2: nextTarget2 });
      setMaliciousIpInput('');
      setTokenInput('');

      if (nextTarget1) {
        // Both targets neutralised!
        sound.playThreatNeutralized();
        setIsSuccess(true);
        sound.playSuccess();
        setQuarantineFeedback({
          type: 'success',
          message: '[+] ALL 2/2 HTTP THREATS NEUTRALIZED! Perimeter quarantine active. Incident resolved.'
        });
        setTimeout(() => {
          onSuccess();
        }, 2200);
      } else {
        sound.playThreatNeutralized();
        setQuarantineFeedback({
          type: 'success',
          message: '[+] THREAT 1/2 ISOLATED: Target Bravo (203.0.113.88) blackholed. 1 HTTP threat remaining!'
        });
      }
    } else {
      sound.playAlert();
      let errorMsg = '[-] ISOLATION REJECTED: Invalid forensic IP or auth token pair.';
      if (cleanIp === '198.51.100.22' && cleanToken !== 'BEACON_STAGE1_KEY_441') {
        errorMsg = '[-] ISOLATION REJECTED: Incorrect token for 198.51.100.22. Check X-Auth-Token in Frame 2.';
      } else if (cleanIp === '203.0.113.88' && cleanToken !== 'C2_TOKEN_992_EXFIL') {
        errorMsg = '[-] ISOLATION REJECTED: Incorrect token for 203.0.113.88. Check X-Auth-Token in Frame 5.';
      } else if (cleanToken === 'BEACON_STAGE1_KEY_441' && cleanIp !== '198.51.100.22') {
        errorMsg = '[-] ISOLATION REJECTED: Incorrect destination IP for token BEACON_STAGE1_KEY_441.';
      } else if (cleanToken === 'C2_TOKEN_992_EXFIL' && cleanIp !== '203.0.113.88') {
        errorMsg = '[-] ISOLATION REJECTED: Incorrect destination IP for token C2_TOKEN_992_EXFIL.';
      }
      setQuarantineFeedback({
        type: 'error',
        message: errorMsg
      });
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden box-border space-y-4 font-mono text-left animate-in fade-in duration-300">
      
      {/* 1. TOP WIRESHARK WORKSTATION WINDOW CONTAINER */}
      <div className="w-full max-w-full rounded-2xl border border-cyan-500/30 bg-[#070e17] overflow-hidden box-border">
        
        {/* Top Window Title Bar */}
        <div className="bg-[#0b1626] border-b border-cyan-500/30 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center shadow-[0_0_8px_#00D4FF] shrink-0">
              <Radio className="w-3.5 h-3.5 text-[#00D4FF]" />
            </div>
            <div className="min-w-0 truncate">
              <span className="font-bold text-white text-xs sm:text-sm tracking-wide">
                wireshark_soc_engine
              </span>
              <span className="hidden sm:inline text-[10px] text-cyan-400/80 ml-2 border-l border-cyan-500/30 pl-2">
                [LIVE PCAP DEEP INSPECTOR]
              </span>
            </div>
          </div>

          {/* Adjusted Right Header: Intel Manual and Window controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowIntelManual(true)}
              className="min-h-[32px] px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 hover:text-white hover:border-cyan-400 text-xs font-bold transition-all flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#00D4FF] shrink-0" />
              <span className="hidden sm:inline">Intel Manual</span>
            </button>

            <div className="hidden sm:flex items-center gap-1 text-slate-500 text-xs ml-1">
              <Minus className="w-3 h-3 hover:text-slate-300 cursor-pointer" />
              <Square className="w-2.5 h-2.5 hover:text-slate-300 cursor-pointer" />
              <X className="w-3 h-3 hover:text-red-400 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Display Filter Toolbar Bar - Compact on Mobile to maximize input space */}
        <div className="bg-[#08111e] border-b border-cyan-500/20 px-3 sm:px-4 py-2 flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-cyan-400 font-bold shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span className="hidden sm:inline">Display </span>
            <span className="hidden xs:inline">Filter:</span>
          </div>

          <form onSubmit={handleApplyFilter} className="flex-1 flex items-center gap-2 min-w-0">
            <div className="flex-1 relative min-w-0">
              <input
                type="text"
                value={filterInput}
                onChange={(e) => setFilterInput(e.target.value)}
                placeholder="Apply a display filter ... <e.g. http, dns>"
                className="w-full min-h-[34px] px-3 bg-[#03070d] border border-cyan-500/40 rounded-lg text-cyan-300 placeholder:text-slate-600 text-xs font-mono focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-cyan-500"
              />
              {activeFilter && (
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[10px] bg-slate-800 px-1.5 py-0.5 rounded"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              className="min-h-[34px] px-3 sm:px-4 rounded-lg bg-green-500 hover:bg-green-400 text-black font-bold text-xs uppercase shadow-[0_0_10px_rgba(0,255,102,0.25)] transition-all shrink-0 active:scale-95"
            >
              Apply
            </button>
          </form>

          {/* Quick Filter Presets */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0">
            <span className="text-[10px] text-slate-500">Presets:</span>
            {['http', 'dns', 'tls'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setFilterInput(preset);
                  setActiveFilter(preset);
                  sound.playClick();
                }}
                className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase transition-all ${
                  activeFilter === preset
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-black/50 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 2. PACKET LIST GRID TABLE */}
        <div className="w-full max-w-full overflow-x-auto border-b border-cyan-500/20 bg-[#040811] select-none">
          <table className="w-full text-left text-xs min-w-[680px] border-collapse font-mono">
            <thead>
              <tr className="bg-[#0b172a] text-slate-400 text-[11px] uppercase tracking-wider border-b border-cyan-500/20">
                <th className="py-2 px-3 w-12 text-center">No.</th>
                <th className="py-2 px-3 w-24">Time</th>
                <th className="py-2 px-3 w-32">Source</th>
                <th className="py-2 px-3 w-32">Destination</th>
                <th className="py-2 px-3 w-20">Protocol</th>
                <th className="py-2 px-3 w-16 text-right">Length</th>
                <th className="py-2 px-3">Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-[11px]">
              {filteredPackets.map((pkt) => {
                const isSelected = selectedPacketNo === pkt.no;
                
                // Standard Wireshark color styling across protocol families
                let rowBg = 'hover:bg-slate-900/60 text-slate-300';
                let protocolBadge = 'text-slate-400 bg-slate-800';

                if (pkt.protocol === 'HTTP') {
                  rowBg = isSelected 
                    ? 'bg-[#153424] text-[#a6f3a6] font-semibold ring-1 ring-green-400' 
                    : 'bg-[#0a2016]/80 text-[#a6f3a6] hover:bg-[#102d1f]';
                  protocolBadge = 'text-green-300 bg-green-950 border border-green-500/40';
                } else if (pkt.protocol === 'DNS') {
                  rowBg = isSelected
                    ? 'bg-[#0e2d42] text-cyan-200 font-semibold ring-1 ring-cyan-400'
                    : 'bg-[#071926]/80 text-cyan-300 hover:bg-[#0c2438]';
                  protocolBadge = 'text-cyan-300 bg-cyan-950 border border-cyan-500/40';
                } else if (pkt.protocol === 'TLSv1.3') {
                  rowBg = isSelected
                    ? 'bg-[#221838] text-purple-200 font-semibold ring-1 ring-purple-400'
                    : 'bg-[#130d21]/80 text-purple-300 hover:bg-[#1d1433]';
                  protocolBadge = 'text-purple-300 bg-purple-950 border border-purple-500/40';
                } else {
                  if (isSelected) {
                    rowBg = 'bg-slate-800 text-white ring-1 ring-slate-400';
                  }
                }

                return (
                  <tr
                    key={pkt.no}
                    onClick={() => handleSelectPacket(pkt)}
                    className={`cursor-pointer transition-colors ${rowBg}`}
                  >
                    <td className="py-2 px-3 text-center font-bold">{pkt.no}</td>
                    <td className="py-2 px-3 font-mono">{pkt.time}</td>
                    <td className="py-2 px-3 font-bold">{pkt.source}</td>
                    <td className="py-2 px-3 font-bold">{pkt.destination}</td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${protocolBadge}`}>
                        {pkt.protocol}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono">{pkt.length}</td>
                    <td className="py-2 px-3 truncate max-w-[340px]">
                      {pkt.info}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredPackets.length === 0 && (
            <div className="p-6 text-center text-slate-500 text-xs">
              [-] No packets matched display filter: "{activeFilter}". Click "Clear" to restore capture stream.
            </div>
          )}
        </div>

        {/* 3A. DESKTOP INTEGRATED BOTTOM PANE (2-column layout on md and above) */}
        <div className="hidden md:grid md:grid-cols-2 md:divide-x divide-cyan-500/20 bg-[#050b14] text-xs">
          <div className="p-4 bg-[#050b14]">
            <PacketDetailsTree
              packet={selectedPacket}
              treeOpen={treeOpen}
              setTreeOpen={setTreeOpen}
            />
          </div>
          <div className="p-4 bg-[#02050a]">
            <PacketByteStream packet={selectedPacket} />
          </div>
        </div>

      </div>

      {/* 3B. MOBILE STANDALONE CONTAINER: PACKET DETAILS (Clean independent card on mobile) */}
      <div className="md:hidden w-full max-w-full rounded-2xl border border-cyan-500/30 bg-[#070e17] p-4 text-xs box-border">
        <PacketDetailsTree
          packet={selectedPacket}
          treeOpen={treeOpen}
          setTreeOpen={setTreeOpen}
        />
      </div>

      {/* 3C. MOBILE STANDALONE CONTAINER: PACKET BYTE STREAM (Clean independent card on mobile) */}
      <div className="md:hidden w-full max-w-full rounded-2xl border border-cyan-500/30 bg-[#040810] p-4 text-xs box-border">
        <PacketByteStream packet={selectedPacket} />
      </div>

      {/* 4. STANDALONE THREAT NEUTRALIZATION DOCK */}
      <div className="w-full max-w-full rounded-2xl border border-cyan-500/30 bg-[#070e17] p-4 sm:p-5 space-y-4 box-border">
        
        {/* Header & Target Isolation Counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-950 border border-red-500/50 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-red-400" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              Threat Neutralization Dock
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${
              quarantinedCount === 2 
                ? 'text-green-300 bg-green-950 border-green-500/50' 
                : 'text-amber-300 bg-amber-950/80 border-amber-500/50'
            }`}>
              TARGETS QUARANTINED: [{quarantinedCount} / 2]
            </span>
          </div>
        </div>

        {/* Dual Target Status Trackers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
            quarantinedTargets.target1
              ? 'bg-green-950/40 border-green-500/50 text-green-300'
              : 'bg-black/40 border-slate-800 text-slate-400'
          }`}>
            <span className="font-bold truncate">Target Alpha:</span>
            <span className="text-[10px] font-mono font-bold shrink-0">
              {quarantinedTargets.target1 ? 'QUARANTINED ✅' : 'PENDING ⚠️'}
            </span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
            quarantinedTargets.target2
              ? 'bg-green-950/40 border-green-500/50 text-green-300'
              : 'bg-black/40 border-slate-800 text-slate-400'
          }`}>
            <span className="font-bold truncate">Target Bravo:</span>
            <span className="text-[10px] font-mono font-bold shrink-0">
              {quarantinedTargets.target2 ? 'QUARANTINED ✅' : 'PENDING ⚠️'}
            </span>
          </div>
        </div>

        {quarantineFeedback && (
          <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 animate-in slide-in-from-top-1 ${
            quarantineFeedback.type === 'error'
              ? 'bg-red-950/80 border-red-500 text-red-200'
              : quarantineFeedback.type === 'success'
              ? 'bg-green-950/90 border-green-500 text-green-200 shadow-[0_0_15px_rgba(0,255,102,0.25)]'
              : 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
          }`}>
            {quarantineFeedback.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
            {quarantineFeedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
            {quarantineFeedback.type === 'info' && <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />}
            <span>{quarantineFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handleExecuteQuarantine} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Input 1: Rogue IP */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Identified Malicious IP:</span>
              </label>
              <input
                type="text"
                value={maliciousIpInput}
                onChange={(e) => setMaliciousIpInput(e.target.value)}
                placeholder="e.g. 198.51.100.22"
                className="w-full min-h-[44px] px-3.5 bg-black/80 border border-cyan-500/40 rounded-xl text-white placeholder:text-slate-600 text-xs font-mono focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Input 2: Leaked Token */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Extracted Token:</span>
              </label>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter leaked auth token..."
                className="w-full min-h-[44px] px-3.5 bg-black/80 border border-cyan-500/40 rounded-xl text-white placeholder:text-slate-600 text-xs font-mono focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-cyan-500"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={isSuccess}
            className={`w-full min-h-[48px] py-3 px-5 rounded-xl font-mono text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${
              isSuccess
                ? 'bg-green-600 text-white cursor-default'
                : 'bg-[#FF0055] hover:bg-[#e6004c] text-white shadow-[0_0_20px_rgba(255,0,85,0.4)] active:scale-[0.99]'
            }`}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>ALL THREATS QUARANTINED // INCIDENT RESOLVED</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>EXECUTE TARGET QUARANTINE ({quarantinedCount}/2)</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 5. INTEL MANUAL MODAL */}
      {showIntelManual && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-5 sm:p-6 rounded-2xl bg-[#070e1a] border border-cyan-500/50 shadow-[0_0_40px_rgba(0,212,255,0.3)] space-y-4 text-left font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#00D4FF]" />
                <h3 className="text-base font-bold text-white uppercase">
                  Intel Manual // Wireshark SOC Forensics
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIntelManual(false)}
                className="min-h-[32px] px-2.5 py-1 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-xs uppercase"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">Wireshark Network Forensics Protocol:</strong> In an active security incident, an adversary often utilizes cleartext HTTP conduits to synchronize beacon commands and exfiltrate confidential credentials.
              </p>
              
              <div className="p-3 rounded-xl bg-black/70 border border-cyan-500/30 font-mono space-y-2 text-[11px]">
                <div className="text-[#00D4FF] font-bold">Standard Analysis Workflow:</div>
                <div className="text-slate-300">
                  • <span className="text-green-400">Step 1:</span> Type <code className="bg-slate-900 px-1 py-0.5 rounded text-green-300">http</code> into the Display Filter bar and click Apply to isolate all unencrypted HTTP traffic from background noise.
                </div>
                <div className="text-slate-300">
                  • <span className="text-green-400">Step 2:</span> Inspect each revealed HTTP frame (Frame 2 and Frame 5) by selecting it in the packet grid.
                </div>
                <div className="text-slate-300">
                  • <span className="text-green-400">Step 3:</span> Drill down into the protocol tree and raw byte stream to extract the Destination IP and <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">X-Auth-Token</code> header for both rogue endpoints.
                </div>
                <div className="text-slate-300">
                  • <span className="text-green-400">Step 4:</span> Enter both forensic pairs into the Threat Neutralization Dock to quarantine all 2 active vectors.
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowIntelManual(false)}
                className="min-h-[40px] px-5 py-2 rounded-xl bg-cyan-600 hover:bg-[#00D4FF] text-black font-mono font-bold text-xs uppercase shadow-[0_0_15px_#00D4FF]"
              >
                Return to Forensics Suite
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

