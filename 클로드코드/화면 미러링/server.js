const fs = require('fs');
const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const https = require('https');
const path = require('path');
const os = require('os');
const selfsigned = require('selfsigned');

process.on('uncaughtException', (err) => {
  console.error('[CRASH]', err.message);
  console.error(err.stack);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  Object.values(interfaces).forEach(list => {
    list.forEach(iface => {
      const isIPv4 = iface.family === 'IPv4' || iface.family === 4;
      if (isIPv4 && !iface.internal) ips.push(iface.address);
    });
  });
  return ips;
}

async function generateCert() {
  const CERT_FILE = path.join(__dirname, '.cert.json');
  const localIPs = getLocalIPs();

  if (fs.existsSync(CERT_FILE)) {
    try {
      const cached = JSON.parse(fs.readFileSync(CERT_FILE, 'utf8'));
      if (JSON.stringify(cached.ips) === JSON.stringify(localIPs)) return cached;
    } catch {}
  }

  console.log('Generating self-signed certificate for IPs:', localIPs);
  const altNames = [
    { type: 2, value: 'localhost' },
    { type: 7, ip: '127.0.0.1' },
    ...localIPs.map(ip => ({ type: 7, ip })),
  ];
  const pems = await selfsigned.generate(
    [{ name: 'commonName', value: 'localhost' }],
    { days: 3650, keySize: 2048, extensions: [{ name: 'subjectAltName', altNames }] }
  );
  const result = { private: pems.private, cert: pems.cert, ips: localIPs };
  fs.writeFileSync(CERT_FILE, JSON.stringify(result));
  return result;
}

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 연결된 클라이언트 관리
let agentSocket = null;
let monitorSockets = new Set();
let agentInfo = {
  connected: false,
  connectedAt: null,
  lastSeen: null,
  screenWidth: null,
  screenHeight: null,
};

// 모니터에게 에이전트 상태 브로드캐스트
function broadcastToMonitors(data) {
  const message = JSON.stringify(data);
  monitorSockets.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

async function startServer() {
  const certPems = await generateCert();

  const httpServer = http.createServer(app);
  const httpsServer = https.createServer({ key: certPems.private, cert: certPems.cert }, app);
  const wss = new WebSocket.Server({ noServer: true });

  function handleUpgrade(server) {
    server.on('upgrade', (req, socket, head) => {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    });
  }
  handleUpgrade(httpServer);
  handleUpgrade(httpsServer);

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[${new Date().toLocaleString('ko-KR')}] 새 연결: ${ip}`);

    ws.on('message', (rawData) => {
      let data;
      try {
        data = JSON.parse(rawData);
      } catch {
        return;
      }

      switch (data.type) {

        case 'agent-register':
          agentSocket = ws;
          ws.role = 'agent';
          agentInfo = {
            connected: true,
            connectedAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            screenWidth: data.screenWidth,
            screenHeight: data.screenHeight,
            pcName: data.pcName || '자녀 PC',
          };
          console.log(`[에이전트 연결] ${agentInfo.pcName}`);
          broadcastToMonitors({ type: 'agent-status', ...agentInfo });
          break;

        case 'monitor-register':
          ws.role = 'monitor';
          monitorSockets.add(ws);
          console.log(`[모니터 연결] 현재 모니터 수: ${monitorSockets.size}`);
          ws.send(JSON.stringify({ type: 'agent-status', ...agentInfo }));
          if (agentSocket && agentSocket.readyState === WebSocket.OPEN) {
            agentSocket.send(JSON.stringify({ type: 'monitor-connected' }));
          }
          break;

        case 'offer':
          broadcastToMonitors({ type: 'offer', sdp: data.sdp });
          break;

        case 'ice-candidate-agent':
          broadcastToMonitors({ type: 'ice-candidate-agent', candidate: data.candidate });
          break;

        case 'answer':
          if (agentSocket && agentSocket.readyState === WebSocket.OPEN) {
            agentSocket.send(JSON.stringify({ type: 'answer', sdp: data.sdp }));
          }
          break;

        case 'ice-candidate-monitor':
          if (agentSocket && agentSocket.readyState === WebSocket.OPEN) {
            agentSocket.send(JSON.stringify({ type: 'ice-candidate-monitor', candidate: data.candidate }));
          }
          break;

        case 'screenshot':
          agentInfo.lastSeen = new Date().toISOString();
          broadcastToMonitors({
            type: 'screenshot',
            image: data.image,
            timestamp: data.timestamp,
            activeUrl: data.activeUrl,
          });
          break;

        case 'activity':
          agentInfo.lastSeen = new Date().toISOString();
          broadcastToMonitors({
            type: 'activity',
            activeUrl: data.activeUrl,
            title: data.title,
            timestamp: new Date().toISOString(),
          });
          break;

        case 'heartbeat':
          if (ws.role === 'agent') {
            agentInfo.lastSeen = new Date().toISOString();
            agentInfo.connected = true;
            ws.send(JSON.stringify({ type: 'heartbeat-ack' }));
            broadcastToMonitors({ type: 'agent-status', ...agentInfo });
          }
          break;

        case 'request-stream':
          if (agentSocket && agentSocket.readyState === WebSocket.OPEN) {
            agentSocket.send(JSON.stringify({ type: 'start-stream' }));
          }
          break;

        case 'stop-stream':
          if (agentSocket && agentSocket.readyState === WebSocket.OPEN) {
            agentSocket.send(JSON.stringify({ type: 'stop-stream' }));
          }
          break;
      }
    });

    ws.on('close', () => {
      if (ws.role === 'agent') {
        console.log('[에이전트 연결 종료]');
        agentSocket = null;
        agentInfo.connected = false;
        broadcastToMonitors({ type: 'agent-status', ...agentInfo });
      } else if (ws.role === 'monitor') {
        monitorSockets.delete(ws);
        console.log(`[모니터 연결 종료] 남은 모니터: ${monitorSockets.size}`);
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket 오류:', err.message);
    });
  });

  // API: 서버 상태
  app.get('/api/status', (req, res) => {
    res.json({
      server: 'running',
      agent: agentInfo,
      monitors: monitorSockets.size,
      time: new Date().toISOString(),
    });
  });

  function onError(label) {
    return (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[ERROR] Port already in use (${label}).`);
        console.error('Close the existing server window and try again.\n');
      } else {
        console.error('[ERROR]', err.message);
      }
      process.exit(1);
    };
  }

  httpServer.on('error', onError('HTTP'));
  httpsServer.on('error', onError('HTTPS'));

  httpServer.listen(PORT, '0.0.0.0', () => {
    httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
      const localIPs = getLocalIPs();
      const mainIP = localIPs.length > 0 ? localIPs[0] : 'localhost';

      console.log('\n========================================');
      console.log('  Screen Monitor - Server Started');
      console.log('========================================');
      console.log('\n  [HTTP - 로컬 전용]');
      console.log('    http://localhost:' + PORT);
      console.log('\n  [HTTPS - IP 접속용 (화면공유 필수)]');
      localIPs.forEach(ip => console.log('    https://' + ip + ':' + HTTPS_PORT));
      console.log('\n  [브라우저에서 열기]');
      console.log('  Agent   (자녀 PC) : https://' + mainIP + ':' + HTTPS_PORT + '/agent.html');
      console.log('  Monitor (부모 PC) : https://' + mainIP + ':' + HTTPS_PORT + '/monitor.html');
      console.log('\n  ※ HTTPS 최초 접속 시 "안전하지 않음" 경고 → 고급 → 계속 진행 클릭');
      console.log('========================================');
      console.log('  Press Ctrl+C to stop the server.');
      console.log('========================================\n');
    });
  });
}

startServer().catch(err => {
  console.error('[FATAL]', err.message);
  process.exit(1);
});
