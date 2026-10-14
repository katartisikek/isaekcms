/**
 * Supabase Sync Module
 * 
 * Receives iPECS events and syncs them to Supabase:
 * - Call events → live_calls table (real-time popup)
 * - SMDR events → call_log table (history)
 * - Contact lookup → match caller_number to contacts
 */
import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

const log = (level, msg, data = null) => {
  const ts = new Date().toISOString();
  const prefix = { info: 'ℹ️', warn: '⚠️', error: '❌', debug: '🔍' }[level] || '  ';
  console.log(`[${ts}] ${prefix} [Supabase] ${msg}`);
  if (data && config.bridge.logLevel === 'debug') {
    console.log(JSON.stringify(data, null, 2));
  }
};

let supabase = null;

/**
 * Initialize Supabase client with service role key
 */
export function initSupabase() {
  supabase = createClient(config.supabase.url, config.supabase.serviceKey);
  log('info', '✅ Supabase client initialized');
  return supabase;
}

// ──────────────────────────────────────────────────────────
// Contact Lookup
// ──────────────────────────────────────────────────────────

// In-memory cache of contacts for fast phone lookup
let contactsCache = [];
let lastCacheRefresh = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Refresh contacts cache from Supabase
 */
async function refreshContactsCache() {
  try {
    const { data, error } = await supabase.from('contacts').select('id, name, phone, role');
    if (error) throw error;
    contactsCache = data || [];
    lastCacheRefresh = Date.now();
    log('info', `Contacts cache refreshed: ${contactsCache.length} contacts`);
  } catch (err) {
    log('error', `Failed to refresh contacts cache: ${err.message}`);
  }
}

/**
 * Look up a phone number in contacts
 * Returns { id, name } or null
 */
async function lookupContact(phoneNumber) {
  if (!phoneNumber) return null;

  // Refresh cache if stale
  if (Date.now() - lastCacheRefresh > CACHE_TTL) {
    await refreshContactsCache();
  }

  // Normalize the number: remove spaces, dashes, leading +30 or 0030
  const normalize = (num) => {
    if (!num) return '';
    return num.replace(/[\s\-\(\)]/g, '')
      .replace(/^(\+30|0030)/, '')
      .replace(/^0/, '');
  };

  const normalized = normalize(phoneNumber);
  if (!normalized) return null;

  // Try exact match first, then suffix match (last 10 digits)
  for (const contact of contactsCache) {
    if (!contact.phone) continue;
    const contactNorm = normalize(contact.phone);
    
    if (contactNorm === normalized) {
      return { id: contact.id, name: contact.name };
    }
    // Suffix match — useful when PBX sends full number but contact has local format
    if (normalized.length >= 10 && contactNorm.endsWith(normalized.slice(-10))) {
      return { id: contact.id, name: contact.name };
    }
    if (contactNorm.length >= 10 && normalized.endsWith(contactNorm.slice(-10))) {
      return { id: contact.id, name: contact.name };
    }
  }

  // Also try matching against students
  try {
    const { data } = await supabase
      .from('students')
      .select('id, "fullName", phone')
      .or(`phone.ilike.%${normalized.slice(-7)}%`)
      .limit(1);
    
    if (data && data.length > 0) {
      return { id: `student:${data[0].id}`, name: data[0].fullName };
    }
  } catch (err) {
    log('debug', `Student lookup failed: ${err.message}`);
  }

  return null;
}

// ──────────────────────────────────────────────────────────
// Call Events → live_calls
// ──────────────────────────────────────────────────────────

/**
 * Map iPECS call event type to our simplified event types
 */
function mapCallEventType(ipecsType) {
  const mapping = {
    'alerting': 'ringing',
    'ringing': 'ringing',
    'dialing': 'dialing',
    'connected': 'connected',
    'released': 'released',
    'releasedasc': 'released',
    'held': 'held',
    'retrieved': 'connected',
    'transferred': 'transferred',
    'forwarding': 'forwarding'
  };
  return mapping[ipecsType] || ipecsType;
}

