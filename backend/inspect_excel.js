const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'PCOD- FREE INDIA QUESTIONNAIRE MASTERCHART.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON (Array of Arrays)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log("Sheet Name:", sheetName);
    console.log("Total Rows:", data.length);

    // Print Header (Row 0) and First 5 Data Rows
    for (let i = 0; i < Math.min(data.length, 6); i++) {
        console.log(`\n--- Row ${i} ---`);
        console.log(JSON.stringify(data[i]));
    }

} catch (error) {
    console.error("Error reading file:", error.message);
}
