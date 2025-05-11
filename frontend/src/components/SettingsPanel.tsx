import React from 'react';

export const AVAILABLE_MODELS = [
    "deepseek/deepseek-prover-v2:free",
    "mistralai/mistral-small-3.1-24b-instruct:free"
];

export interface AISettings {
    temperature: number;
    maxTokens: number;
    analysisModel: string;
    chatModel: string;
    messagesForAnalysis: number;
    historyMessagesCount: number;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
    temperature: 0.7,
    maxTokens: 500,
    analysisModel: AVAILABLE_MODELS[0],
    chatModel: AVAILABLE_MODELS[0],
    messagesForAnalysis: 20,
    historyMessagesCount: 10,
};

interface SettingsPanelProps {
    settings: AISettings;
    onSettingsChange: (newSettings: AISettings) => void;
    disabled: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, disabled }) => {
    const handleChange = (field: keyof AISettings, value: string | number) => {
        let processedValue = value;
        if (typeof settings[field] === 'number') {
            processedValue = Number(value);
            if (isNaN(processedValue)) return;
            if (field === 'temperature' && (processedValue < 0 || processedValue > 2)) return;
            if ((field === 'maxTokens' || field === 'messagesForAnalysis' || field === 'historyMessagesCount') && processedValue < 1) {
                processedValue = 1;
            }
        }
        onSettingsChange({ ...settings, [field]: processedValue });
    };

    const handleResetToDefaults = () => {
        onSettingsChange(DEFAULT_AI_SETTINGS);
    };

    return (
        <div style={{ border: '1px solid #555', padding: '15px', borderRadius: '8px', backgroundColor: '#333842' }}>
            <h4>Настройки AI</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 15px', alignItems: 'center' }}>
                <label htmlFor="temperature">Температура:</label>
                <input
                    type="number"
                    id="temperature"
                    value={settings.temperature}
                    onChange={(e) => handleChange('temperature', e.target.value)}
                    min="0" max="2" step="0.1"
                    disabled={disabled}
                    style={{width: '80px'}}
                />

                <label htmlFor="maxTokens">Макс. токенов (ответ):</label>
                <input
                    type="number"
                    id="maxTokens"
                    value={settings.maxTokens}
                    onChange={(e) => handleChange('maxTokens', e.target.value)}
                    min="50" step="50"
                    disabled={disabled}
                    style={{width: '80px'}}
                />

                <label htmlFor="analysisModel">Модель для анализа:</label>
                <select
                    id="analysisModel"
                    value={settings.analysisModel}
                    onChange={(e) => handleChange('analysisModel', e.target.value)}
                    disabled={disabled}
                >
                    {AVAILABLE_MODELS.map(model => <option key={model} value={model}>{model}</option>)}
                </select>

                <label htmlFor="chatModel">Модель для общения:</label>
                <select
                    id="chatModel"
                    value={settings.chatModel}
                    onChange={(e) => handleChange('chatModel', e.target.value)}
                    disabled={disabled}
                >
                    {AVAILABLE_MODELS.map(model => <option key={model} value={model}>{model}</option>)}
                </select>

                <label htmlFor="messagesForAnalysis">Сообщений для анализа:</label>
                <input
                    type="number"
                    id="messagesForAnalysis"
                    value={settings.messagesForAnalysis}
                    onChange={(e) => handleChange('messagesForAnalysis', e.target.value)}
                    min="5" step="1"
                    disabled={disabled}
                    style={{width: '80px'}}
                />

                <label htmlFor="historyMessagesCount">Сообщений истории (контекст):</label>
                <input
                    type="number"
                    id="historyMessagesCount"
                    value={settings.historyMessagesCount}
                    onChange={(e) => handleChange('historyMessagesCount', e.target.value)}
                    min="1" step="1"
                    disabled={disabled}
                    style={{width: '80px'}}
                />
            </div>
            <button onClick={handleResetToDefaults} disabled={disabled} style={{ marginTop: '15px' }}>
                Сбросить настройки
            </button>
        </div>
    );
};

export default SettingsPanel;
