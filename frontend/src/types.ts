export interface ParsedMessage {
    sender: string;
    text: string;
    // другие поля, если есть
}

// Интерфейс для сообщений в чате с AI
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface CharacterProfile {
    name: string;
    styleSummary: string;
    exampleMessages?: string[];
}
