export interface ParsedMessage {
    sender: string;
    text: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface CharacterProfile {
    name: string;
    styleSummary: string;
    exampleMessages?: string[];
}
