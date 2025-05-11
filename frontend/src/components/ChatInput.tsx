import React, { useState, FormEvent } from 'react';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
    const [userInput, setUserInput] = useState<string>('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (userInput.trim()) {
            onSendMessage(userInput.trim());
            setUserInput('');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', marginTop: '10px' }}>
            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Введите ваше сообщение..."
                disabled={isLoading}
                style={{ flexGrow: 1, marginRight: '10px', padding: '10px', borderRadius: '4px', border: '1px solid #555' }}
            />
            <button type="submit" disabled={isLoading || !userInput.trim()} style={{ padding: '10px 15px', borderRadius: '4px' }}>
                Отправить
            </button>
        </form>
    );
};

export default ChatInput;
