const ollamaService = require('../services/ollamaService');

exports.chat = async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    // Simple stateless chat for prototype
    const { context } = req.body; // Optional context
    const aiResponse = await ollamaService.chatWithAI(message, context);

    res.json({
        response: aiResponse,
        sender: 'AI',
        timestamp: new Date().toISOString()
    });
};
