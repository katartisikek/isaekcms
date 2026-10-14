/**
 * iPECS Bridge Server — Main Entry Point
 * 
 * Αρχιτεκτονική:
 *   iPECS PBX ←→ [Bridge Server] ←→ Supabase ←→ ISAEK CMS Browser
 * 
 * Τρέχει σε PC/server στο LAN που βλέπει το iPECS PBX.
 * Λαμβάνει real-time call events και τα στέλνει στο Supabase
 * ώστε το CMS (Vercel) να τα βλέπει μέσω Supabase Realtime.
 * 
 * Usage:
 *   1. Copy .env.example → .env
 *   2. Fill in iPECS + Supabase credentials
 *   3. npm install
 *   4. npm start
 */
import http from 'http';
import { config, validateConfig } from './config.js';
import { ipecsClient } from './ipecs-client.js';
import {
  initSupabase,
  handleCallEvent,
  handleSmdrEvent,
  handleAcdEvent,
  cleanupStaleLiveCalls,
  fetchCallLog
} from './supabase-sync.js';

// ──────────────────────────────────────────────────────────
// Banner
// ──────────────────────────────────────────────────────────
console.log(`
╔═══════════════════════════════════════════════════════╗
║  📞  ISAEK iPECS Bridge Server  v1.0                  ║
║  Connects iPECS SME PBX → Supabase → ISAEK CMS       ║
╚═══════════════════════════════════════════════════════╝
`);

// ──────────────────────────────────────────────────────────
// Startup
// ──────────────────────────────────────────────────────────
validateConfig();
initSupabase();

// Clean up any stale live_calls from previous session
await cleanupStaleLiveCalls();

// ──────────────────────────────────────────────────────────
// Wire iPECS events → Supabase sync
// ──────────────────────────────────────────────────────────
ipecsClient.on('call', async (data) => {
  try {
    await handleCallEvent(data);
  } catch (err) {
    console.error('Error handling call event:', err.message);
  }
});

ipecsClient.on('smdr', async (data) => {
  try {
    await handleSmdrEvent(data);
  } catch (err) {
    console.error('Error handling SMDR event:', err.message);
  }
});

ipecsClient.on('acd', async (data) => {
  try {
    await handleAcdEvent(data);
  } catch (err) {
    console.error('Error handling ACD event:', err.message);
  }
});

ipecsClient.on('fatal', (reason) => {
  console.error(`💀 Fatal: ${reason}`);
  console.error('Bridge server will exit. Restart with: npm start');
  process.exit(1);
});

// ──────────────────────────────────────────────────────────
// Mini REST API (for Click-to-Call from CMS)
// ──────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${config.bridge.port}`);

  // Health check
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      connected: ipecsClient.isConnected,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Status — detailed info
  if (url.pathname === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: ipecsClient.isConnected ? 'connected' : 'disconnected',
      ipecs: {
        host: config.ipecs.host,
        port: config.ipecs.port,
        extensions: config.ipecs.monitorExtensions,
        connected: ipecsClient.isConnected
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Click-to-Call: POST /call { from: "1001", to: "2103456789" }
  if (url.pathname === '/call' && req.method === 'POST') {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }

    try {
      const { from, to } = JSON.parse(body);
      if (!from || !to) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing "from" or "to" field' }));
        return;
      }

      await ipecsClient.makeCall(from, to);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: `Call initiated: ${from} → ${to}` }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Call log: GET /calls?limit=50&offset=0&direction=incoming&search=694
  if (url.pathname === '/calls' && req.method === 'GET') {
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const direction = url.searchParams.get('direction');
    const search = url.searchParams.get('search');

    const data = await fetchCallLog({ limit, offset, direction, search });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(config.bridge.port, () => {
  console.log(`\n🌐 Bridge REST API running on http://localhost:${config.bridge.port}`);
  console.log(`   GET  /health       — Health check`);
  console.log(`   GET  /status       — Detailed status`);
  console.log(`   POST /call         — Click-to-Call { from, to }`);
  console.log(`   GET  /calls        — Call log query\n`);
});

// ──────────────────────────────────────────────────────────
// Connect to iPECS
// ──────────────────────────────────────────────────────────
try {
  await ipecsClient.start();
  console.log('\n✅ Bridge Server fully operational!\n');
  console.log('Waiting for call events...\n');
} catch (err) {
  console.error(`\n❌ Failed to connect to iPECS: ${err.message}`);
  console.error('The bridge server will keep trying to reconnect.\n');
  ipecsClient.scheduleReconnect();
}

// ──────────────────────────────────────────────────────────
// Graceful shutdown
// ──────────────────────────────────────────────────────────
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully...`);
  server.close();
  await ipecsClient.shutdown();
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
