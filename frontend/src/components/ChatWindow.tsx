import React, { useRef, useEffect } from 'react';
import './ChatWindow.css'; // Создадим отдельный CSS файл для этого компонента

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface ChatWindowProps {
    messages: ChatMessage[];
    isLoadingAi: boolean;
    aiError?: string | null;
    userName: string;
    characterName: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
                                                   messages,
                                                   isLoadingAi,
                                                   aiError,
                                                   userName,
                                                   characterName
                                               }) => {
    const chatEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getDisplayName = (role: 'user' | 'assistant' | 'system') => {
        if (role === 'user') return userName || 'Вы';
        if (role === 'assistant') return characterName || 'AI';
        return 'Система';
    };

    return (
        <div className="chat-container">
            <div className="chat-window">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`}>
                        <span className="message-sender">{getDisplayName(msg.role)}: </span>
                        <span className="message-content">{msg.content}</span>
                    </div>
                ))}
                {isLoadingAi && (
                    <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <span>{(characterName || 'AI')} думает...</span>
                    </div>
                )}
                {aiError && (
                    <div className="message system error">
                        <span className="message-sender">Ошибка: </span>
                        <span className="message-content">{aiError}</span>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
        </div>
    );
};

export default ChatWindow;