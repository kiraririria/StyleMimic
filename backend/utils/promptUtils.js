const MAX_HISTORY_FOR_PROMPT = 15;

/**
 * Генерирует промпт для продолжения диалога с учетом профиля персонажа и контекста.
 * @param {Object} characterProfile - Объект профиля персонажа { name, styleSummary, exampleMessages? }.
 * @param {Array<Object>} fullChatHistory - Вся история текущего диалога [{role: 'user'/'assistant', content: '...'}].
 * @param {number} historyMessagesToInclude - Количество последних сообщений из истории для включения в контекст.
 * @returns {Array<Object>} Массив сообщений для отправки в AI.
 */
function getConversationPrompt(characterProfile, fullChatHistory, historyMessagesToInclude) {
    const { name: characterName, styleSummary, exampleMessages } = characterProfile;

    // Берем последние N сообщений для контекста
    const relevantChatHistory = fullChatHistory.slice(-Math.min(historyMessagesToInclude, MAX_HISTORY_FOR_PROMPT));

    let systemMessageContent = `Ты — чат-бот, который должен отвечать от имени персонажа по имени "${characterName}".
Твоя задача — вести диалог, максимально точно имитируя его стиль общения, опираясь на предоставленное описание стиля и, возможно, примеры его сообщений.
Отвечай ТОЛЬКО текстом сообщения персонажа, без каких-либо мета-комментариев или пояснений от себя как AI.
Старайся генерировать развернутые и содержательные ответы, если это соответствует стилю персонажа и контексту диалога. Избегай слишком коротких односложных ответов, если это не характерно для персонажа.

КРАТКОЕ ОПИСАНИЕ СТИЛЯ ОБЩЕНИЯ "${characterName}":
${styleSummary}
`;

    if (exampleMessages && exampleMessages.length > 0) {
        const examples = exampleMessages
            .map(msg => `- "${msg}"`)
            .join('\n');
        systemMessageContent += `\nПРИМЕРЫ ФРАЗ "${characterName}":\n${examples}`;
    }

    systemMessageContent += `\n\nТЕКУЩИЙ ДИАЛОГ (последние сообщения):`;
    systemMessageContent += `\nТы должен ответить на ПОСЛЕДНЕЕ сообщение от пользователя в предоставленной ниже истории чата.`;

    const historyForPrompt = relevantChatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
    }));

    return [
        { role: 'system', content: systemMessageContent },
        ...historyForPrompt
    ];
}

module.exports = {
    getProfileAnalysisPrompt,
    getConversationPrompt,
    selectExampleMessages,
};
