import React from 'react';
import { CharacterProfile } from '../types';

interface CharacterProfilePanelProps {
    profile: CharacterProfile | null;
    isLoading: boolean;
}

const CharacterProfilePanel: React.FC<CharacterProfilePanelProps> = ({ profile, isLoading }) => {
    if (isLoading) {
        return (
            <div className="card">
                <h4 className="card-header">Профиль Персонажа</h4>
                <p>Загрузка профиля...</p>
            </div>
        );
    }

    if (!profile || !profile.name) {
        return (
            <div className="card">
                <h4 className="card-header">Профиль Персонажа</h4>
                <p>Профиль не загружен или не определен. Загрузите HTML-файл с чатом, чтобы создать профиль.</p>
            </div>
        );
    }

    return (
        <div className="card">
            <h4>Профиль Персонажа: {profile.name}</h4>
            <div>
                <strong>Описание стиля (используется AI):</strong>
                <p style={textBlockStyle}>{profile.styleSummary.replace("```text","").replace("```","") || "Описание стиля отсутствует."}</p>
            </div>
            {profile.exampleMessages && profile.exampleMessages.length > 0 && (
                <div>
                    <strong>Примеры сообщений (используются AI):</strong>
                    <ul style={{ paddingLeft: '20px', maxHeight: '150px', overflowY: 'auto' }}>
                        {profile.exampleMessages.map((msg, index) => (
                            <li key={index} style={textBlockStyle}>"{msg}"</li>
                        ))}
                    </ul>
                </div>
            )}
            {!profile.exampleMessages || profile.exampleMessages.length === 0 && (
                <p>Примеры сообщений отсутствуют.</p>
            )}
        </div>
    );
};

const textBlockStyle: React.CSSProperties = {
    backgroundColor: '#4a4e57',
    padding: '8px',
    borderRadius: '4px',
    margin: '5px 0',
    fontSize: '0.9em',
    whiteSpace: 'pre-wrap',
}

export default CharacterProfilePanel;
