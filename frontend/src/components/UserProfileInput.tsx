import React, { useState } from 'react';

interface UserProfileInputProps {
    currentUserName: string;
    onUserNameSet: (name: string) => void;
    disabled: boolean;
}

const UserProfileInput: React.FC<UserProfileInputProps> = ({ currentUserName, onUserNameSet, disabled }) => {
    const [inputName, setInputName] = useState<string>(currentUserName);
    const [isEditing, setIsEditing] = useState<boolean>(!currentUserName);

    const handleSet = () => {
        if (inputName.trim()) {
            onUserNameSet(inputName.trim());
            setIsEditing(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    }

    return (
        <div className="card">
            <h4 className="card-header">Ваше имя в чате</h4>
            {isEditing || !currentUserName ? (
                <>
                    <input
                        type="text"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        placeholder="Введите ваше имя"
                        disabled={disabled}
                        style={{ marginRight: '10px', padding: '8px', borderRadius: '4px' }}
                    />
                    <button onClick={handleSet} disabled={disabled || !inputName.trim()}>
                        Установить имя
                    </button>
                </>
            ) : (
                <>
                    <span style={{ marginRight: '10px', fontWeight: 'bold' }}>{currentUserName}</span>
                    <button onClick={handleEdit} disabled={disabled}>Изменить имя</button>
                </>
            )}
        </div>
    );
};

export default UserProfileInput;
