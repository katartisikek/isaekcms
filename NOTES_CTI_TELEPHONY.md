# 📞 Σημειώσεις — Ενσωμάτωση Τηλεφωνικού Κέντρου (CTI) με ISAEK CMS

**Ημερομηνία αρχικής συζήτησης:** 1 Σεπτεμβρίου 2026  
**Τελευταία ενημέρωση:** 25 Σεπτεμβρίου 2026  
**Κατάσταση:** ✅ Φάσεις 1+2 υλοποιήθηκαν — Αναμονή στοιχείων iPECS από sysadmin για go-live

---

## 1. Τι θέλουμε να κάνουμε

Σύνδεση του τηλεφωνικού κέντρου (Ericsson-LG iPECS SME) με το ISAEK CMS ώστε:

1. **Caller ID σε πραγματικό χρόνο** — Όταν χτυπάει το τηλέφωνο, να εμφανίζεται popup στην οθόνη με τον αριθμό
2. **Αναγνώριση καλούντος** — Αν ο αριθμός υπάρχει ήδη στις επαφές, να δείχνει το όνομα/στοιχεία
3. **Αποθήκευση νέας επαφής** — Αν ο αριθμός δεν υπάρχει, γρήγορη φόρμα αποθήκευσης (όνομα, εταιρεία κλπ)
4. **Ιστορικό κλήσεων** — Log εισερχόμενων/εξερχόμενων/αναπάντητων
5. **Click-to-Call** — Κλήση απευθείας από τον κατάλογο επαφών του CMS

---

## 2. Τι βρήκαμε στο Documentation

### 2.1 Τύπος Τηλεφωνικού Κέντρου

- **Μοντέλο:** Ericsson-LG iPECS SME System
- **Documentation:** `iPECS SME System Web API Specification v1.0F` (Nov 2021)
- **Τεχνολογία:** Ενσωματωμένο **REST API (HTTPS)** + **WebSocket (WSS)**
- **ΣΗΜΑΝΤΙΚΟ:** Δεν χρειάζεται CSTA middleware ή εξωτερικό adapter — η Ericsson-LG παρέχει τα πάντα ενσωματωμένα στο PBX!

### 2.2 Διαθέσιμα API Features

| Feature | Τι Κάνει | Πώς Λειτουργεί | License |
|---------|----------|-----------------|---------|
| **SMDR** | Ιστορικό κλήσεων (caller, duration, direction) | REST GET + WebSocket events | API-SMDR |
| **CTI Call Events** | Real-time events: ringing, connected, released, hold, transfer | WebSocket events | API-CTI (server) |
| **Call Control** | Make/Answer/Hold/Transfer/Conference/Pickup/DND/Forwarding | REST POST commands | API-CTI + API-CTI-EXT (per client) |
| **ACD** | Agent login/logout, queue events, UCD group status | WebSocket events | API-AMP |
| **Click-to-Call** | Κλήση από web εφαρμογή → τηλέφωνο γραφείου | REST POST | CLICKCALL |
| **Presence** | Κατάσταση τερματικών (idle, busy, DND, forward) | REST + WebSocket | API-CTI |
| **CO Check** | Κατάσταση CO γραμμών | REST + WebSocket | API-CTI |

### 2.3 Πρωτόκολλο Σύνδεσης

**Base URI:**
```
HTTPS:     https://{IP_ADDRESS}:{PORT}/ipxapi
WebSocket: wss://{IP_ADDRESS}:{PORT}/ipxapi/server/v1/users/{UserID}
```

**Authentication:** HTTP Basic Authentication (RFC 7617) → Επιστρέφει JWT token  
**Session:** Token expires μετά από 2 λεπτά χωρίς δραστηριότητα — πρέπει να στέλνουμε checkConnection ή να έχουμε WebSocket ανοιχτό (Ping/Pong)  
**Max logins:** 3 Web API accounts ταυτόχρονα  
**Format:** JSON για όλα τα requests/responses

---

## 3. Τεχνική Αρχιτεκτονική

### 3.1 Σύνδεση API (REST + WebSocket)

