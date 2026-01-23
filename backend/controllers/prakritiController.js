const questions = require('../data/prakritiQuestions.json');

exports.getQuestions = (req, res) => {
    res.json(questions);
};

exports.calculatePrakriti = (req, res) => {
    const { answers } = req.body; // Expect array of { questionId, selectedType }

    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: "Answers array required" });
    }

    const counts = { Vata: 0, Pitta: 0, Kapha: 0 };

    answers.forEach(ans => {
        // ans.selectedType should be "Vata", "Pitta", or "Kapha"
        if (counts[ans.selectedType] !== undefined) {
            counts[ans.selectedType]++;
        }
    });

    // Find dominant
    let dominant = "Mixed";
    const maxVal = Math.max(...Object.values(counts));
    const maxKeys = Object.keys(counts).filter(k => counts[k] === maxVal);

    if (maxKeys.length === 1) {
        dominant = maxKeys[0];
    } else {
        dominant = maxKeys.join("-"); // e.g. Vata-Pitta
    }

    // Static explanation
    const explanations = {
        "Vata": "You have a Vata constitution. You likely have a light build and creative mind, but may be prone to anxiety and dry skin.",
        "Pitta": "You have a Pitta constitution. You likely have a medium build and sharp intellect, but may successfully overheat or get irritable.",
        "Kapha": "You have a Kapha constitution. You likely have a strong build and calm demeanor, but may struggle with lethargy.",
        "Mixed": "You have a mixed constitution (Tridoshic or Dual-Dosha). You show qualities of multiple types."
    };

    res.json({
        prakriti: dominant,
        counts,
        description: explanations[dominant] || explanations["Mixed"]
    });
};
