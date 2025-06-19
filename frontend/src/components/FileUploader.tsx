import React, { ChangeEvent } from 'react';
import './FileUpload.css';
import {parseHtmlFile, parseJsonFile} from "../parser/parser";

interface ParsedMessage {
    sender: string;
    text: string;
}

interface FileUploaderProps {
    onFileUpload: (fileName: string, messages: ParsedMessage[]) => void;
    onError: (errorMessage: string) => void;
    isLoading: boolean;
    currentFileName: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, onError, isLoading, currentFileName }) => {
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (!content) {
                onError("Не удалось прочитать содержимое файла.");
                return;
            }

            try {
                if (file.name.endsWith('.json')) {
                    const jsonData = parseJsonFile(content);
                    if (jsonData.length === 0) {
                        onError("Сообщений не найдено в файле JSON.");
                    } else {
                        onFileUpload(file.name, jsonData);
                    }
                } else {
                    const jsonData = parseHtmlFile(content);
                    if (jsonData.length === 0) {
                        onError("Сообщений не найдено в файле HTML.");
                    } else {
                        onFileUpload(file.name, jsonData);
                    }
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                onError(`Ошибка при обработке файла "${file.name}": ${errorMessage}`);
                console.error("Ошибка при парсинге:", err);
            }
        };

        reader.onerror = () => {
            onError(`Ошибка при чтении файла "${file.name}".`);
        };

        reader.readAsText(file);
    };

    return (
        <div className="card">
            <h4 className="card-header">Загрузите файл чата (HTML/JSON)</h4>

            <div className="file-upload-wrapper">
                <button
                    type="button"
                    className={`file-upload-button ${isLoading ? 'uploading' : ''}`}
                    disabled={isLoading}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" fill="currentColor"/>
                    </svg>
                    {isLoading ? 'Загрузка...' : 'Выбрать файл'}
                </button>
                <input
                    type="file"
                    accept=".html,.htm,.json"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    key={currentFileName || 'file-input'}
                />
            </div>

            {currentFileName && (
                <div className="file-info">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#4caf50">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <span>Загружен файл: {currentFileName}</span>
                </div>
            )}
        </div>
    );
};

export default FileUploader;