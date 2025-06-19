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
                <h4 className="card-header">Профиль</h4>
                <p>Загрузка профиля...</p>
            </div>
        );
    }

    if (!profile || !profile.name) {
        return (
            <div></div>
        );
    }

    return (
        <div className="card">
            <h4 className="card-header">Профиль: {profile.name}</h4>
            <div>
                <strong>Описание стиля:</strong>
                <p className="profile-field">{profile.styleSummary.replace("```text","").replace("```","") || "Описание стиля отсутствует."}</p>
            </div>
            {/*{profile.exampleMessages && profile.exampleMessages.length > 0 && (*/}
            {/*    <div>*/}
            {/*        <strong>Примеры сообщений:</strong>*/}
            {/*        <ul style={{ paddingLeft: '20px', maxHeight: '150px', overflowY: 'auto' }}>*/}
            {/*            {profile.exampleMessages.map((msg, index) => (*/}
            {/*                <li key={index} className="profile-field">"{msg}"</li>*/}
            {/*            ))}*/}
            {/*        </ul>*/}
            {/*    </div>*/}
            {/*)}*/}
            {/*{!profile.exampleMessages || profile.exampleMessages.length === 0 && (*/}
            {/*    <p>Примеры сообщений отсутствуют.</p>*/}
            {/*)}*/}
        </div>
    );
};

export default CharacterProfilePanel;