```
iPECS SME PBX (LAN — HTTPS + WSS)
    │
    ├── REST API: https://{IP}:{PORT}/ipxapi/server/v1/users/{userID}/...
    │   ├── GET  /login              → Authentication (Basic Auth → JWT token)
    │   ├── POST /checkconnection    → Keep session alive
    │   ├── POST /logout             → Logout
    │   ├── GET  /smdr               → Ιστορικό κλήσεων (GET/DELETE)
    │   ├── POST /call/monitor       → Start monitoring extensions (max 100)
    │   ├── DELETE /call/monitor      → Stop monitoring
    │   ├── GET  /call/monitor        → Get monitor status
    │   ├── POST /call/makecall      → Make a call
    │   ├── POST /call/answercall    → Answer a call
    │   ├── POST /call/holdcall      → Hold
    │   ├── POST /call/transfercall  → Transfer
    │   └── ... (30+ call control commands)
    │
    └── WebSocket: wss://{IP}:{PORT}/ipxapi/server/v1/users/{userID}
        ├── event: "call"  → CTI events (dialing, alerting, ringing, connected, released, hold...)
        ├── event: "smdr"  → SMDR data σε real-time μετά το τέλος κλήσης
        └── event: "acd"   → ACD events (agent login/logout, station busy/idle, queue events)
```

### 3.2 Σημαντικά Call Events (μέσω WebSocket)

Τα events που μας ενδιαφέρουν κυρίως:

| Event Type | Πότε | Τι Περιέχει |
|------------|------|-------------|
| `alerting` | Ο καλών ακούει κουδούνι | `callingDN`, `calledDN`, `causeCode`, `deviceNumber` |
| `ringing` | Χτυπάει το τηλέφωνο μας | `callingDN` (αριθμός καλούντος), `calledDN`, `callRefID` |
| `connected` | Απάντηση κλήσης | `callingDN`, `calledDN`, `diversionNum` |
| `released` | Τερματισμός κλήσης | `releasedDN`, `causeMsg` (π.χ. `normal_clearing`) |
| `releasedasc` | Ο αντίθετος τερμάτισε | `releasedAscDN`, `causeCode` |
| `held` / `retrieved` | Hold / Retrieve | `callRefID` |
| `transferred` | Transfer ολοκληρώθηκε | `callingDN`, `calledDN` |
| `forwarding` | Call forwarding event | `forwardDN`, forward type |

**Παράδειγμα Ringing Event (JSON μέσω WebSocket):**
```json
{
  "event": "call",
  "data": {
    "type": "ringing",
    "deviceNumber": "605108",
    "serviceDN": "605001",
    "callingDN": "601206",
    "calledDN": "605001",
    "causeCode": 22,
    "causeMsg": "new_call",
    "callRefID": 17,
    "evtSerialNum": 68
  }
}
```

### 3.3 SMDR Event (ιστορικό κλήσεων)

**Παράδειγμα SMDR Event (JSON μέσω WebSocket):**
```json
{
  "event": "smdr",
  "data": {
    "Index": "7",
    "callRefID": 4,
    "StationNumber": "2008",
    "StationName": "MyStation",
    "CoNumber": "0",
    "Duration": "00:00:04",
    "StartTime": "2020-06-16 14:51",
    "Direction": "E",
    "Dialed Number": "006",
    "Cost": ""
  }
}
```

**Direction Codes:**

| Code | Σημασία |
|------|---------|
| `I` | Εισερχόμενη εξωτερική κλήση |
| `O` | Εξερχόμενη εξωτερική κλήση |
| `E` | Εσωτερική κλήση (ICM) |
| `R` | Χαμένη κλήση κατά το κουδούνισμα |
| `G` | Χαμένη κλήση κατά group ring/queue |
| `H` | Χαμένη κλήση κατά hold |
| `T` | Transfer εξερχόμενη |
| `t` | Transfer εισερχόμενη |
| `o` | Εξερχόμενη αναπάντητη |
| `P` | Internal page |
| `S` | Internal SMS |

### 3.4 ACD Events

Για κάθε event λαμβάνουμε:
```json
{
  "event": "acd",
  "data": {
    "time": "2020/01/07 14:47:04",
    "callRefID": 2,
    "eventCode": 18,
    "eventString": "STATION IDLE",
    "sourceType": "Station",
    "sourceNumber": "1004",
    "destType": "",
    "destNumber": "",
    "data1": "",
    "data2": ""
  }
}
```

**Σημαντικά ACD Event Codes:**

