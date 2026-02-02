const ollamaService = require('../services/ollamaService');

const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '../data/users.json');
const patientsFile = path.join(__dirname, '../data/patients.json');

exports.chat = async (req, res) => {
    const { message, userId } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    // Load Context Data
    let context = req.body.context || {};

    if (userId) {
        try {
            // Load User Data (BMI)
            if (fs.existsSync(usersFile)) {
                const users = JSON.parse(fs.readFileSync(usersFile));
                const user = users.find(u => u.id === userId.toString());
                if (user) {
                    context.userProfile = {
                        name: user.name,
                        age: user.age,
                        weight: user.weight,
                        height: user.height,
                        bmi: user.bmi,
                        bmi_category: user.bmi_category,
                        language: user.language
                    };
                }
            }

            // Load Patient Data (PCOD Score)
            if (fs.existsSync(patientsFile)) {
                const patients = JSON.parse(fs.readFileSync(patientsFile));
                const patient = patients[userId.toString()];
                if (patient && patient.latest_assessment) {
                    context.pcodAssessment = {
                        risk_category: patient.latest_assessment.risk_category,
                        score: patient.latest_assessment.score,
                        timestamp: patient.latest_assessment.timestamp
                    };
                }
            }
        } catch (err) {
            console.error("Error loading context data:", err);
        }
    }

    const aiResponse = await ollamaService.chatWithAI(message, context);

    res.json({
        response: aiResponse,
        sender: 'AI',
        timestamp: new Date().toISOString()
    });
};
