const fs = require('fs');
const path = require('path');

const QUESTIONNAIRE_PATH = path.join(__dirname, '../data/PCODQuestions.json');

let questionnaireData = null;

const loadQuestionnaire = () => {
    if (questionnaireData) return questionnaireData;
    try {
        const rawData = fs.readFileSync(QUESTIONNAIRE_PATH, 'utf8');
        questionnaireData = JSON.parse(rawData);
        const meta = questionnaireData.survey_meta || {};
        console.log(`Loaded Questionnaire: ${meta.title} (v${meta.version})`);
        return questionnaireData;
    } catch (error) {
        console.error("Error loading questionnaire JSON:", error.message);
        return null;
    }
};

const getAllQuestions = () => {
    const data = loadQuestionnaire();
    if (!data || !data.sections) return [];
    // Flatten questions from all sections
    return data.sections.reduce((acc, section) => {
        if (section.questions && Array.isArray(section.questions)) {
            const questionsWithSection = section.questions.map(q => ({
                ...q,
                section: section.title,
                section_id: section.section_id
            }));
            return acc.concat(questionsWithSection);
        }
        return acc;
    }, []);
};

const calculateScore = (answers) => {
    // answers: { "Q1": "Below 18 years", ... }
    const questions = getAllQuestions();
    let totalRiskScore = 0;

    // Map for fast lookup
    const qMap = new Map(questions.map(q => [q.id, q]));

    for (const [qId, userValue] of Object.entries(answers)) {
        const question = qMap.get(qId);
        if (!question) continue;

        // In new JSON, options identify by 'text' not 'code'.
        // Also handling multi_choice if userValue is an array
        if (question.type === 'single_choice' && question.options) {
            const selectedOption = question.options.find(o => o.text === userValue);
            if (selectedOption) {
                totalRiskScore += (selectedOption.score || 0);
            }
        } else if (question.type === 'multi_choice' && question.options) {
            // Assume userValue is an array of strings for multi_choice
            const values = Array.isArray(userValue) ? userValue : [userValue];
            values.forEach(val => {
                const option = question.options.find(o => o.text === val);
                if (option) {
                    totalRiskScore += (option.score || 0);
                }
            });
        }
        // Numeric/Text inputs in this JSON (e.g. P1, P2) generally don't have scores logic encoded in JSON 
        // unlike the old file. We rely on 'score' field in options.
    }

    // Determine Risk Category based on scoring_guide
    // Low: 0-25, Moderate: 26-50, High: 51-75, Very High: 76-100
    let riskCategory = "Low Risk";
    if (totalRiskScore >= 76) riskCategory = "Very High Risk";
    else if (totalRiskScore >= 51) riskCategory = "High Risk";
    else if (totalRiskScore >= 26) riskCategory = "Moderate Risk";

    // Patterns (Ayurveda tags) are removed in this version.

    return {
        score: totalRiskScore,
        category: riskCategory,
        patterns: []
    };
};

module.exports = { loadQuestionnaire, getAllQuestions, calculateScore };