/**
 * Handle a call event from iPECS WebSocket
 */
export async function handleCallEvent(eventData) {
  if (!supabase) return;

  const eventType = mapCallEventType(eventData.type);
  const callRefId = eventData.callRefID;

  // Look up caller in contacts
  const contact = await lookupContact(eventData.callingDN);

  const liveCall = {
    call_ref_id: callRefId,
    event_type: eventType,
    caller_number: eventData.callingDN || null,
    caller_name: contact?.name || null,
    called_number: eventData.calledDN || null,
    station_number: eventData.deviceNumber || null,
    station_name: null,
    contact_id: contact?.id || null,
    updated_at: new Date().toISOString()
  };

  try {
    if (eventType === 'released') {
      // When call is released, update the record and schedule cleanup
      const { error } = await supabase
        .from('live_calls')
        .update({ event_type: 'released', updated_at: new Date().toISOString() })
        .eq('call_ref_id', callRefId);

      if (error) {
        log('debug', `No live call to release for ref ${callRefId}`);
      }

      // Schedule deletion after delay (so the UI can show "ended" briefly)
      setTimeout(async () => {
        try {
          await supabase.from('live_calls').delete().eq('call_ref_id', callRefId);
          log('debug', `Cleaned up live_call ref=${callRefId}`);
        } catch (e) {
          log('warn', `Cleanup failed for ref ${callRefId}: ${e.message}`);
        }
      }, config.bridge.liveCallCleanupDelay);

      log('info', `📴 Call released: ref=${callRefId}`);
    } else {
      // Upsert — creates new record on ringing, updates on connected/held
      const { error } = await supabase
        .from('live_calls')
        .upsert(liveCall, { onConflict: 'call_ref_id' });

      if (error) throw error;
      log('info', `📞 Live call ${eventType}: ref=${callRefId} | ${eventData.callingDN} → ${eventData.calledDN}${contact ? ` (${contact.name})` : ''}`);
    }
  } catch (err) {
    log('error', `Failed to sync call event: ${err.message}`);
  }
}

// ──────────────────────────────────────────────────────────
// SMDR Events → call_log
// ──────────────────────────────────────────────────────────

/**
 * Map iPECS direction codes to human-readable directions
 */
function mapDirection(dirCode) {
  const mapping = {
    'I': 'incoming',
    'O': 'outgoing',
    'E': 'internal',
    'R': 'missed',      // Missed during ringing
    'G': 'missed',      // Missed during group ring/queue
    'H': 'missed',      // Missed during hold
    'T': 'outgoing',    // Transfer outgoing
    't': 'incoming',    // Transfer incoming
    'o': 'missed',      // Outgoing unanswered
    'P': 'internal',    // Internal page
    'S': 'internal'     // Internal SMS
  };
  return mapping[dirCode] || 'unknown';
}

/**
 * Parse duration string "HH:MM:SS" to seconds
 */
