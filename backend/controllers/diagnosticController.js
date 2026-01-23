const { getAllQuestions, calculateScore } = require('../services/questionnaireService');

exports.getJointPainQuestions = (req, res) => {
    // Send full questions list to mobile for local navigation
    const questions = getAllQuestions();

    // Safety check
    if (!questions) {
        return res.status(500).json({ error: "Failed to load questionnaire data." });
    }

    res.json(questions);
};

exports.analyzeJointPain = (req, res) => {
    const { answers } = req.body;

    if (!answers) {
        return res.status(400).json({ error: "No answers provided." });
    }

    const analysis = calculateScore(answers);

    const recommendations = [
        "Consult a Doctor for clinical evaluation.",
        "Maintain a balanced, nutritious diet.",
        "Ensure 7-8 hours of quality sleep.",
        "Engage in regular physical activity like Yoga.",
        "Practice stress management techniques."
    ];

    res.json({
        result: `Risk Assessment: ${analysis.category}`,
        risk_category: analysis.category,
        score: analysis.score,
        observed_patterns: analysis.patterns,
        recommendations: recommendations,
        disclaimer: "DISCLAIMER: This is a screening tool for awareness ONLY. It does NOT provide a medical diagnosis. Please consult a qualified healthcare professional."
    });
};
