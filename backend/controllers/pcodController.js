const questionnaireService = require('../services/questionnaireService');

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

        res.json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process assessment" });
    }
};

module.exports = { getQuestions, submitAssessment };
