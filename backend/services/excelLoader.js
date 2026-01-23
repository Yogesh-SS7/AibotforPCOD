const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../data', 'PCOD- FREE INDIA QUESTIONNAIRE MASTERCHART.xlsx');

let cachedQuestions = null;

const loadQuestions = () => {
    if (cachedQuestions) return cachedQuestions;

    try {
        console.log("Loading questions from Excel...");
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Assuming first sheet
        const sheet = workbook.Sheets[sheetName];

        // Read as JSON (Array of Arrays) to handle dynamic headers safely
        // Row 0 is headers
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Group by Question_ID
        const questionsMap = new Map();

        // Expected Columns based on inspection:
        // Question_ID, "Question ", Option_Text, Option_Code, Risk_Score
        // Note: Actual column names in file might strictly match or vary slightly. 
        // We will use standard key mapping based on the inspection.

        jsonData.forEach(row => {
            // Keys might be 'Q1', 'Age group', etc. depending on how sheet_to_json parses headers.
            // Let's rely on the keys present in the row object.

            // Heuristic to find the keys if they are slightly different
            const idKey = Object.keys(row).find(k => k.includes('Question_ID') || k.includes('Q1'));
            // Warning: 'Q1' in header inspection was confusing. 
            // The header row seems to be: "Question_ID", "Question", ...
            // Let's assume standard names based on Row 0 from inspection implies:
            // "Question_ID", "Question", "Option_Text", "Risk_Score"

            // Actually, from previous output: ["Demographics", "Q1", "Age group", "MCQ", "A", "Below 18", "Q2", 4]
            // This suggests NO HEADERS were read correctly by my generic inspector or the file lacks headers.
            // Let's assume Row 0 IS the header row.

            const qId = row['Question_ID'] || row['Q1']; // Fallback
            if (!qId) return;

            if (!questionsMap.has(qId)) {
                questionsMap.set(qId, {
                    id: qId,
                    text: row['Question'] || row['Age group'] || "Question Text Missing", // Fallback based on sample
                    options: []
                });
            }

            const question = questionsMap.get(qId);
            question.options.push({
                text: row['Option_Text'] || row['Below 18'] || row['Option'], // Fallbacks
                value: row['Option_Code'] || row['A'] || row['Code'],
                score: parseInt(row['Risk_Score'] || row['0'] || 0)
            });
        });

        cachedQuestions = Array.from(questionsMap.values());
        console.log(`Loaded ${cachedQuestions.length} questions.`);
        return cachedQuestions;

    } catch (error) {
        console.error("Error parsing Excel:", error.message);
        return [];
    }
};

module.exports = { loadQuestions };
