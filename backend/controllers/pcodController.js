const questionnaireService = require('../services/questionnaireService');
const { chatWithAI } = require('../services/ollamaService');
const fs = require('fs');
const path = require('path');

const PATIENTS_FILE = path.join(__dirname, '../data/patients.json');

const getQuestions = (req, res) => {
    try {
        const questions = questionnaireService.getAllQuestions();
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: "Failed to load questions" });
    }
};

const submitAssessment = (req, res) => {
    try {
        const { answers } = req.body; // { "Q1": "Option Text", ... }
        if (!answers) {
            return res.status(400).json({ error: "No answers provided" });
        }

        const result = questionnaireService.calculateScore(answers);

        // Add disclaimer and generic recommendations based on category
        let recommendations = [];
        if (result.category === "Low Risk") {
            recommendations = ["Continue healthy lifestyle", "Yearly checkups"];
        } else {
            recommendations = ["Consult a gynecologist", "Focus on diet and exercise", "Monitor symptoms"];
        }

        const response = {
            risk_category: result.category,
            score: result.score,
            observed_patterns: result.patterns,
            recommendations: recommendations,
            disclaimer: "This tool is for screening purposes only and does not replace professional medical advice."
        };

        // Save to patients.json if email is provided
        const { email } = req.body;
        console.log(`[PCOD Submit] Received submission. Email: ${email ? email : 'MISSING'}`);
        if (email) {
            try {
                let patients = {};
                if (fs.existsSync(PATIENTS_FILE)) {
                    patients = JSON.parse(fs.readFileSync(PATIENTS_FILE, 'utf8'));
                }

                // Update or create patient record
                patients[email] = {
                    ...patients[email],
                    email,
                    latest_assessment: {
                        timestamp: new Date().toISOString(),
                        ...response
                    }
                };

                fs.writeFileSync(PATIENTS_FILE, JSON.stringify(patients, null, 2));
                console.log(`Saved assessment for ${email}`);
            } catch (fsError) {
                console.error("Error saving pcod data:", fsError);
                // Don't fail the request just because save failed
            }
        }

        res.json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process assessment" });
    }
};

const explainResult = async (req, res) => {
    try {
        const { result } = req.body;
        if (!result) {
            return res.status(400).json({ error: "No result data provided" });
        }

        const prompt = `
        Please explain this PCOD Assessment Result to the user.
        Risk Category: ${result.risk_category}
        Score: ${result.score}
        Observed Patterns: ${result.observed_patterns ? result.observed_patterns.join(', ') : 'None'}
        Recommendations: ${result.recommendations ? result.recommendations.join(', ') : 'None'}

        Provide a supportive, empathetic explanation of what this means in simple terms. 
        Focus on the positive actions they can take. 
        Keep it concise (max 3-4 sentences).`;

        const explanation = await chatWithAI(prompt);
        res.json({ explanation });

    } catch (error) {
        console.error("Explanation Error:", error);
        res.status(500).json({ error: "Failed to generate explanation" });
    }
};

module.exports = { getQuestions, submitAssessment, explainResult };
