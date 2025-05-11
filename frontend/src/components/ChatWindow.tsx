import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface ChatWindowProps {
    messages: ChatMessage[];
    isLoadingAi: boolean;
    aiError?: string | null;
    userName: string;
    characterName: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoadingAi, aiError, userName, characterName }) => {
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
        <div className="chat-window" style={{ height: '400px', overflowY: 'auto', border: '1px solid #555', padding: '10px', marginBottom: '10px', backgroundColor: '#3a3f4b', borderRadius: '4px' }}>
            {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.role}`}>
                    <span className="message-sender">{getDisplayName(msg.role)}: </span>
                    <span className="message-content">{msg.content}</span>
                </div>
            ))}
            {isLoadingAi && <div className="message system"><em>{(characterName || 'AI')} думает...</em></div>}
            {aiError && <div className="message system error" style={{color: 'red'}}>Ошибка AI: {aiError}</div>}
            <div ref={chatEndRef} />
        </div>
    );
};

export default ChatWindow;
