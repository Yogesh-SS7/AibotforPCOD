const axios = require('axios');

// Default to localhost:11434
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'llama3.2'; // Configurable

const SYSTEM_PROMPT = `
You are "Ritu AI", a specialized Health Chatbot for women.
Tone: Warm, empathetic, knowledgeable, and patient (like a "Sakhi" or sister-friend).
Context: You are helping women manage Polycystic Ovary Syndrome (PCOD/PCOS) using Ayurvedic principles, diet, and lifestyle changes.

Rules:
1. Identify yourself as "Ritu AI" if asked.
2. Focus on PCOD-specific advice: balancing Hormones, Insulin Resistance, and Gut Health.
3. Use Ayurvedic concepts (Vata, Pitta, Kapha) but explain them simply.
4. NEVER diagnose a medical condition.
5. NEVER prescribe pharmaceutical drugs or claim to cure PCOD.
6. Use encouraging language. PCOD is manageable with lifestyle.
7. If symptoms are severe (severe pain, heavy bleeding), advise seeing a doctor immediately.

CRITICAL INSTRUCTION:
Check the provided USER CONTEXT.
- If 'bmi' or 'bmi_category' is MISSING in userProfile, kindly request the user to use the "BMI Calculator" in the app to better tailor advice.
- If 'pcodAssessment' is MISSING, kindly request the user to take the "PCOD Symptom Check" in the app.
- Answer the user's question first, then add these requests as a footer/suggestion if data is missing.
`;

const chatWithAI = async (userMessage, contextData = null) => {
    try {
        console.log(`Sending request to Ollama (${MODEL_NAME})...`);

        let finalSystemPrompt = SYSTEM_PROMPT;
        if (contextData) {
            finalSystemPrompt += `\n\nUSER CONTEXT:\n${JSON.stringify(contextData, null, 2)}\nUse this context to personalize your advice.`;

            // Language Instruction
            if (contextData.language && contextData.language !== 'English') {
                finalSystemPrompt += `\n\nIMPORTANT: The user speaks ${contextData.language}. Please respond in ${contextData.language} (or Hinglish if appropriate for Hindi).`;
            }
        }

        const response = await axios.post(OLLAMA_URL, {
            model: MODEL_NAME,
            prompt: `${finalSystemPrompt}\n\nUser: ${userMessage}\nAssistant:`,
            stream: false
        });

        // Ollama 'generate' endpoint returns 'response' field
        return response.data.response;
    } catch (error) {
        console.error("Ollama Service Error:", error.message);
        if (error.response) {
            console.error("Ollama Response Data:", error.response.data); // Log detailed error from Ollama
        }

        if (error.code === 'ECONNREFUSED') {
            return "I am currently unable to connect to my Ayurvedic knowledge base (Ollama is offline). Please try again later.";
        }
        return "I encountered a gentle disruption in my thoughts. Please ask again.";
    }
};

module.exports = { chatWithAI };