| Code | Event | Σημασία |
|------|-------|---------|
| 3 | CO IN RING | Εισερχόμενη κλήση — χτυπάει (caller ID εδώ!) |
| 17 | STATION BUSY | Τηλέφωνο σε χρήση |
| 18 | STATION IDLE | Τηλέφωνο ελεύθερο |
| 41 | SEIZE STATION/CO | Κλήση ξεκίνησε |
| 42 | SEIZE ACK/CONNECT/ANSWER | Κλήση απαντήθηκε |
| 44 | DISCONNECT | Κλήση τερματίστηκε |
| 66 | STATION RING | Κουδούνισμα σε σταθμό |
| 72 | INCOMING CALLER | **Caller ID info** (Data1=Phone, Data2=Name) |

---

## 4. Πρόκληση: Δίκτυο & CORS

Το iPECS PBX βρίσκεται στο **τοπικό δίκτυο (LAN)**, ενώ το ISAEK CMS τρέχει στο **Vercel (cloud)**.

**Η σύνδεση browser → iPECS δεν γίνεται απευθείας γιατί:**
1. Το PBX δεν είναι προσβάσιμο από το internet
2. CORS restrictions — το PBX δεν θα επιτρέψει requests από vercel.app
3. Self-signed SSL certificate — ο browser θα τα μπλοκάρει

### 4.1 Εναλλακτικές Λύσεις

| Λύση | Πλεονεκτήματα | Μειονεκτήματα |
|------|---------------|---------------|
| **A) Proxy Server (τοπικό PC)** | Απλό, γρήγορο setup | Πρέπει να τρέχει πάντα ένα PC |
| **B) Cloudflare Tunnel / ngrok** | Εκθέτει το PBX API στο internet ασφαλώς | Πολυπλοκότητα, latency |
| **C) Edge Function + VPN** | Καθαρή αρχιτεκτονική | Σύνθετο setup |
| **✅ D) Node.js Bridge Server στο LAN** | Τρέχει σε PC/Raspberry Pi, proxy events μέσω Supabase Realtime | Αξιόπιστο, low-cost, μόνιμο |

### 4.2 Προτεινόμενη Αρχιτεκτονική (Λύση D)

```
iPECS SME PBX (τοπικό δίκτυο)
    │ WSS + HTTPS (τοπικά)
    ▼
┌─────────────────────────────────────────────┐
│  Node.js Bridge Server                       │
│  (τρέχει σε PC ή Raspberry Pi στο LAN)       │
│                                              │
│  ✓ Συνδέεται στο iPECS via REST + WebSocket  │
│  ✓ Λαμβάνει call events real-time            │
│  ✓ Αποθηκεύει SMDR στο Supabase (call_log)   │
│  ✓ Στέλνει real-time events μέσω Supabase    │
│    Realtime (INSERT σε live_calls table)      │
│  ✓ Auto-reconnect αν πέσει η σύνδεση        │
└─────────────────────────────────────────────┘
    │ HTTPS (internet)
    ▼
┌─────────────────────────────────────────────┐
│  Supabase (Cloud)                            │
│                                              │
│  Tables:                                     │
│  ├── call_log (ιστορικό κλήσεων)             │
│  ├── live_calls (active/ringing calls)       │
│  └── contacts (υπάρχουσες επαφές)            │
│                                              │
│  Realtime: Subscriptions για live_calls      │
└─────────────────────────────────────────────┘
    │ Supabase Realtime (WebSocket)
    ▼
┌─────────────────────────────────────────────┐
│  ISAEK CMS (Vercel — Browser)                │
│                                              │
│  ✓ Subscribe στο live_calls table            │
│  ✓ Popup notification σε ringing event       │
│  ✓ Lookup caller στις contacts               │
│  ✓ Call Log UI με φίλτρα                     │
│  ✓ Click-to-Call (μέσω bridge server API)    │
└─────────────────────────────────────────────┘
```

---

## 5. Database Schema

### 5.1 Νέος πίνακας: `call_log`

