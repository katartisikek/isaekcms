const xlsx = require('xlsx');

const workbook = xlsx.readFile('isaek EXCEL.xlsx');
const sheetName = workbook.SheetNames[0];
console.log("Sheet:", sheetName);
const sheet = workbook.Sheets[sheetName];

const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

for (let i = 0; i < 3; i++) {
  console.log(`Row ${i}:`);
  const row = rows[i] || [];
  row.forEach((col, idx) => {
    if (col) {
      console.log(`  Col ${idx}: ${col}`);
    }
  });
}
