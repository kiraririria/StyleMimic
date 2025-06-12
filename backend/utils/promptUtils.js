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
/**
 * Генерирует промпт для анализа стиля общения персонажа.
 * @param {string} characterName Имя персонажа.
 * @param {string[]} characterMessages Массив текстовых сообщений персонажа.
 * @param messagesToAnalis
 * @returns {Array<Object>} Массив сообщений для отправки в AI.
 */
function getProfileAnalysisPrompt(characterName, characterMessages,messagesToAnalis) {
    const messagesForAnalysis = characterMessages.slice(-messagesToAnalis); // Берем последние N сообщений

    const promptText = `
Проанализируй следующие сообщения от пользователя по имени "${characterName}".
Твоя задача — создать краткое, но емкое описание его стиля общения, которое поможет другой нейросети имитировать его.

Обрати внимание на:
1. **Общий тон и настроение:** (например, веселый, саркастичный, серьезный, задумчивый, энергичный, спокойный)
2. **Лексика:** Часто используемые или характерные слова, сленг, уровень формальности/неформальности речи.
3. **Структура фраз:** Предпочитает короткие или длинные предложения? Часто ли использует вопросы, восклицания, многоточия?
4. **Особенности пунктуации или использование эмодзи (если они переданы в текстовом виде, например, ":)", "xD").**
5. **Тематика:** Если есть повторяющиеся темы или интересы, упомяни их кратко.
6. **Ключевые характеристики:** 2-3 самых ярких черты его стиля.

Сообщения для анализа:
${messagesForAnalysis.map(msg => `- "${msg}"`).join('\n')}

Предоставь результат в виде одного абзаца текста, описывающего стиль общения "${characterName}".
Пример ответа:
"${characterName} общается неформально и дружелюбно, часто использует короткие фразы и сленговые выражения вроде 'топчик' и 'жиза'. Его сообщения обычно позитивны, с частыми восклицательными знаками и смайликами типа ':D'. Любит обсуждать музыку и игры."

Твой анализ стиля общения "${characterName}":
`;

    return [{ role: 'user', content: promptText }];
}

/**
 * Выбирает несколько характерных примеров сообщений персонажа.
 * @param {string[]} allCharacterMessages - Все сообщения персонажа.
 * @param maxAnalysisMessage
 * @returns {string[]} - Массив из нескольких примеров.
 */
function selectExampleMessages(allCharacterMessages, maxAnalysisMessage) {
    if (allCharacterMessages.length <= maxAnalysisMessage) {
        return allCharacterMessages.filter(msg => msg.length > 10 && msg.length < 200);
    }

    const step = Math.floor(allCharacterMessages.length / maxAnalysisMessage);
    const examples = [];
    for (let i = 0; i < maxAnalysisMessage; i++) {
        const potentialMsg = allCharacterMessages[i * step];
        if (potentialMsg && potentialMsg.length > 10 && potentialMsg.length < 200) {
            examples.push(potentialMsg);
        } else if (allCharacterMessages[i]) {
            const fallbackMsg = allCharacterMessages.slice(i * step).find(m => m && m.length > 10 && m.length < 200);
            if (fallbackMsg) examples.push(fallbackMsg);
        }
    }
    return examples.slice(0, maxAnalysisMessage);
}


module.exports = {
    getProfileAnalysisPrompt,
    getConversationPrompt,
    selectExampleMessages,
};