```sql
CREATE TABLE call_log (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  call_ref_id integer,
  direction text,              -- 'incoming', 'outgoing', 'missed', 'internal'
  caller_number text,          -- αριθμός καλούντος
  caller_name text,            -- όνομα (από contacts lookup ή SMDR StationName)
  called_number text,          -- αριθμός που κλήθηκε
  station_number text,         -- εσωτερικό extension
  station_name text,           -- όνομα σταθμού
  start_time timestamptz,      -- χρόνος έναρξης
  duration text,               -- 'hh:mm:ss'
  duration_seconds integer,    -- διάρκεια σε δευτερόλεπτα (για sorting/filtering)
  status text,                 -- 'answered', 'missed', 'busy', 'rejected'
  disconnect_cause text,       -- αιτία τερματισμού
  contact_id text,             -- FK → contacts.id (αν βρέθηκε αντιστοίχιση)
  co_number text,              -- CO line number
  notes text,
  raw_data jsonb,              -- πλήρες SMDR/event JSON για debugging
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_call_log_start_time ON call_log(start_time DESC);
CREATE INDEX idx_call_log_caller ON call_log(caller_number);
CREATE INDEX idx_call_log_direction ON call_log(direction);
CREATE INDEX idx_call_log_station ON call_log(station_number);
```

### 5.2 Νέος πίνακας: `live_calls` (για real-time popup)

```sql
CREATE TABLE live_calls (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  call_ref_id integer UNIQUE,
  event_type text,             -- 'ringing', 'connected', 'released'
  caller_number text,
  caller_name text,            -- auto-matched from contacts
  called_number text,
  station_number text,
  station_name text,
  contact_id text,             -- FK → contacts.id
  started_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Αυτόματο cleanup: διαγραφή released calls μετά από 30 δευτερόλεπτα
-- (θα γίνεται από τον bridge server)
```

---

## 6. Φάσεις Υλοποίησης

### Φάση 0: Prerequisites (Sysadmin)
- [ ] IP Address & Port του iPECS Web API server
- [ ] Δημιουργία Web API account (Maintenance → User Management → Privilege: Web API → check CTI + SMDR)
- [ ] Επιβεβαίωση ενεργών licenses: API-CTI (server) + API-SMDR (minimum)
- [ ] Ενεργοποίηση "CALL TRACKING Enable" (System Data → System Attributes, PGM 160-161)
- [ ] Ενεργοποίηση "Call Control Web API Usage" (Station Data → Common Attributes, PGM 111) — αν θέλουμε call control
- [ ] Ενεργοποίηση "Web API Service" (System Data → System Attributes, PGM 160-161) — ορισμός port
- [ ] Test σύνδεση μέσω demo page: `https://{IP}:{PORT}/apidemo.html`

### Φάση 1: Bridge Server + Caller ID Popup 🔔
**Εκτίμηση: 2-3 ημέρες**

Τι θα φτιάξουμε:
1. **Node.js Bridge Server** (τρέχει στο LAN)
   - Login στο iPECS API (Basic Auth → JWT)
   - WebSocket connection για real-time events
   - Monitor Start για τα extensions
   - Αποθήκευση events στο Supabase (live_calls + call_log)
   - Auto-reconnect + keepalive (checkConnection)
2. **CMS Component: CallerIdPopup**
   - Supabase Realtime subscription στο `live_calls`
   - Popup notification: αριθμός, όνομα (αν βρεθεί στις contacts), κουμπί "Αποθήκευση Επαφής"
   - Sound notification

### Φάση 2: Ιστορικό Κλήσεων (Call Log) 📋
**Εκτίμηση: 1-2 ημέρες**

1. **CMS Component: CallLog page**
   - Πίνακας κλήσεων με:
     - Ημερομηνία/ώρα
     - Αριθμός (caller/called)
     - Όνομα (από contacts)
     - Direction (εισερχόμενη/εξερχόμενη/αναπάντητη/εσωτερική — με εικονίδια)
     - Διάρκεια
     - Extension/Station
   - Φίλτρα: ημερομηνία, αριθμός, direction, station
   - Click σε αριθμό → άνοιγμα επαφής ή δημιουργία νέας
   - Export σε Excel

### Φάση 3: Click-to-Call 📞
**Εκτίμηση: 1 ημέρα**

1. Κουμπί "📞 Κλήση" δίπλα σε κάθε αριθμό στο CMS (Contacts, Students)
2. POST request → Bridge Server → iPECS `makecall` API
3. Το τηλέφωνο του γραφείου σηκώνεται αυτόματα και καλεί τον αριθμό

**Απαιτείται:** API-CTI-EXT license (per extension) + CLICKCALL license

---

## 7. Authentication Flow (αναλυτικά)

