const xlsx = require('xlsx');
const workbook = xlsx.readFile('isaek EXCEL.xlsx');

workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`\n=== Sheet: ${sheetName} ===`);
  if (data.length > 0) console.log('Row 1:', data[0]);
  if (data.length > 1) console.log('Row 2:', data[1]);
  if (data.length > 2) console.log('Row 3:', data[2]);
});
