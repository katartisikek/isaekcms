const xlsx = require('xlsx');
const workbook = xlsx.readFile('excel_endiaferon.xlsx', { cellDates: true, raw: true });
const sheet = workbook.Sheets['Φύλλο1'];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
for (let i = 0; i < 3; i++) {
  console.log(`Row ${i}:`);
  const row = rows[i] || [];
  row.forEach((col, idx) => {
    console.log(`  Col ${idx}:`, typeof col, col);
  });
}