```
1. Client → GET /ipxapi/server/v1/users/{userID}/login
   Headers: Authorization: Basic base64(id:password)

2. Server → 200 OK
   Body: {
     "token": "{JWT_TOKEN}",
     "checkConnectionTimer": 120,
     "feature": "ACD,SMDR,CTI",
     "systemType": "iPECS SME",
     "systemVersion": "S-UCP-Rls2001-4.0.11-App",
     "apiVersion": "1.0.0"
   }

3. Client → Αποθηκεύει token
   Χρησιμοποιεί: Authorization: Bearer {JWT_TOKEN} σε κάθε request

4. Client → POST /checkconnection κάθε <checkConnectionTimer> δευτερόλεπτα
   ΄Η αν έχει WebSocket ανοιχτό, κρατάει session μέσω Ping/Pong

5. Client → POST /logout (για τερματισμό session)
```

---

## 8. Σημειώσεις & Περιορισμοί

- **Max 3 Web API accounts** μπορούν να είναι logged in ταυτόχρονα
- **Monitor Start** μπορεί να παρακολουθεί max **100 extensions** ανά request
- **Session timeout**: 2 λεπτά χωρίς δραστηριότητα (configurable)
- **SMDR default**: Max 50 records per request (configurable up to 100)
- **WebSocket**: Μία σύνδεση αρκεί για να λαμβάνεις SMDR + ACD + CTI events
- **Self-signed cert**: Ο bridge server θα πρέπει να αγνοεί SSL errors (`NODE_TLS_REJECT_UNAUTHORIZED=0`)
- **iPECS firmware**: Πρέπει να είναι 4.0+ για Web API support

---

## 9. Χρονοδιάγραμμα

| Φάση | Χρόνος | Κατάσταση |
|------|--------|-----------|
| Φάση 0: Στοιχεία από sysadmin | — | ⏳ Αναμονή |
| Φάση 1: Bridge Server + Caller ID Popup | 2-3 ημέρες | ✅ Ολοκληρώθηκε (25/9/2026) |
| Φάση 2: Call Log UI στο CMS | 1-2 ημέρες | ✅ Ολοκληρώθηκε (25/9/2026) |
| Φάση 3: Click-to-Call | 1 ημέρα | ⬜ Μετά — χρειάζεται CTI-EXT + CLICKCALL license |

---

## 10. Πρόοδος & Επόμενα Βήματα

1. ✅ Αρχική συζήτηση & σχεδιασμός (1/9/2026)
2. ✅ Ανάλυση iPECS SME Web API documentation (18/9/2026)
3. ⏳ **Ζητήσαμε από sysadmin / Ericsson:**
   - IP και port του iPECS Web API
   - Δημιουργία Web API account με CTI + SMDR privileges
   - Επιβεβαίωση ότι οι licenses (API-CTI, API-SMDR) είναι ενεργές
   - Ενεργοποίηση "Call Tracking Enable" και "Call Control Web API Usage"
   - Test σε `https://{IP}:{PORT}/apidemo.html`
4. ✅ Κατασκευή Node.js Bridge Server — `bridge-server/` (25/9/2026)
5. ✅ Δημιουργία database tables — `telephony_migration.sql` (25/9/2026)
6. ✅ Κατασκευή CallerIdPopup component (25/9/2026)
7. ✅ Κατασκευή CallLog page (25/9/2026)
8. ✅ Ενσωμάτωση στο App.jsx — sidebar, views, CSS (25/9/2026)
9. ✅ **Build verified — 0 errors** (25/9/2026)
10. ⬜ Τρέξιμο `telephony_migration.sql` στο Supabase SQL Editor
11. ⬜ Deploy CMS στο Vercel (push → auto-deploy)
12. ⬜ **Μόλις πάρουμε στοιχεία iPECS:** setup bridge-server .env → npm start → test
13. ⬜ Click-to-Call integration (Φάση 3 — χρειάζεται CTI-EXT license)
14. ⬜ Full testing & go-live

---

## 11. 📝 Αναλυτικό Log Υλοποίησης (25/9/2026)

### Τι φτιάχτηκε σήμερα — Πλήρης λίστα αρχείων

#### A. Bridge Server (`bridge-server/`)
Ξεχωριστό Node.js app που τρέχει σε PC/server στο LAN.
Συνδέεται στο iPECS PBX μέσω REST+WebSocket και στέλνει events στο Supabase.