function parseDuration(durationStr) {
  if (!durationStr) return 0;
  const parts = durationStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * Determine call status from SMDR data
 */
function determineStatus(smdrData) {
  const dir = smdrData.Direction;
  const duration = parseDuration(smdrData.Duration);

  // Missed call codes
  if (['R', 'G', 'H', 'o'].includes(dir)) {
    return 'missed';
  }
  // If incoming/outgoing with zero duration
  if (duration === 0 && ['I', 'O'].includes(dir)) {
    return 'missed';
  }
  return 'answered';
}

/**
 * Handle an SMDR event from iPECS WebSocket
 */
export async function handleSmdrEvent(smdrData) {
  if (!supabase) return;

  const direction = mapDirection(smdrData.Direction);
  const callerNumber = direction === 'outgoing' 
    ? smdrData.StationNumber 
    : smdrData['Dialed Number'] || smdrData.StationNumber;
  const calledNumber = direction === 'outgoing'
    ? smdrData['Dialed Number']
    : smdrData.StationNumber;

  // Look up caller in contacts
  const contact = await lookupContact(callerNumber);

  const callLogEntry = {
    id: `smdr-${smdrData.Index || Date.now()}-${smdrData.callRefID || Math.random().toString(36).slice(2, 8)}`,
    call_ref_id: smdrData.callRefID || null,
    direction,
    caller_number: callerNumber || null,
    caller_name: contact?.name || smdrData.StationName || null,
    called_number: calledNumber || null,
    station_number: smdrData.StationNumber || null,
    station_name: smdrData.StationName || null,
    start_time: smdrData.StartTime ? new Date(smdrData.StartTime).toISOString() : new Date().toISOString(),
    duration: smdrData.Duration || '00:00:00',
    duration_seconds: parseDuration(smdrData.Duration),
    status: determineStatus(smdrData),
    disconnect_cause: null,
    contact_id: contact?.id || null,
    co_number: smdrData.CoNumber || null,
    notes: null,
    raw_data: smdrData
  };

  try {
    const { error } = await supabase.from('call_log').upsert(callLogEntry);
    if (error) throw error;
    log('info', `📋 Call logged: ${direction} | ${callerNumber} → ${calledNumber} | ${smdrData.Duration}${contact ? ` (${contact.name})` : ''}`);
  } catch (err) {
    log('error', `Failed to log SMDR: ${err.message}`);
  }
}

// ──────────────────────────────────────────────────────────
// ACD Events (supplementary — extract Caller ID info)
// ──────────────────────────────────────────────────────────

/**
 * Handle an ACD event
 * Event code 72 = INCOMING CALLER — contains caller ID info
 */
export async function handleAcdEvent(acdData) {
  if (!supabase) return;

  // Code 72: INCOMING CALLER — has Data1=Phone, Data2=Name
  if (acdData.eventCode === 72) {
    const callerPhone = acdData.data1;
    const callerName = acdData.data2;

    if (callerPhone) {
      log('info', `🔔 Caller ID from ACD: ${callerPhone} — ${callerName || 'unknown'}`);

      // Update any ringing live_call with the caller name from ACD
      try {
        const { error } = await supabase
          .from('live_calls')
          .update({ 
            caller_number: callerPhone,
            caller_name: callerName || undefined,
            updated_at: new Date().toISOString()
          })
          .eq('station_number', acdData.sourceNumber)
          .eq('event_type', 'ringing');

        if (error) log('debug', `ACD caller ID update: ${error.message}`);
      } catch (err) {
        log('debug', `ACD event processing: ${err.message}`);
      }
    }
  }
}

// ──────────────────────────────────────────────────────────
// Startup / Cleanup
// ──────────────────────────────────────────────────────────

/**
 * Clear stale live_calls on startup
 */
export async function cleanupStaleLiveCalls() {
  if (!supabase) return;

  try {
    const { error } = await supabase.from('live_calls').delete().neq('id', '');
    if (error) throw error;
    log('info', '🧹 Cleared stale live_calls');
  } catch (err) {
    log('warn', `Failed to clean live_calls: ${err.message}`);
  }
}

/**
 * Fetch call log with optional filters
 * Used by the bridge server's mini REST API
 */
export async function fetchCallLog({ limit = 50, offset = 0, direction = null, search = null } = {}) {
  if (!supabase) return [];

  let query = supabase
    .from('call_log')
    .select('*')
    .order('start_time', { ascending: false })
    .range(offset, offset + limit - 1);

  if (direction) {
    query = query.eq('direction', direction);
  }
  if (search) {
    query = query.or(`caller_number.ilike.%${search}%,caller_name.ilike.%${search}%,called_number.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    log('error', `fetchCallLog failed: ${error.message}`);
    return [];
  }
  return data || [];
}
