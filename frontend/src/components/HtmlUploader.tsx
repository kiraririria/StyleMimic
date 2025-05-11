import React, { ChangeEvent } from 'react';
import { ParsedMessage, parseChatHtmlToJson } from '../parser/parser';

interface HtmlUploaderProps {
    onFileUpload: (fileName: string, messages: ParsedMessage[]) => void;
    onError: (errorMessage: string) => void;
    isLoading: boolean;
    currentFileName: string;
}

const HtmlUploader: React.FC<HtmlUploaderProps> = ({ onFileUpload, onError, isLoading, currentFileName }) => {
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const htmlString = e.target?.result as string;
            if (htmlString) {
                try {
                    const jsonData = parseChatHtmlToJson(htmlString);
                    if (jsonData.length === 0) {
                        onError("Сообщений не найдено в файле HTML. Возможно, структура HTML не соответствует ожидаемой, или файл пуст.");
                    } else {
                        onFileUpload(file.name, jsonData);
                    }
                } catch (err) {
                    console.error("Ошибка при парсинге HTML:", err);
                    const errorMessage = err instanceof Error ? err.message : String(err);
                    onError(`Ошибка при обработке файла "${file.name}": ${errorMessage}`);
                }
            } else {
                onError("Не удалось прочитать содержимое файла.");
            }
        };
        reader.onerror = () => {
            console.error("Ошибка чтения файла");
            onError(`Ошибка при чтении файла "${file.name}".`);
        };
        reader.readAsText(file);
    };

    return (
        <div style={{ margin: '20px 0', border: '1px solid #555', padding: '15px', borderRadius: '8px', backgroundColor: '#333842' }}>
            <h4>Загрузка и парсинг HTML файла чата</h4>
            <input
                type="file"
                accept=".html,.htm"
                onChange={handleFileChange}
                disabled={isLoading}
                style={{ marginBottom: '10px' }}
                key={currentFileName || 'file-input'} // Сброс инпута при смене файла или очистке
            />
            {currentFileName && <p>Загружен файл: {currentFileName}</p>}
        </div>
    );
};

export default HtmlUploader;