| Αρχείο | Τι κάνει |
|--------|----------|
| `bridge-server/package.json` | Dependencies: ws, @supabase/supabase-js, dotenv, node-fetch |
| `bridge-server/.env.example` | Template config — **αντιγραφή σε .env και συμπλήρωση στοιχείων** |
| `bridge-server/config.js` | Φόρτωση env vars, validation, baseUrl/wsUrl helpers |
| `bridge-server/ipecs-client.js` | iPECS REST API (login, monitor, makecall, logout) + WebSocket (events). Auto-reconnect με exponential backoff, keepalive timer, graceful shutdown |
| `bridge-server/supabase-sync.js` | Call events → `live_calls` table (upsert on ringing/connected, delete on released). SMDR events → `call_log` table. Contact lookup cache (αναγνώριση καλούντος). ACD event code 72 enrichment |
| `bridge-server/index.js` | Main entry point. Wires iPECS events → Supabase sync. Mini REST API: `/health`, `/status`, `POST /call` (click-to-call), `GET /calls` (call log query) |

**Πώς τρέχει:**
```bash
cd bridge-server
copy .env.example .env      # Συμπλήρωσε τα στοιχεία
npm install
npm start                    # Ή: node --watch index.js (dev mode)
```

**Τι χρειάζεται στο .env:**
- `IPECS_HOST` — IP του iPECS PBX (π.χ. 192.168.1.100)
- `IPECS_PORT` — Port Web API (π.χ. 8443)
- `IPECS_USER_ID` — Web API username
- `IPECS_PASSWORD` — Web API password
- `IPECS_MONITOR_EXTENSIONS` — Extensions για monitoring (π.χ. 1001,1002,1003)
- `SUPABASE_URL` — URL του Supabase project
- `SUPABASE_SERVICE_KEY` — **Service Role** key (ΟΧΙ anon key!)

#### B. CMS Components (React — στον υπάρχοντα κώδικα)

| Αρχείο | Τι κάνει |
|--------|----------|
| `src/services/telephonyService.js` | Supabase Realtime subscription στο `live_calls`. fetchCallLog() με φίλτρα (direction, date, search, station). getCallStats(). updateCallNote(). deleteCallLogEntry() |
| `src/components/CallerIdPopup.jsx` | Floating popup πάνω-δεξιά. Εμφανίζεται real-time σε ringing event. Ring animation + ήχος (Web Audio API chime). Δείχνει αριθμό, όνομα (αν βρεθεί σε contacts), εσωτερικό. Κουμπί "Αποθήκευση ως Επαφή" για άγνωστους αριθμούς. Auto-dismiss μετά από released |
| `src/components/CallLog.jsx` | Πλήρης σελίδα ιστορικού κλήσεων. Πίνακας: ημ/νία, ώρα, αριθμός, όνομα, εσωτερικό, διάρκεια, κατάσταση. Φίλτρα: κατεύθυνση, ημ/νία από-έως, εσωτερικό, αναζήτηση. Stats panel: σύνολο, εισερχόμενες, εξερχόμενες, αναπάντητες, μέση διάρκεια. Pagination (30 ανά σελίδα). Inline notes (σημείωση ανά κλήση). CSV export με Ελληνικά (BOM encoding) |

#### C. Τροποποιημένα αρχεία

| Αρχείο | Αλλαγές |
|--------|---------|
| `src/App.jsx` | +3 imports (CallerIdPopup, CallLog, PhoneCall icon). +sidebar section "📞 Τηλεφωνικό Κέντρο" → "Ιστορικό Κλήσεων". +view rendering `currentView === 'call_log'`. +CallerIdPopup overlay (πάντα ενεργό) |
| `src/index.css` | +545 γραμμές CSS. Caller ID popup: glassmorphism, slide-in animation, pulse glow, ring icon wobble. Call Log: table styling, filter panel, stats cards, pagination, note editor, status badges, spinning animation |
| `database_schema.sql` | +52 γραμμές: `call_log` table, `live_calls` table, indexes, RLS disabled, Realtime publication |

#### D. Database Migration

| Αρχείο | Τι κάνει |
|--------|----------|
| `telephony_migration.sql` | Standalone script. Δημιουργεί `call_log` (ιστορικό κλήσεων, 17 columns + indexes) και `live_calls` (real-time active calls, 11 columns + unique constraint). RLS disabled. Realtime enabled για `live_calls`. **Τρέξε στο Supabase SQL Editor!** |

