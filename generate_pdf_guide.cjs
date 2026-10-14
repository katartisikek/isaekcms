const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workspaceDir = __dirname;
const brainDir = 'C:\\Users\\MASTER\\.gemini\\antigravity-ide\\brain\\96f87492-37e5-47ff-82bb-3c0dbfa266dc';

const imgCoverPath = path.join(brainDir, 'teacher_portal_cover_1791971832334.jpg');
const imgClockPath = path.join(brainDir, 'clock_in_attendance_1791971848519.jpg');
const imgGradesPath = path.join(brainDir, 'grades_evaluation_1791971866427.jpg');

function toBase64(filePath) {
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).replace('.', '') || 'jpeg';
    const data = fs.readFileSync(filePath).toString('base64');
    return `data:image/${ext};base64,${data}`;
  }
  return '';
}

const coverBase64 = toBase64(imgCoverPath);
const clockBase64 = toBase64(imgClockPath);
const gradesBase64 = toBase64(imgGradesPath);

console.log('Images loaded into base64:', {
  cover: coverBase64.length > 0,
  clock: clockBase64.length > 0,
  grades: gradesBase64.length > 0
});

const htmlContent = `<!DOCTYPE html>
<html lang="el">
<head>
<meta charset="UTF-8">
<title>Οδηγός Χρήσης Πύλης Εκπαιδευτών - ISAEK CMS</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  @page {
    size: A4 portrait;
    margin: 14mm 14mm 16mm 14mm;
    @bottom-right {
      content: counter(page);
    }
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    background: #ffffff;
    line-height: 1.55;
    font-size: 13.5px;
    margin: 0;
    padding: 0;
  }

  /* Page Break Utilities */
  .page {
    page-break-after: always;
    position: relative;
    min-height: 260mm;
    padding-bottom: 10px;
  }
  .page:last-child {
    page-break-after: avoid;
  }
  .avoid-break {
    page-break-inside: avoid;
  }

  /* Cover Page */
  .cover-page {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 265mm;
    padding: 20px 10px;
    page-break-after: always;
  }
  .cover-header {
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .cover-inst-badge {
    display: inline-block;
    background: #eff6ff;
    color: #1d4ed8;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 20px;
    border: 1px solid #bfdbfe;
  }
  .cover-version {
    font-size: 12px;
    color: #64748b;
    font-weight: 600;
  }
  .cover-title-area {
    margin: 25px 0 15px 0;
  }
  .cover-title {
    font-size: 30px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.2;
    margin: 0 0 10px 0;
    letter-spacing: -0.02em;
  }
  .cover-title span {
    color: #2563eb;
  }
  .cover-subtitle {
    font-size: 15px;
    color: #475569;
    margin: 0;
    font-weight: 400;
    line-height: 1.45;
  }
  .cover-img-container {
    width: 100%;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    border: 1px solid #cbd5e1;
    margin: 20px 0;
  }
  .cover-img {
    width: 100%;
    height: auto;
    display: block;
  }
  .cover-cards-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 10px;
  }
  .cover-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 14px;
  }
  .cover-card-title {
    font-size: 11px;
    text-transform: uppercase;
    color: #64748b;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .cover-card-desc {
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
  }
  .cover-footer {
    border-top: 1px solid #e2e8f0;
    padding-top: 12px;
    display: flex;
    justify-content: space-between;
    font-size: 11.5px;
    color: #64748b;
  }

  /* Headers & Structure */
  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 20px 0 12px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid #e2e8f0;
  }
  .section-num {
    background: #2563eb;
    color: #ffffff;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
  }
  .section-title {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }
  h3 {
    font-size: 14.5px;
    font-weight: 700;
    color: #1e293b;
    margin: 14px 0 6px 0;
  }
  p {
    margin: 0 0 10px 0;
    color: #334155;
  }

  /* Steps Component */
  .step-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 12px;
    border-left: 4px solid #2563eb;
  }
  .step-title {
    font-weight: 700;
    color: #0f172a;
    font-size: 13.5px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .step-desc {
    color: #475569;
    font-size: 12.5px;
    margin: 0;
    line-height: 1.5;
  }

  /* Image Figure Box */
  .figure-box {
    margin: 14px 0;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  .figure-img {
    width: 100%;
    height: auto;
    display: block;
  }
  .figure-caption {
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    padding: 8px 14px;
    font-size: 11.5px;
    color: #475569;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
  }

  /* Callout / Alert Boxes */
  .callout {
    padding: 12px 14px;
    border-radius: 8px;
    margin: 12px 0;
    font-size: 12.5px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  .callout-info {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1e40af;
  }
  .callout-warning {
    background: #fffbeb;
    border: 1px solid #fde68a;
    color: #92400e;
  }
  .callout-success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
  }
  .callout-icon {
    font-size: 16px;
    flex-shrink: 0;
    line-height: 1;
  }

  /* UI Mockup Widget */
  .ui-mockup {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    overflow: hidden;
    margin: 14px 0;
    box-shadow: 0 4px 10px rgba(0,0,0,0.04);
  }
  .ui-mockup-header {
    background: #0f172a;
    color: #ffffff;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .ui-mockup-body {
    padding: 14px;
    background: #f8fafc;
  }

  /* Interactive Buttons preview */
  .btn-demo {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 11.5px;
    text-align: center;
    border: none;
  }
  .btn-demo-blue { background: #3b82f6; color: #ffffff; }
  .btn-demo-red { background: #ef4444; color: #ffffff; }
  .btn-demo-green { background: #10b981; color: #ffffff; }

  /* Tables */
  .doc-table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 12px;
  }
  .doc-table th {
    background: #f1f5f9;
    color: #334155;
    font-weight: 700;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid #cbd5e1;
  }
  .doc-table td {
    padding: 7px 10px;
    border: 1px solid #e2e8f0;
    color: #334155;
  }
  .doc-table tr:nth-child(even) {
    background: #f8fafc;
  }

  /* Badges */
  .badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
  }
  .badge-green { background: #dcfce7; color: #15803d; }
  .badge-red { background: #fee2e2; color: #b91c1c; }
  .badge-blue { background: #dbeafe; color: #1d4ed8; }

  /* Table of Contents */
  .toc-list {
    list-style: none;
    padding: 0;
    margin: 15px 0;
  }
  .toc-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 4px;
    border-bottom: 1px dashed #cbd5e1;
    font-size: 13px;
    font-weight: 500;
  }
  .toc-item strong {
    color: #0f172a;
    font-weight: 600;
  }
  .toc-page {
    color: #2563eb;
    font-weight: 700;
  }

  /* Header & Footer in Pages */
  .page-running-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10.5px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 6px;
    margin-bottom: 14px;
  }
</style>
</head>
<body>

  <!-- ==================== PAGE 1: COVER ==================== -->
  <div class="page cover-page">
    <div class="cover-header">
      <span class="cover-inst-badge">ΙΣΑΕΚ • ΠΥΛΗ ΕΚΠΑΙΔΕΥΤΩΝ</span>
      <span class="cover-version">ΕΠΙΣΗΜΟ ΕΓΧΕΙΡΙΔΙΟ v2.0</span>
    </div>

    <div class="cover-title-area">
      <h1 class="cover-title">Οδηγός Χρήσης <span>Πύλης Καθηγητών</span></h1>
      <p class="cover-subtitle">Ολοκληρωμένος πρακτικός οδηγός για την ηλεκτρονική υποβολή παρουσιολογίων, το ψηφιακό χτύπημα κάρτας και την καταχώρηση εξαμηνιαίων βαθμολογιών.</p>
    </div>

    <div class="cover-img-container">
      <img src="${coverBase64}" class="cover-img" alt="Teacher Portal Cover Graphic">
    </div>

    <div class="cover-cards-summary">
      <div class="cover-card">
        <div class="cover-card-title">ΨΗΦΙΑΚΟ ΩΡΑΡΙΟ</div>
        <div class="cover-card-desc">Έναρξη & Λήξη Μαθήματος με 1 Κλικ</div>
      </div>
      <div class="cover-card">
        <div class="cover-card-title">ΑΠΟΥΣΙΟΛΟΓΙΟ</div>
        <div class="cover-card-desc">Αυτόματη Καταγραφή & Συγχρονισμός</div>
      </div>
      <div class="cover-card">
        <div class="cover-card-title">ΒΑΘΜΟΛΟΓΙΟ</div>
        <div class="cover-card-desc">Εργασία 20% & Τελική Εξέταση 80%</div>
      </div>
    </div>

    <div class="cover-footer">
      <span>Επιμελητήριο Ηρακλείου — Σύστημα ISAEK CMS</span>
      <span>Έκδοση Εγγράφου: 2026 • Τμήμα Εκπαίδευσης & Γραμματείας</span>
    </div>
  </div>

  <!-- ==================== PAGE 2: TABLE OF CONTENTS & CHAPTER 1 ==================== -->
  <div class="page">
    <div class="page-running-header">
      <span>ΙΣΑΕΚ CMS — ΕΓΧΕΙΡΙΔΙΟ ΕΚΠΑΙΔΕΥΤΗ</span>
      <span>ΠΕΡΙΕΧΟΜΕΝΑ & ΕΙΣΟΔΟΣ</span>
    </div>

    <div class="section-header">
      <div class="section-num">📋</div>
      <h2 class="section-title">Πίνακας Περιεχομένων</h2>
    </div>

    <ul class="toc-list">
      <li class="toc-item">
        <span><strong>1. Εισαγωγή & Σύνδεση στην Πύλη (Login)</strong> — Πρόσβαση και επιλογή προφίλ</span>
        <span class="toc-page">Σελ. 2</span>
      </li>
      <li class="toc-item">
        <span><strong>2. Περιβάλλον Εργασίας (Dashboard)</strong> — Μετρητές και τα μαθήματά μου</span>
        <span class="toc-page">Σελ. 3</span>
      </li>
      <li class="toc-item">
        <span><strong>3. Δήλωση Μαθήματος & «Χτύπημα Κάρτας»</strong> — Ώρες Άφιξης/Αναχώρησης</span>
        <span class="toc-page">Σελ. 4</span>
      </li>
      <li class="toc-item">
        <span><strong>4. Καταχώρηση Απουσιολογίου</strong> — Διαχείριση παρουσιών σπουδαστών</span>
        <span class="toc-page">Σελ. 5</span>
      </li>
      <li class="toc-item">
        <span><strong>5. Καταχώρηση Βαθμολογιών</strong> — Εργασία 20%, Τελική 80% & Τελικός Βαθμός</span>
        <span class="toc-page">Σελ. 6</span>
      </li>
      <li class="toc-item">
        <span><strong>6. Ιστορικό Δηλώσεων & Συχνές Ερωτήσεις (FAQ)</strong> — Επαλήθευση & Υποστήριξη</span>
        <span class="toc-page">Σελ. 7</span>
      </li>
    </ul>

    <div class="section-header" style="margin-top: 30px;">
      <div class="section-num">1</div>
      <h2 class="section-title">Εισαγωγή & Σύνδεση στην Πύλη</h2>
    </div>

    <p>Η <strong>Πύλη Καθηγητών</strong> αποτελεί το σύγχρονο ψηφιακό εργαλείο του ΙΣΑΕΚ για την άμεση και αξιόπιστη καταγραφή των διδακτικών ωρών, των απουσιών και των βαθμολογιών. Σχεδιάστηκε για να λειτουργεί άψογα τόσο σε <strong>υπολογιστή</strong> όσο και σε <strong>tablet ή κινητό τηλέφωνο</strong>.</p>

    <div class="step-box">
      <div class="step-title">Βήμα 1.1: Άνοιγμα της Εφαρμογής</div>
      <div class="step-desc">Ανοίξτε τον φυλλομετρητή σας (Google Chrome, Microsoft Edge, Safari) και μεταβείτε στον σύνδεσμο της Πύλης ή πληκτρολογήστε τη διεύθυνση που σας έχει κοινοποιήσει η Γραμματεία με κατάληξη <code>/teacher</code>.</div>
    </div>

    <div class="step-box">
      <div class="step-title">Βήμα 1.2: Επιλογή Εκπαιδευτικού</div>
      <div class="step-desc">Στην οθόνη εισόδου, κάντε κλικ στο πτυσσόμενο μενού <strong>«Επιλογή Εκπαιδευτικού»</strong> και εντοπίστε το ονοματεπώνυμό σας (τα ονόματα είναι ταξινομημένα αλφαβητικά).</div>
    </div>

    <div class="step-box">
      <div class="step-title">Βήμα 1.3: Είσοδος στο Σύστημα</div>
      <div class="step-desc">Πατήστε το πράσινο κουμπί <strong>«Είσοδος ➔»</strong>. Το σύστημα σας συνδέει αυτόματα στο προσωπικό σας περιβάλλον και εμφανίζει μόνο τα τμήματα και τα μαθήματα που σας έχουν ανατεθεί.</div>
    </div>

    <div class="callout callout-info">
      <span class="callout-icon">ℹ️</span>
      <div><strong>Προστασία Δεδομένων:</strong> Μέσω της Πύλης Εκπαιδευτή έχετε πρόσβαση αποκλειστικά στα εκπαιδευτικά δεδομένα (ονόματα σπουδαστών, απουσιολόγιο, βαθμούς). Τα οικονομικά δεδομένα των σπουδαστών παραμένουν κρυπτογραφημένα και προσβάσιμα μόνο από τη Γραμματεία.</div>
    </div>
  </div>

  <!-- ==================== PAGE 3: DASHBOARD ==================== -->
  <div class="page">
    <div class="page-running-header">
      <span>ΙΣΑΕΚ CMS — ΕΓΧΕΙΡΙΔΙΟ ΕΚΠΑΙΔΕΥΤΗ</span>
      <span>ΚΕΦΑΛΑΙΟ 2: ΠΕΡΙΒΑΛΛΟΝ ΕΡΓΑΣΙΑΣ</span>
    </div>

    <div class="section-header">
      <div class="section-num">2</div>
      <h2 class="section-title">Το Περιβάλλον Εργασίας (Dashboard)</h2>
    </div>

    <p>Μόλις συνδεθείτε, αντικρίζετε την κεντρική οθόνη υποδοχής (Dashboard). Στο πάνω μέρος εμφανίζεται το ονοματεπώνυμό σας και η μπάρα πλοήγησης με τις 4 βασικές ενότητες:</p>

    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0;">
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px; text-align: center;">
        <div style="font-size: 16px;">📊</div>
        <div style="font-weight: 700; color: #1e40af; font-size: 12px; margin-top: 4px;">Αρχική</div>
        <div style="font-size: 11px; color: #64748b;">Σύνοψη & Κάρτες</div>
      </div>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
        <div style="font-size: 16px;">📋</div>
        <div style="font-weight: 700; color: #15803d; font-size: 12px; margin-top: 4px;">Αναφορά</div>
        <div style="font-size: 11px; color: #64748b;">Παρουσιολόγιο</div>
      </div>
      <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 10px; text-align: center;">
        <div style="font-size: 16px;">🎓</div>
        <div style="font-weight: 700; color: #854d0e; font-size: 12px; margin-top: 4px;">Βαθμολογία</div>
        <div style="font-size: 11px; color: #64748b;">20% & 80%</div>
      </div>
      <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 10px; text-align: center;">
        <div style="font-size: 16px;">🕒</div>
        <div style="font-weight: 700; color: #6d28d9; font-size: 12px; margin-top: 4px;">Ιστορικό</div>
        <div style="font-size: 11px; color: #64748b;">Παλαιότερες δηλώσεις</div>
      </div>
    </div>

    <h3>Βασικοί Μετρητές & Επισκόπηση</h3>
    <p>Στο άνω μέρος της Αρχικής εμφανίζονται 4 ζωντανές κάρτες στατιστικών:</p>
    <table class="doc-table">
      <thead>
        <tr>
          <th>Μετρητής</th>
          <th>Χρώμα</th>
          <th>Σημασία / Περιεχόμενο</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Μαθήματα</strong></td>
          <td><span class="badge badge-blue">Μπλε</span></td>
          <td>Το πλήθος των διαφορετικών διδακτικών μαθημάτων που σας έχουν ανατεθεί.</td>
        </tr>
        <tr>
          <td><strong>Μαθητές</strong></td>
          <td><span class="badge badge-green">Πράσινο</span></td>
          <td>Ο συνολικός αριθμός μοναδικών εγγεγραμμένων σπουδαστών στα τμήματά σας.</td>
        </tr>
        <tr>
          <td><strong>Αναφορές</strong></td>
          <td><span class="badge" style="background:#f3e8ff; color:#7e22ce;">Μωβ</span></td>
          <td>Το σύνολο των δηλώσεων μαθήματος που έχετε υποβάλει μέχρι σήμερα.</td>
        </tr>
        <tr>
          <td><strong>Ειδικότητες</strong></td>
          <td><span class="badge" style="background:#ffedd5; color:#c2410c;">Πορτοκαλί</span></td>
          <td>Ο αριθμός των τμημάτων/ειδικοτήτων στις οποίες διδάσκετε ενεργά.</td>
        </tr>
      </tbody>
    </table>

    <h3>Κάρτες «Τα Μαθήματά Μου»</h3>
    <p>Κάθε ειδικότητα εμφανίζεται σε ξεχωριστό πλαίσιο με αναλυτική λίστα των μαθημάτων της. Κάνοντας κλικ στο κουμπί <strong>«Νέα Αναφορά»</strong> μέσα στην κάρτα, μεταφέρεστε απευθείας στη φόρμα παρουσιολογίου με προσυμπληρωμένη την ειδικότητα.</p>

    <div class="callout callout-success">
      <span class="callout-icon">💡</span>
      <div><strong>Γρήγορη Πρόσβαση:</strong> Αν διδάσκετε σε περισσότερες από μία ειδικότητες (π.χ. Τεχνικός Εφαρμογών Πληροφορικής και Βοηθός Φαρμακείου), μπορείτε να εναλλάσσεστε άμεσα χωρίς καμία αποσύνδεση.</div>
    </div>
  </div>

  <!-- ==================== PAGE 4: CLOCK-IN & ATTENDANCE ==================== -->
  <div class="page">
    <div class="page-running-header">
      <span>ΙΣΑΕΚ CMS — ΕΓΧΕΙΡΙΔΙΟ ΕΚΠΑΙΔΕΥΤΗ</span>
      <span>ΚΕΦΑΛΑΙΟ 3: ΧΤΥΠΗΜΑ ΚΑΡΤΑΣ & ΩΡΑΡΙΟ</span>
    </div>

    <div class="section-header">
      <div class="section-num">3</div>
      <h2 class="section-title">Δήλωση Μαθήματος & «Χτύπημα Κάρτας»</h2>
    </div>

    <p>Η εφαρμογή διαθέτει ηλεκτρονικό σύστημα <strong>χρονοσήμανσης (Clock-in / Clock-out)</strong> για την αντικειμενική και ακριβή καταγραφή του διδακτικού χρόνου, αποφεύγοντας λάθη χειροκίνητης πληκτρολόγησης.</p>

    <div class="figure-box">
      <img src="${clockBase64}" class="figure-img" alt="Digital Attendance & Time Tracking">
      <div class="figure-caption">
        <span>Εικόνα 1: Διαδικασία Ψηφιακού Χτυπήματος Κάρτας & Απουσιολογίου</span>
        <span>Πύλη Εκπαιδευτών ISAEK</span>
      </div>
    </div>

    <h3>Βήματα Καταγραφής Ωραρίου</h3>

    <div class="step-box">
      <div class="step-title">Βήμα 3.1: Επιλογή Ειδικότητας & Μαθήματος</div>
      <div class="step-desc">Από τα αντίστοιχα μενού επιλέξτε την Ειδικότητα και το Μάθημα που θα διδάξετε. Η ημερομηνία είναι αυτόματα ορισμένη στη σημερινή ημέρα (μπορεί να αλλαχθεί εάν απαιτείται).</div>
    </div>

    <div class="step-box">
      <div class="step-title">Βήμα 3.2: Άφιξη — «Χτύπημα Κάρτας» (Μπλε Κουμπί)</div>
      <div class="step-desc">Κατά την είσοδό σας στην αίθουσα ή το εργαστήριο, πατήστε το μπλε κουμπί <span class="btn-demo btn-demo-blue">Χτύπημα Κάρτας</span> δίπλα στο πεδίο <em>Ώρα Άφιξης</em>. Το σύστημα «κλειδώνει» την ακριβή τρέχουσα ώρα.</div>
    </div>

    <div class="step-box">
      <div class="step-title">Βήμα 3.3: Αναχώρηση — «Χτύπημα Κάρτας» (Κόκκινο Κουμπί)</div>
      <div class="step-desc">Με την ολοκλήρωση της διδασκαλίας, πατήστε το κόκκινο κουμπί <span class="btn-demo btn-demo-red">Χτύπημα Κάρτας</span> δίπλα στο πεδίο <em>Ώρα Αναχώρησης</em>. Το σύστημα υπολογίζει αυτόματα τις συνολικές διδακτικές ώρες και τα λεπτά!</div>
    </div>

    <div class="callout callout-warning">
      <span class="callout-icon">🛡️</span>
      <div><strong>Αυτόματη Προστασία (Auto-Save):</strong> Εάν κατά τη διάρκεια του μαθήματος κλείσετε κατά λάθος την καρτέλα ή κλείσει η οθόνη του κινητού σας, <strong>η ώρα άφιξης δεν χάνεται</strong>! Είναι αποθηκευμένη τοπικά και θα επανέλθει μόλις ανοίξετε ξανά τη σελίδα.</div>
    </div>
  </div>

  <!-- ==================== PAGE 5: ABSENCES ==================== -->
  <div class="page">
    <div class="page-running-header">
      <span>ΙΣΑΕΚ CMS — ΕΓΧΕΙΡΙΔΙΟ ΕΚΠΑΙΔΕΥΤΗ</span>
      <span>ΚΕΦΑΛΑΙΟ 4: ΚΑΤΑΓΡΑΦΗ ΑΠΟΥΣΙΟΛΟΓΙΟΥ</span>
    </div>

    <div class="section-header">
      <div class="section-num">4</div>
      <h2 class="section-title">Καταγραφή Απουσιολογίου Σπουδαστών</h2>
    </div>

    <p>Μόλις επιλέξετε Ειδικότητα και Μάθημα, το σύστημα εμφανίζει αυτόματα κάτω από τη φόρμα την <strong>ονομαστική κατάσταση όλων των εγγεγραμμένων σπουδαστών</strong> του τμήματος.</p>

    <div class="ui-mockup">
      <div class="ui-mockup-header">
        <span>👥 ΑΠΟΥΣΙΟΛΟΓΙΟ ΤΜΗΜΑΤΟΣ (ΠΡΟΕΠΙΣΚΟΠΗΣΗ)</span>
        <span style="background: #334155; padding: 2px 8px; border-radius: 4px; font-size: 11px;">18 Σπουδαστές • 2 Απόντες</span>
      </div>
      <div class="ui-mockup-body">
        <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" checked style="accent-color: #ef4444; width: 16px; height: 16px;">
            <span style="font-weight: 600; color: #b91c1c;">Αλεξανδράκης Γεώργιος</span>
          </div>
          <div>
            <span style="background: #fee2e2; color: #b91c1c; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">2 Ώρες Απουσία</span>
          </div>
        </div>

        <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" style="width: 16px; height: 16px;">
            <span style="font-weight: 500; color: #334155;">Βασιλάκη Μαρία</span>
          </div>
          <div>
            <span style="background: #f1f5f9; color: #15803d; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">Παρών/ούσα</span>
          </div>
        </div>
      </div>
    </div>

    <h3>Κανόνες Σημείωσης Απουσιών</h3>
    <ul>
      <li><strong>Εξ' ορισμού Παρών:</strong> Όλοι οι σπουδαστές θεωρούνται παρόντες μέχρι να τους επιλέξετε.</li>
      <li><strong>Σημείωση Απουσίας:</strong> Κάντε κλικ στο τετραγωνίδιο (checkbox) δίπλα στο όνομα του απόντα. Η γραμμή θα κοκκινίσει και θα εμφανιστεί η ένδειξη <em>Απών/ούσα</em>.</li>
      <li><strong>Ρύθμιση Ωρών Απουσίας:</strong> Αυτόματα αποδίδονται οι ώρες του μαθήματος (π.χ. 2 ή 3 ώρες). Εάν ένας σπουδαστής αποχώρησε νωρίτερα, μπορείτε να αλλάξετε το νούμερο στο μικρό πεδίο ωρών.</li>
    </ul>

    <h3>Οριστική Υποβολή Αναφοράς</h3>
    <p>Αφού ολοκληρωθεί το μάθημα και ελεγχθούν οι απουσίες:</p>
    <div class="step-box">
      <div class="step-title">Πατήστε το κουμπί «Υποβολή Αναφοράς»</div>
      <div class="step-desc">
        Το σύστημα:
        <br>1. Αποθηκεύει τη δήλωση στο αρχείο του καθηγητή και της γραμματείας.
        <br>2. Χρεώνει τις απουσίες στην ατομική ηλεκτρονική καρτέλα κάθε μαθητή.
        <br>3. Καθαρίζει με ασφάλεια τη φόρμα για το επόμενο μάθημά σας.
      </div>
    </div>

    <div class="callout callout-info">
      <span class="callout-icon">🔄</span>
      <div><strong>Κουμπί «Καθαρισμός»:</strong> Εάν ξεκινήσατε μια δοκιμαστική δήλωση και επιθυμείτε να μηδενίσετε όλα τα πεδία και τις ώρες, πατήστε το κόκκινο κουμπί «Καθαρισμός» και επιβεβαιώστε το μήνυμα.</div>
    </div>
  </div>

  <!-- ==================== PAGE 6: GRADES ==================== -->
  <div class="page">
    <div class="page-running-header">
      <span>ΙΣΑΕΚ CMS — ΕΓΧΕΙΡΙΔΙΟ ΕΚΠΑΙΔΕΥΤΗ</span>
      <span>ΚΕΦΑΛΑΙΟ 5: ΚΑΤΑΧΩΡΗΣΗ ΒΑΘΜΟΛΟΓΙΩΝ</span>
    </div>

    <div class="section-header">
      <div class="section-num">5</div>
      <h2 class="section-title">Καταχώρηση & Υπολογισμός Βαθμολογιών</h2>
    </div>

    <p>Στην καρτέλα <strong>«Βαθμολογία»</strong> (Graduation Cap), ο εκπαιδευτής καταχωρεί τις επιδόσεις των σπουδαστών σύμφωνα με τον επίσημο κανονισμό σπουδών των ΙΣΑΕΚ.</p>

    <div class="figure-box">
      <img src="${gradesBase64}" class="figure-img" alt="Student Grades Evaluation and Calculation">
      <div class="figure-caption">
        <span>Εικόνα 2: Σύστημα Υπολογισμού Εξαμηνιαίου Βαθμού (20% Πρόοδος + 80% Τελική Εξέταση)</span>
        <span>Πύλη Εκπαιδευτών ISAEK</span>
      </div>
    </div>

    <h3>Μαθηματικός Τύπος Υπολογισμού</h3>
    <div class="callout callout-info" style="font-size: 13px;">
      <span class="callout-icon">📐</span>
      <div>
        <strong>Τελικός Βαθμός Μαθήματος = (Βαθμός Προόδου / Εργασίας × 0.20) + (Τελική Εξέταση × 0.80)</strong>
        <br><span style="font-size: 11.5px; color: #475569;">Ο υπολογισμός πραγματοποιείται ακαριαία από την πλατφόρμα καθώς πληκτρολογείτε τους βαθμούς.</span>
      </div>
    </div>

    <h3>Πίνακας Καταχώρησης Βαθμών</h3>
    <table class="doc-table">
      <thead>
        <tr>
          <th>Σπουδαστής</th>
          <th style="width: 25%;">Εργασία 6μήνου (20%)</th>
          <th style="width: 25%;">Τελική Εξέταση (80%)</th>
          <th style="width: 20%; text-align: center;">Τελικός Βαθμός</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Γεωργίου Νικόλαος</strong></td>
          <td><span style="border: 1px solid #cbd5e1; padding: 2px 8px; border-radius: 4px; font-weight: 600;">18</span></td>
          <td><span style="border: 1px solid #cbd5e1; padding: 2px 8px; border-radius: 4px; font-weight: 600;">16</span></td>
          <td style="text-align: center; font-weight: 700; color: #15803d; background: #f0fdf4;">16.4</td>
        </tr>
        <tr>
          <td><strong>Δημητρίου Ελένη</strong></td>
          <td><span style="border: 1px solid #cbd5e1; padding: 2px 8px; border-radius: 4px; font-weight: 600;">14</span></td>
          <td><span style="border: 1px solid #cbd5e1; padding: 2px 8px; border-radius: 4px; font-weight: 600;">15</span></td>
          <td style="text-align: center; font-weight: 700; color: #1e40af; background: #eff6ff;">14.8</td>
        </tr>
      </tbody>
    </table>

    <div class="step-box">
      <div class="step-title">Αποθήκευση Βαθμολογίας</div>
      <div class="step-desc">Μόλις συμπληρώσετε τους βαθμούς για τους μαθητές σας, πατήστε το πράσινο κουμπί <strong>«Αποθήκευση Βαθμολογίας»</strong>. Οι βαθμοί μεταφέρονται απευθείας στο κεντρικό μητρώο της γραμματείας και στον πίνακα ελέγχου διαχειριστή.</div>
    </div>
  </div>

  <!-- ==================== PAGE 7: HISTORY & FAQ ==================== -->
  <div class="page">
    <div class="page-running-header">
      <span>ΙΣΑΕΚ CMS — ΕΓΧΕΙΡΙΔΙΟ ΕΚΠΑΙΔΕΥΤΗ</span>
      <span>ΚΕΦΑΛΑΙΟ 6: ΙΣΤΟΡΙΚΟ & ΣΥΧΝΕΣ ΕΡΩΤΗΣΕΙΣ</span>
    </div>

    <div class="section-header">
      <div class="section-num">6</div>
      <h2 class="section-title">Ιστορικό Δηλώσεων & Συχνές Ερωτήσεις</h2>
    </div>

    <h3>Καρτέλα «Ιστορικό» (History)</h3>
    <p>Στην καρτέλα Ιστορικό έχετε πλήρη αρχειακή πρόσβαση σε όλες τις προηγούμενες δηλώσεις που έχετε υποβάλει. Κάθε εγγραφή περιλαμβάνει:</p>
    <ul>
      <li><strong>Ημερομηνία & Ώρες:</strong> Ακριβές διάστημα άφιξης και αναχώρησης (π.χ. 16:30 - 18:45).</li>
      <li><strong>Μάθημα & Ειδικότητα:</strong> Ποιο μάθημα διδάχθηκε.</li>
      <li><strong>Απόντες:</strong> Ονομαστική αναφορά όσων σπουδαστών χρεώθηκαν απουσία.</li>
    </ul>

    <div class="section-header" style="margin-top: 25px;">
      <div class="section-num">❓</div>
      <h2 class="section-title">Συχνές Ερωτήσεις & Απαντήσεις (FAQ)</h2>
    </div>

    <div class="step-box" style="border-left-color: #64748b;">
      <div class="step-title">1. Ξέχασα να πατήσω «Χτύπημα Κάρτας» κατά την άφιξη. Τι κάνω;</div>
      <div class="step-desc">Εάν ξεκίνησε το μάθημα και το θυμηθήκατε αργότερα, πατήστε το χτύπημα κάρτας αμέσως και ενημερώστε τη Γραμματεία κατά την έξοδό σας ώστε να επιβεβαιώσει και να διορθώσει τη δηλωθείσα ώρα στο κεντρικό σύστημα διαχειριστή.</div>
    </div>

    <div class="step-box" style="border-left-color: #64748b;">
      <div class="step-title">2. Έβαλα λάθος απουσία σε σπουδαστή και πάτησα Υποβολή.</div>
      <div class="step-desc">Η Γραμματεία έχει άμεση πρόσβαση στην καρτέλα του σπουδαστή και στην προβολή «Αναφορές Καθηγητών» όπου μπορεί να διαγράψει ή να τροποποιήσει την απουσία ανά πάσα στιγμή.</div>
    </div>

    <div class="step-box" style="border-left-color: #64748b;">
      <div class="step-title">3. Δεν βλέπω ένα μάθημα που διδάσκω στη λίστα μου.</div>
      <div class="step-desc">Επικοινωνήστε με τη Γραμματεία. Ο διαχειριστής θα προσθέσει το μάθημα στις αναθέσεις του προφίλ σας στην καρτέλα «Καθηγητές» και αυτό θα εμφανιστεί αμέσως στην Πύλη σας.</div>
    </div>

    <div class="callout callout-info" style="margin-top: 25px;">
      <span class="callout-icon">📞</span>
      <div>
        <strong>Τεχνική Υποστήριξη & Γραμματεία ΙΣΑΕΚ</strong>
        <br>Για οποιαδήποτε απορία ή ανάγκη τεχνικής υποστήριξης, μπορείτε να απευθύνεστε στο γραφείο γραμματείας του Επιμελητηρίου Ηρακλείου ή να στείλετε email στο αρμόδιο τμήμα.
      </div>
    </div>

    <div style="text-align: center; margin-top: 30px; padding: 16px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 11.5px;">
      © 2026 ΙΣΑΕΚ Επιμελητηρίου Ηρακλείου — Σύστημα Διαχείρισης Εκπαιδευτικών Αναφορών (ISAEK CMS)
    </div>
  </div>

</body>
</html>
`;

// Save the HTML file
const htmlFilePath = path.join(workspaceDir, 'ΟΔΗΓΟΣ_ΧΡΗΣΗΣ_ΠΥΛΗΣ_ΚΑΘΗΓΗΤΩΝ.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log('HTML Guide successfully saved at:', htmlFilePath);

// Path for output PDF
const pdfFilePath = path.join(workspaceDir, 'ΟΔΗΓΟΣ_ΧΡΗΣΗΣ_ΠΥΛΗΣ_ΚΑΘΗΓΗΤΩΝ_ISAEK.pdf');

// Run Edge headless to print to PDF
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const cmd = `& "${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${pdfFilePath}" "${htmlFilePath}"`;

console.log('Executing Edge print-to-pdf command...');
try {
  execSync(`powershell -Command "${cmd}"`, { stdio: 'inherit' });
  if (fs.existsSync(pdfFilePath)) {
    const stats = fs.statSync(pdfFilePath);
    console.log(`SUCCESS! PDF Generated: ${pdfFilePath} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.error('PDF file was not found after execution.');
  }
} catch (err) {
  console.error('Error running Edge print-to-pdf:', err.message);
}
