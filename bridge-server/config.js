/**
 * iPECS Bridge Server — Configuration
 * Φορτώνει env vars και παρέχει validated config object
 */
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // iPECS PBX
  ipecs: {
    host: process.env.IPECS_HOST || '192.168.1.100',
    port: parseInt(process.env.IPECS_PORT || '8443', 10),
    userId: process.env.IPECS_USER_ID || 'webapi',
    password: process.env.IPECS_PASSWORD || '',
    monitorExtensions: (process.env.IPECS_MONITOR_EXTENSIONS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    get baseUrl() {
      return `https://${this.host}:${this.port}/ipxapi/server/v1/users/${this.userId}`;
    },
    get wsUrl() {
      return `wss://${this.host}:${this.port}/ipxapi/server/v1/users/${this.userId}`;
    }
  },

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || ''
  },

  // Bridge Server
  bridge: {
    port: parseInt(process.env.BRIDGE_PORT || '3099', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
    liveCallCleanupDelay: parseInt(process.env.LIVE_CALL_CLEANUP_DELAY || '30', 10) * 1000
  }
};

/**
 * Validate that essential config exists
 */
export function validateConfig() {
  const errors = [];

  if (!config.ipecs.password) {
    errors.push('IPECS_PASSWORD is required');
  }
  if (!config.supabase.url) {
    errors.push('SUPABASE_URL is required');
  }
  if (!config.supabase.serviceKey) {
    errors.push('SUPABASE_SERVICE_KEY is required');
  }
  if (config.ipecs.monitorExtensions.length === 0) {
    errors.push('IPECS_MONITOR_EXTENSIONS must have at least one extension');
  }

  if (errors.length > 0) {
    console.error('❌ Configuration errors:');
    errors.forEach(e => console.error(`   - ${e}`));
    console.error('\n📋 Copy .env.example to .env and fill in your values.');
    process.exit(1);
  }

  console.log('✅ Configuration validated');
  console.log(`   iPECS: ${config.ipecs.host}:${config.ipecs.port} (user: ${config.ipecs.userId})`);
  console.log(`   Monitor: ${config.ipecs.monitorExtensions.join(', ')}`);
  console.log(`   Supabase: ${config.supabase.url}`);
  console.log(`   Bridge port: ${config.bridge.port}`);
}
