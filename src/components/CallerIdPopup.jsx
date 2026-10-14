import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneIncoming, PhoneOff, PhoneMissed, User, UserPlus, X, Clock, Volume2 } from 'lucide-react';
import { subscribeLiveCalls, unsubscribeLiveCalls, fetchLiveCalls } from '../services/telephonyService';

/**
 * CallerIdPopup — Real-time Caller ID Notification
 * 
 * Subscribes to Supabase Realtime on live_calls table.
 * Shows popup when a new ringing event arrives.
 * Shows caller name if matched from contacts.
 * Provides quick-add contact button for unknown numbers.
 */
export default function CallerIdPopup({ contacts = [], onAddContactClick }) {
  const [activeCalls, setActiveCalls] = useState([]);
  const [dismissedCalls, setDismissedCalls] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const audioRef = useRef(null);

  // Subscribe to live_calls changes
  useEffect(() => {
    // Fetch existing live calls on mount
    fetchLiveCalls().then(calls => {
      if (calls.length > 0) {
        setActiveCalls(calls);
      }
    }).catch(() => {});

    const channel = subscribeLiveCalls((event) => {
      const { eventType, new: newRow, old: oldRow } = event;

      if (eventType === 'INSERT') {
        setActiveCalls(prev => {
          // Avoid duplicates
          const exists = prev.find(c => c.call_ref_id === newRow.call_ref_id);
          if (exists) return prev;
          return [newRow, ...prev];
        });

        // Play sound for ringing events
        if (newRow.event_type === 'ringing') {
          playRingSound();
        }
      } else if (eventType === 'UPDATE') {
        setActiveCalls(prev =>
          prev.map(c => c.call_ref_id === newRow.call_ref_id ? { ...c, ...newRow } : c)
        );
      } else if (eventType === 'DELETE') {
        const refId = oldRow?.call_ref_id;
        if (refId) {
          // Brief delay to show "ended" before removing
          setTimeout(() => {
            setActiveCalls(prev => prev.filter(c => c.call_ref_id !== refId));
            setDismissedCalls(prev => {
              const next = new Set(prev);
              next.delete(refId);
              return next;
            });
          }, 2000);
        }
      }
    });

    setIsConnected(true);

    return () => {
      unsubscribeLiveCalls();
      setIsConnected(false);
    };
  }, []);

  // Play ring notification sound
  const playRingSound = useCallback(() => {
    try {
      // Use Web Audio API for a pleasant notification chime
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Two-note chime
      const playNote = (freq, startTime, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      playNote(880, now, 0.15);       // A5
      playNote(1108.73, now + 0.15, 0.25); // C#6
      playNote(1318.51, now + 0.35, 0.3);  // E6
    } catch (err) {
      // Audio not available — fail silently
    }
  }, []);

  // Dismiss a call popup
  const dismissCall = (callRefId) => {
    setDismissedCalls(prev => new Set(prev).add(callRefId));
  };

  // Find contact info for a phone number
  const findContact = (phoneNumber) => {
    if (!phoneNumber || contacts.length === 0) return null;

    const normalize = (num) => {
      if (!num) return '';
      return num.replace(/[\s\-\(\)]/g, '')
        .replace(/^(\+30|0030)/, '')
        .replace(/^0/, '');
    };

    const normalized = normalize(phoneNumber);
    if (!normalized) return null;

    for (const contact of contacts) {
      if (!contact.phone) continue;
      const contactNorm = normalize(contact.phone);
      if (contactNorm === normalized) return contact;
      if (normalized.length >= 7 && contactNorm.endsWith(normalized.slice(-7))) return contact;
      if (contactNorm.length >= 7 && normalized.endsWith(contactNorm.slice(-7))) return contact;
    }
    return null;
  };

  // Format phone number for display
  const formatPhone = (number) => {
    if (!number) return 'Άγνωστος';
    // If it's a short extension (internal)
    if (number.length <= 5) return `Εσ. ${number}`;
    // Greek mobile: 69x xxxx xxx
    if (number.length === 10 && number.startsWith('69')) {
      return `${number.slice(0, 3)} ${number.slice(3, 7)} ${number.slice(7)}`;
    }
    // Greek landline: 281x xxxxxx
    if (number.length === 10 && number.startsWith('2')) {
      return `${number.slice(0, 4)} ${number.slice(4)}`;
    }
    return number;
  };

  // Get icon and color based on event type
  const getCallStyle = (eventType) => {
    switch (eventType) {
      case 'ringing':
        return { icon: <PhoneIncoming size={22} />, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', label: 'Εισερχόμενη κλήση', animate: true };
      case 'connected':
        return { icon: <Phone size={22} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', label: 'Σε κλήση', animate: false };
      case 'held':
        return { icon: <Clock size={22} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', label: 'Σε αναμονή', animate: false };
      case 'released':
        return { icon: <PhoneOff size={22} />, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.08)', label: 'Τερματίστηκε', animate: false };
      default:
        return { icon: <Phone size={22} />, color: '#64748b', bg: 'rgba(100, 116, 139, 0.08)', label: eventType, animate: false };
    }
  };

  // Visible calls = not dismissed, not released
  const visibleCalls = activeCalls.filter(
    c => !dismissedCalls.has(c.call_ref_id) && c.event_type !== 'released'
  );

  if (visibleCalls.length === 0) return null;

  return (
    <div className="caller-id-popup-container" id="caller-id-popup">
      {visibleCalls.map(call => {
        const style = getCallStyle(call.event_type);
        const contact = call.caller_name
          ? { name: call.caller_name }
          : findContact(call.caller_number);
        const isKnown = !!contact;

        return (
          <div
            key={call.call_ref_id}
            className={`caller-id-popup ${style.animate ? 'caller-id-ringing' : ''}`}
            style={{ borderLeftColor: style.color }}
          >
            {/* Close button */}
            <button
              className="caller-id-close"
              onClick={() => dismissCall(call.call_ref_id)}
              title="Κλείσιμο"
            >
              <X size={14} />
            </button>

            {/* Icon */}
            <div className="caller-id-icon" style={{ color: style.color, background: style.bg }}>
              {style.icon}
            </div>

            {/* Info */}
            <div className="caller-id-info">
              <div className="caller-id-status" style={{ color: style.color }}>
                {style.label}
              </div>
              <div className="caller-id-number">
                {formatPhone(call.caller_number)}
              </div>
              {isKnown && (
                <div className="caller-id-name">
                  <User size={12} />
                  {contact.name || call.caller_name}
                </div>
              )}
              {call.station_number && (
                <div className="caller-id-station">
                  Εσωτ. {call.station_number}
                  {call.station_name ? ` — ${call.station_name}` : ''}
                </div>
              )}
            </div>

            {/* Actions */}
            {!isKnown && call.caller_number && call.caller_number.length > 5 && (
              <button
                className="caller-id-add-contact"
                onClick={() => {
                  if (onAddContactClick) {
                    onAddContactClick({
                      phone: call.caller_number,
                      name: '',
                      category: 'Εξωτερικός'
                    });
                  }
                  dismissCall(call.call_ref_id);
                }}
                title="Αποθήκευση ως επαφή"
              >
                <UserPlus size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
