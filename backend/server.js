require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sendMessageToOpenRouter } = require('./mistralApi');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('OpenRouter Chat API Server is running!');
});

app.post('/api/chat', async (req, res) => {
    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required.' });
    }
    if (!model) {
        return res.status(400).json({ error: 'Model name is required.' });
    }

    const availableModels = [
        "deepseek/deepseek-prover-v2:free",
        "mistralai/mistral-small-3.1-24b-instruct:free",
    ];

    if (!availableModels.includes(model)) {
        return res.status(400).json({ error: `Model ${model} is not supported. Supported models: ${availableModels.join(', ')}` });
    }

    try {
        const aiResponse = await sendMessageToOpenRouter(messages, model);
        res.json({ reply: aiResponse });
    } catch (error) {
        console.error(`Error in /api/chat with model ${model}:`, error.message);
        res.status(500).json({ error: error.message || 'An error occurred.' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
