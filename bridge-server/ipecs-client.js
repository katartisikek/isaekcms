/**
 * iPECS SME Web API Client
 * 
 * Handles REST API authentication and WebSocket event streaming
 * Based on: iPECS SME System Web API Specification v1.0F
 * 
 * Flow:
 * 1. Login (Basic Auth → JWT token)
 * 2. Open WebSocket for real-time events
 * 3. Start monitoring extensions
 * 4. Receive call/smdr/acd events
 * 5. Keep session alive via checkConnection / WS ping-pong
 */
import WebSocket from 'ws';
import { config } from './config.js';
import { EventEmitter } from 'events';

// Ignore self-signed SSL certs (iPECS uses self-signed)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

class IpecsClient extends EventEmitter {
  constructor() {
    super();
    this.token = null;
    this.ws = null;
    this.checkConnectionTimer = 120; // seconds, from login response
    this.keepAliveInterval = null;
    this.reconnectTimeout = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 50;
    this.reconnectDelay = 5000; // ms, increases exponentially
  }

  /**
   * Log with timestamp and level
   */
  log(level, msg, data = null) {
    const ts = new Date().toISOString();
    const prefix = { info: 'ℹ️', warn: '⚠️', error: '❌', debug: '🔍' }[level] || '  ';
    console.log(`[${ts}] ${prefix} [iPECS] ${msg}`);
    if (data && config.bridge.logLevel === 'debug') {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  // ──────────────────────────────────────────────────────────
  // REST API Methods
  // ──────────────────────────────────────────────────────────

  /**
   * Login to iPECS Web API
   * GET /login with Basic Auth → returns JWT token
   */
  async login() {
    this.log('info', `Logging in to ${config.ipecs.host}:${config.ipecs.port}...`);
    
    const credentials = Buffer.from(`${config.ipecs.userId}:${config.ipecs.password}`).toString('base64');
    
    try {
      const response = await fetch(`${config.ipecs.baseUrl}/login`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Login failed: ${response.status} ${response.statusText} — ${text}`);
      }

      const data = await response.json();
      this.token = data.token;
      this.checkConnectionTimer = data.checkConnectionTimer || 120;

      this.log('info', `Login successful!`);
      this.log('info', `   System: ${data.systemType || 'unknown'} v${data.systemVersion || '?'}`);
      this.log('info', `   API version: ${data.apiVersion || '?'}`);
      this.log('info', `   Features: ${data.feature || 'N/A'}`);
      this.log('info', `   Session timeout: ${this.checkConnectionTimer}s`);

      this.reconnectAttempts = 0;
      return data;
    } catch (err) {
      this.log('error', `Login failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Authenticated API request helper
   */
  async apiRequest(method, endpoint, body = null) {
    if (!this.token) {
      throw new Error('Not logged in — call login() first');
    }

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const url = `${config.ipecs.baseUrl}${endpoint}`;
    const response = await fetch(url, options);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API ${method} ${endpoint}: ${response.status} — ${text}`);
    }

    // Some responses have no body
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || response.status === 204) {
      return null;
    }

    return response.json();
  }

  /**
   * Keep session alive — call before checkConnectionTimer expires
   */
  async checkConnection() {
    try {
      await this.apiRequest('POST', '/checkconnection');
      this.log('debug', 'checkConnection OK');
    } catch (err) {
      this.log('warn', `checkConnection failed: ${err.message}`);
      // Session expired — try re-login
      await this.reconnect();
    }
  }

  /**
   * Start monitoring extensions for call events
   * POST /call/monitor with deviceList
   */
  async startMonitor() {
    const extensions = config.ipecs.monitorExtensions;
    if (extensions.length === 0) {
      this.log('warn', 'No extensions configured to monitor');
      return;
    }

    this.log('info', `Starting monitor for ${extensions.length} extensions: ${extensions.join(', ')}`);

    try {
      const result = await this.apiRequest('POST', '/call/monitor', {
        deviceList: extensions
      });
      this.log('info', '✅ Monitor started successfully');
      return result;
    } catch (err) {
      this.log('error', `Failed to start monitor: ${err.message}`);
      throw err;
    }
  }

  /**
   * Stop monitoring extensions
   */
  async stopMonitor() {
    try {
      await this.apiRequest('DELETE', '/call/monitor');
      this.log('info', 'Monitor stopped');
    } catch (err) {
      this.log('warn', `Failed to stop monitor: ${err.message}`);
    }
  }

  /**
   * Make a call (Click-to-Call)
   * POST /call/makecall
   */
  async makeCall(callingDN, calledDN) {
    this.log('info', `Making call: ${callingDN} → ${calledDN}`);
    return this.apiRequest('POST', '/call/makecall', {
      callingDN,
      calledDN
    });
  }

  /**
   * Logout and cleanup
   */
  async logout() {
    this.log('info', 'Logging out...');
    try {
      await this.apiRequest('POST', '/logout');
    } catch (err) {
      this.log('warn', `Logout request failed: ${err.message}`);
    }
    this.cleanup();
    this.log('info', 'Logged out');
  }

  // ──────────────────────────────────────────────────────────
  // WebSocket Methods
  // ──────────────────────────────────────────────────────────

  /**
   * Connect to iPECS WebSocket for real-time events
   */
  connectWebSocket() {
    if (!this.token) {
      this.log('error', 'Cannot connect WebSocket — not logged in');
      return;
    }

    const wsUrl = `${config.ipecs.wsUrl}`;
    this.log('info', `Connecting WebSocket to ${wsUrl}...`);

    this.ws = new WebSocket(wsUrl, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      rejectUnauthorized: false // Self-signed cert
    });

    this.ws.on('open', () => {
      this.log('info', '✅ WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');

      // Start keepalive timer (slightly before session timeout)
      this.startKeepAlive();
    });

    this.ws.on('message', (rawData) => {
      try {
        const message = JSON.parse(rawData.toString());
        this.handleEvent(message);
      } catch (err) {
        this.log('warn', `Failed to parse WS message: ${err.message}`);
        this.log('debug', `Raw: ${rawData.toString().substring(0, 500)}`);
      }
    });

    this.ws.on('close', (code, reason) => {
      this.log('warn', `WebSocket closed: code=${code}, reason=${reason || 'none'}`);
      this.isConnected = false;
      this.emit('disconnected', { code, reason: reason?.toString() });
      this.scheduleReconnect();
    });

    this.ws.on('error', (err) => {
      this.log('error', `WebSocket error: ${err.message}`);
      this.isConnected = false;
    });

    this.ws.on('pong', () => {
      this.log('debug', 'WebSocket pong received');
    });
  }

  /**
   * Handle incoming WebSocket event
   */
  handleEvent(message) {
    const { event, data } = message;

    switch (event) {
      case 'call':
        this.log('info', `📞 Call event: ${data.type} | caller=${data.callingDN || '?'} → called=${data.calledDN || '?'} | device=${data.deviceNumber || '?'} | ref=${data.callRefID}`);
        this.emit('call', data);
        break;

      case 'smdr':
        this.log('info', `📋 SMDR event: station=${data.StationNumber} | dir=${data.Direction} | duration=${data.Duration} | dialed=${data['Dialed Number']}`);
        this.emit('smdr', data);
        break;

      case 'acd':
        this.log('info', `🎯 ACD event: ${data.eventString} | source=${data.sourceNumber} | code=${data.eventCode}`);
        this.emit('acd', data);
        break;

      default:
        this.log('debug', `Unknown event type: ${event}`, data);
        this.emit('unknown', message);
    }
  }

  /**
   * Send periodic keepalive pings
   */
  startKeepAlive() {
    this.stopKeepAlive();

    // Ping every half of the checkConnectionTimer to stay well within timeout
    const intervalMs = Math.max((this.checkConnectionTimer / 2) * 1000, 30000);
    this.log('info', `KeepAlive interval: ${intervalMs / 1000}s`);

    this.keepAliveInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
        this.log('debug', 'Sent WebSocket ping');
      } else {
        // WS is down, also try REST keepalive
        this.checkConnection().catch(() => {});
      }
    }, intervalMs);
  }

  stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  /**
   * Auto-reconnect with exponential backoff
   */
  scheduleReconnect() {
    if (this.reconnectTimeout) return;

    this.reconnectAttempts++;
    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      this.log('error', `Max reconnect attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
      this.emit('fatal', 'Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1), 60000);
    this.log('info', `Reconnecting in ${(delay / 1000).toFixed(1)}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = null;
      await this.reconnect();
    }, delay);
  }

  /**
   * Full reconnect: login → WebSocket → start monitor
   */
  async reconnect() {
    this.log('info', '🔄 Reconnecting...');
    this.cleanup(false); // Don't reset reconnect counter

    try {
      await this.login();
      this.connectWebSocket();
      // Wait for WS connection, then start monitor
      this.once('connected', async () => {
        try {
          await this.startMonitor();
        } catch (err) {
          this.log('error', `Failed to restart monitor: ${err.message}`);
        }
      });
    } catch (err) {
      this.log('error', `Reconnect failed: ${err.message}`);
      this.scheduleReconnect();
    }
  }

  /**
   * Cleanup all connections and timers
   */
  cleanup(resetCounter = true) {
    this.stopKeepAlive();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.removeAllListeners();
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }

    this.token = null;
    this.isConnected = false;
    if (resetCounter) {
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Full startup sequence
   */
  async start() {
    await this.login();
    this.connectWebSocket();

    // Wait for WebSocket connection, then start monitoring
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout (30s)'));
      }, 30000);

      this.once('connected', async () => {
        clearTimeout(timeout);
        try {
          await this.startMonitor();
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    this.log('info', '🛑 Shutting down...');
    try {
      await this.stopMonitor();
    } catch (e) { /* ignore */ }
    try {
      await this.logout();
    } catch (e) { /* ignore */ }
    this.cleanup();
    this.log('info', 'Shutdown complete');
  }
}

// Singleton instance
export const ipecsClient = new IpecsClient();
