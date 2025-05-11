const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('../utils/aiService');
const {
    getProfileAnalysisPrompt,
    getConversationPrompt,
    selectExampleMessages
} = require('../utils/promptUtils');

router.post('/create-profile', async (req, res) => {
    const { characterName, messages, model } = req.body;

    if (!characterName || !messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'characterName and messages array are required.' });
    }
    if (!model) {
        return res.status(400).json({ error: 'Model name for analysis is required.' });
    }

    try {
        const analysisPromptMessages = getProfileAnalysisPrompt(characterName, messages);
        const styleSummary = await callOpenRouter(analysisPromptMessages, model, { temperature: 0.3, max_tokens: 250 });

        const exampleMessages = selectExampleMessages(messages);

        const profile = {
            name: characterName,
            styleSummary: styleSummary.trim(),
            exampleMessages: exampleMessages,
        };

        res.json(profile);
    } catch (error) {
        console.error(`Error in /api/create-profile for ${characterName}:`, error.message);
        res.status(500).json({ error: error.message || 'An error occurred while creating character profile.' });
    }
});

router.post('/chat', async (req, res) => {
    const { messages, model, characterProfile, aiOptionsFromClient } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required.' });
    }
    if (!model) {
        return res.status(400).json({ error: 'Model name is required.' });
    }
    // aiOptionsFromClient должен содержать { temperature, maxTokens, historyMessagesCount }

    try {
        let promptForAi;
        const historyCount = (aiOptionsFromClient && typeof aiOptionsFromClient.historyMessagesCount === 'number' && aiOptionsFromClient.historyMessagesCount > 0)
            ? aiOptionsFromClient.historyMessagesCount
            : 10;

        if (characterProfile && characterProfile.name && characterProfile.styleSummary) {
            promptForAi = getConversationPrompt(characterProfile, messages, historyCount);
        } else {
            const systemInstruction = {role: "system", content: "Ты полезный ИИ-ассистент. Старайся давать развернутые и подробные ответы."};
            const relevantHistory = messages.slice(-historyCount);
            promptForAi = [systemInstruction, ...relevantHistory];
        }

        const apiCallOptions = {
            temperature: (aiOptionsFromClient && typeof aiOptionsFromClient.temperature === 'number') ? aiOptionsFromClient.temperature : 0.7,
            max_tokens: (aiOptionsFromClient && typeof aiOptionsFromClient.maxTokens === 'number') ? aiOptionsFromClient.maxTokens : 500,
        };

        const aiResponse = await callOpenRouter(promptForAi, model, apiCallOptions);
        res.json({ reply: aiResponse });
    } catch (error) {
        console.log(error)
        // ... обработка ошибок ...
    }
});

module.exports = router;
