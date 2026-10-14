/**
 * Telephony Service
 * 
 * Manages Supabase Realtime subscriptions for live_calls
 * and provides API methods for call_log queries.
 * Used by CallerIdPopup and CallLog components.
 */
import { supabase } from '../supabaseClient';

// ──────────────────────────────────────────────────────────
// Realtime Subscriptions
// ──────────────────────────────────────────────────────────

let liveCallsChannel = null;

/**
 * Subscribe to real-time live_calls changes
 * Calls onEvent({ eventType, new, old }) for INSERT/UPDATE/DELETE
 */
export function subscribeLiveCalls(onEvent) {
  // Unsubscribe previous if any
  unsubscribeLiveCalls();

  liveCallsChannel = supabase
    .channel('live-calls-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'live_calls'
      },
      (payload) => {
        onEvent({
          eventType: payload.eventType, // 'INSERT', 'UPDATE', 'DELETE'
          new: payload.new,
          old: payload.old
        });
      }
    )
    .subscribe((status) => {
      console.log('[Telephony] live_calls subscription:', status);
    });

  return liveCallsChannel;
}

/**
 * Unsubscribe from live_calls changes
 */
export function unsubscribeLiveCalls() {
  if (liveCallsChannel) {
    supabase.removeChannel(liveCallsChannel);
    liveCallsChannel = null;
  }
}

// ──────────────────────────────────────────────────────────
// Call Log Queries
// ──────────────────────────────────────────────────────────

/**
 * Fetch call log with filters
 */
export async function fetchCallLog({
  limit = 50,
  offset = 0,
  direction = null,
  search = '',
  dateFrom = null,
  dateTo = null,
  station = null
} = {}) {
  let query = supabase
    .from('call_log')
    .select('*', { count: 'exact' })
    .order('start_time', { ascending: false })
    .range(offset, offset + limit - 1);

  if (direction) {
    query = query.eq('direction', direction);
  }

  if (search) {
    query = query.or(
      `caller_number.ilike.%${search}%,caller_name.ilike.%${search}%,called_number.ilike.%${search}%,station_name.ilike.%${search}%`
    );
  }

  if (dateFrom) {
    query = query.gte('start_time', dateFrom);
  }
  if (dateTo) {
    // Add one day to include the full end date
    const endDate = new Date(dateTo);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt('start_time', endDate.toISOString());
  }

  if (station) {
    query = query.eq('station_number', station);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('fetchCallLog error:', error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

/**
 * Fetch current live calls
 */
export async function fetchLiveCalls() {
  const { data, error } = await supabase
    .from('live_calls')
    .select('*')
    .order('started_at', { ascending: false });

  if (error) {
    console.error('fetchLiveCalls error:', error);
    return [];
  }
  return data || [];
}

/**
 * Get call statistics for a period
 */
export async function getCallStats(dateFrom = null, dateTo = null) {
  let query = supabase
    .from('call_log')
    .select('direction, status, duration_seconds');

  if (dateFrom) {
    query = query.gte('start_time', dateFrom);
  }
  if (dateTo) {
    const endDate = new Date(dateTo);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt('start_time', endDate.toISOString());
  }

  const { data, error } = await query;
  if (error) {
    console.error('getCallStats error:', error);
    return null;
  }

  const stats = {
    total: data.length,
    incoming: data.filter(c => c.direction === 'incoming').length,
    outgoing: data.filter(c => c.direction === 'outgoing').length,
    missed: data.filter(c => c.direction === 'missed' || c.status === 'missed').length,
    internal: data.filter(c => c.direction === 'internal').length,
    answered: data.filter(c => c.status === 'answered').length,
    avgDuration: data.length > 0
      ? Math.round(data.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / data.filter(c => c.duration_seconds > 0).length)
      : 0,
    totalDuration: data.reduce((sum, c) => sum + (c.duration_seconds || 0), 0)
  };

  return stats;
}

/**
 * Update call log entry notes
 */
export async function updateCallNote(callId, notes) {
  const { error } = await supabase
    .from('call_log')
    .update({ notes })
    .eq('id', callId);

  if (error) {
    console.error('updateCallNote error:', error);
    throw error;
  }
}

/**
 * Delete a call log entry
 */
export async function deleteCallLogEntry(callId) {
  const { error } = await supabase
    .from('call_log')
    .delete()
    .eq('id', callId);

  if (error) {
    console.error('deleteCallLogEntry error:', error);
    throw error;
  }
}