---

## 12. 🚀 Βήματα Go-Live (Δευτέρα)

### Βήμα 1: Database Migration (μπορεί να γίνει τώρα)
1. Πήγαινε στο **Supabase Dashboard → SQL Editor**
2. Κάνε paste τα περιεχόμενα του `telephony_migration.sql`
3. Πάτα **Run**
4. Επιβεβαίωσε ότι δημιουργήθηκαν οι πίνακες: `call_log`, `live_calls`
5. Πήγαινε **Database → Replication** → Βεβαιώσου ότι `live_calls` είναι enabled στο Realtime

### Βήμα 2: Deploy CMS
1. Κάνε `git add . && git commit && git push`
2. Vercel κάνει auto-deploy
3. Ανοίγεις το CMS → στο sidebar εμφανίζεται **📞 Τηλεφωνικό Κέντρο → Ιστορικό Κλήσεων**
4. Η σελίδα θα δείχνει "Δεν υπάρχουν κλήσεις ακόμα" — σωστό, γιατί δεν τρέχει ακόμα ο bridge

### Βήμα 3: Bridge Server (μόλις πάρουμε στοιχεία iPECS)
1. Αντέγραψε `bridge-server/.env.example` → `bridge-server/.env`
2. Συμπλήρωσε: `IPECS_HOST`, `IPECS_PORT`, `IPECS_USER_ID`, `IPECS_PASSWORD`
3. Βάλε τα extensions: `IPECS_MONITOR_EXTENSIONS=1001,1002,1003,...`
4. Βάλε το **Supabase Service Role Key** (Settings → API → service_role)
5. `cd bridge-server && npm install && npm start`
6. Αν δεις `✅ Bridge Server fully operational!` → δουλεύει!

### Βήμα 4: Test
1. Κάνε μια δοκιμαστική κλήση στο τηλεφωνικό κέντρο
2. Στο CMS πρέπει να εμφανιστεί **popup** (πάνω-δεξιά) με τον αριθμό
3. Μετά τον τερματισμό, η κλήση πρέπει να φαίνεται στο **Ιστορικό Κλήσεων**

---

## 13. ⏳ Τι Εκκρεμεί / Σημειώσεις για Δευτέρα

### Αναμονή από Sysadmin / Ericsson-LG:
- [ ] IP Address & Port του iPECS Web API server
- [ ] Web API account credentials (CTI + SMDR privileges)
- [ ] Επιβεβαίωση licenses: API-CTI (server), API-SMDR
- [ ] Ενεργοποίηση "CALL TRACKING Enable" (PGM 160-161)
- [ ] Ενεργοποίηση "Web API Service" (PGM 160-161)
- [ ] Test σε `https://{IP}:{PORT}/apidemo.html`

### Μετά:
- [ ] Τρέξιμο `telephony_migration.sql` στο Supabase SQL Editor
- [ ] Deploy CMS (git push)
- [ ] Setup bridge-server .env με τα στοιχεία iPECS
- [ ] `npm install && npm start` στον bridge server
- [ ] End-to-end test (κλήση → popup → call log)
- [ ] Αν θέλουμε Click-to-Call: χρειάζεται API-CTI-EXT + CLICKCALL license

### Πιθανά θέματα που μπορεί να χρειαστούν debugging:
- **Self-signed SSL cert**: Ο bridge server το αγνοεί (`NODE_TLS_REJECT_UNAUTHORIZED=0`)
- **Firewall**: Βεβαιώσου ότι το PC/server βλέπει το iPECS στο LAN
- **Max 3 sessions**: Αν γίνει disconnect, μπορεί να χρειαστεί restart στο PBX ή αναμονή session timeout (2 λεπτά)
- **Monitor max 100 extensions**: Αν έχει πάνω από 100, πρέπει split σε batches

---

## 14. Αρχεία Documentation

- `public/iPECS SME System Web API _v1.0F_Eng_1701841742691 (1).pdf` — Πλήρες API specification (136 σελίδες)
- `public/APIs and Interfaces for unified systems.pptx` — Παρουσίαση APIs
- `public/pdf_output/` — Extracted text από το PDF (για αναφορά)
