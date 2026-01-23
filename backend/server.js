const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const onboardingRoutes = require('./routes/onboarding');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Basic health check
app.get('/', (req, res) => {
    res.json({ message: 'Ayurvedic Health Chat API is running' });
});

// Routes
app.use('/api/onboarding', onboardingRoutes);
app.use('/api', apiRoutes);

app.get('/api/test-ollama', async (req, res) => {
    try {
        const ollamaService = require('./services/ollamaService');
        const response = await ollamaService.chatWithAI("Hello");
        res.json({ success: true, message: "Ollama is working!", response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
