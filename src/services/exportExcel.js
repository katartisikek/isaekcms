import * as XLSX from 'xlsx';

/**
 * Generic helper: creates and downloads an Excel workbook.
 * @param {Array<{name: string, data: Object[]}>} sheets - Array of sheet configs
 * @param {string} filename - Output filename (without .xlsx)
 */
function downloadWorkbook(sheets, filename) {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.json_to_sheet(data);
    // Auto-fit column widths based on content
    const colWidths = [];
    if (data.length > 0) {
      Object.keys(data[0]).forEach((key, i) => {
        const maxLen = Math.max(
          key.length,
          ...data.map(row => String(row[key] || '').length)
        );
        colWidths[i] = { wch: Math.min(maxLen + 2, 50) };
      });
      ws['!cols'] = colWidths;
    }
    XLSX.utils.book_append_sheet(wb, ws, name);
  });
  XLSX.writeFile(wb, `${filename}_${new Date().toLocaleDateString('el-GR').replace(/\//g, '-')}.xlsx`);
}

/**
 * Export students list to Excel.
 * @param {Array} students - Filtered students array
 * @param {Array} specialties - Specialties for name lookup
 */
export function exportStudents(students, specialties) {
  const data = students.map(s => {
    const spec = specialties.find(sp => sp.id === s.specialtyId);
    return {
      'Επώνυμο / Όνομα': s.fullName || '',
      'Τηλέφωνο': s.phone || '',
      'Email': s.email || '',
      'Ειδικότητα': spec ? spec.title : '',
      'Τομέας': spec ? spec.sector : '',
      'Έτος Σπουδών': s.year || '',
      'Αρ. Μητρώου': s.mathitisAr || '',
      'ΑΜΚΑ': s.amka || '',
      'ΑΦΜ': s.afm || '',
      'Α.Τ.': s.idNumber || '',
      'Κατάσταση': s.status === 'bek_graduate' ? 'Απόφοιτος ΒΕΚ' : 'Ενεργός',
      'Οφειλή (€)': parseFloat(s.totalDebt || 0).toFixed(2),
      'Δόσεις': s.hasInstallments ? (s.numberOfInstallments || 1) : 'Εφάπαξ',
      'Σημειώσεις': s.notes || '',
    };
  });
  downloadWorkbook([{ name: 'Σπουδαστές', data }], 'Σπουδαστες_ISAEK');
}

/**
 * Export interests list to Excel.
 * @param {Array} interests
 * @param {Array} specialties
 */
export function exportInterests(interests, specialties) {
  const data = interests.map(i => {
    const spec = specialties.find(sp => sp.id === i.specialtyId);
    return {
      'Επώνυμο': i.lastName || '',
      'Όνομα': i.firstName || '',
      'Τηλέφωνο': i.phone || '',
      'Email': i.email || '',
      'Ειδικότητα Ενδιαφέροντος': spec ? spec.title : '',
      'Σχόλια / Σημειώσεις': i.comments || '',
      'Ημερομηνία': i.createdAt ? new Date(i.createdAt).toLocaleDateString('el-GR') : '',
    };
  });
  downloadWorkbook([{ name: 'Ενδιαφερόμενοι', data }], 'Εκδηλωσεις_Ενδιαφεροντος_ISAEK');
}

/**
 * Export contacts list to Excel.
 * @param {Array} contacts
 * @param {Array} specialties
 */
export function exportContacts(contacts, specialties) {
  const data = contacts.map(c => {
    const spec = specialties.find(sp => sp.id === c.specialtyId);
    return {
      'Ονοματεπώνυμο': c.name || '',
      'Κατηγορία': c.category || '',
      'Τηλέφωνο': c.phone || '',
      'Email': c.email || '',
      'Ειδικότητα': spec ? spec.title : '',
      'Σημειώσεις': c.notes || '',
    };
  });
  downloadWorkbook([{ name: 'Επαφές', data }], 'Καταλογος_Επαφων_ISAEK');
}

/**
 * Export audit log to Excel.
 * @param {Array} logs
 */
export function exportAuditLog(logs) {
  const data = logs.map(l => ({
    'Ημερομηνία / Ώρα': l.created_at ? new Date(l.created_at).toLocaleString('el-GR') : '',
    'Ενέργεια': l.action || '',
    'Κατηγορία': l.entity || '',
    'Εγγραφή': l.entity_name || '',
    'Χρήστης': l.user_name || '',
    'Λεπτομέρειες': l.details || '',
  }));
  downloadWorkbook([{ name: 'Ιστορικό', data }], 'Ιστορικο_Αλλαγων_ISAEK');
}
