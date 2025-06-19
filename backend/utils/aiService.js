const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
//const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Отправляет сообщения на OpenRouter API.
 * @param {Array<Object>} messages - Массив объектов сообщений (роль, контент).
 * @param {string} modelName - Имя модели.
 * @param key
 * @param {Object} [options={}] - Дополнительные параметры для API (temperature, max_tokens и т.д.).
 * @returns {Promise<string>} - Текстовый ответ от AI.
 */
async function callOpenRouter(messages, modelName, key,options = {}) {
    const apiKey = key;
    const siteUrl = process.env.YOUR_SITE_URL;
    const siteName = process.env.YOUR_SITE_NAME;

    if (!apiKey) {
        console.error("OpenRouter API key is not set.");
        throw new Error("OpenRouter API key is not configured on the server.");
    }

    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    };
    if (siteUrl) headers['HTTP-Referer'] = siteUrl;
    if (siteName) headers['X-Title'] = siteName;

    const payload = {
        model: modelName,
        messages: messages,
        ...options,
    };

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorData;
            try { errorData = await response.json(); }
            catch (e) { errorData = { message: await response.text() }; }
            console.error(`OpenRouter API Error (model: ${modelName}):`, errorData);
            throw new Error(`OpenRouter API request failed for model ${modelName} with status ${response.status}: ${errorData.message || 'Unknown error'}`);
        }
        const data = await response.json();
        if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
            return data.choices[0].message.content;
        } else {
            console.error(`Unexpected response structure from OpenRouter (model: ${modelName}):`, data);
            throw new Error(`Unexpected response structure from OpenRouter for model ${modelName}.`);
        }
    } catch (error) {
        console.error(`Error calling OpenRouter API (model: ${modelName}):`, error.message);
        throw new Error(`Failed to get response from AI service for model ${modelName}.`);
    }
}

async function callLocalModel(messages, url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
    };

}


module.exports = { callOpenRouter };
