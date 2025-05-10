import React, { useState, ChangeEvent } from 'react';
import logo from './logo.svg';
import './App.css';

import { parseChatHtmlToJson, ParsedMessage } from './parser/parser';

function App() {
  const [parsedJson, setParsedJson] = useState<ParsedMessage[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setFileName('');
    setParsedJson(null);
    setError(null);

    if (file) {
      setFileName(file.name);
      setIsLoading(true);

      const reader = new FileReader();

      reader.onload = (e) => {
        const htmlString = e.target?.result as string;
        if (htmlString) {
          try {
            const jsonData = parseChatHtmlToJson(htmlString);
            if (jsonData.length === 0) {
              setError("Сообщений не найдено в файле. Возможно, структура HTML не соответствует ожидаемой, или файл пуст.");
              setParsedJson([]);
            } else {
              setParsedJson(jsonData);
            }
          } catch (err) {
            console.error("Ошибка при парсинге HTML:", err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(`Ошибка при обработке файла "${file.name}": ${errorMessage}`);
            setParsedJson(null);
          }
        } else {
          setError("Не удалось прочитать содержимое файла.");
        }
        setIsLoading(false);
      };

      reader.onerror = () => {
        console.error("Ошибка чтения файла");
        setError(`Ошибка при чтении файла "${file.name}".`);
        setIsLoading(false);
      };

      reader.readAsText(file);
    }
  };

  return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Загрузите HTML-файл вашего чата для анализа.
          </p>
          <input
              type="file"
              accept=".html,.htm"
              onChange={handleFileChange}
              disabled={isLoading}
              style={{ marginTop: '20px', marginBottom: '10px' }}
          />
          {isLoading && <p>Обработка файла: {fileName}...</p>}
          {!isLoading && fileName && !error && parsedJson !== null && (
              <p>Файл "{fileName}" обработан.</p>
          )}
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </header>
        <main style={{ padding: '20px', textAlign: 'left' }}>
          {parsedJson && parsedJson.length > 0 && (
              <div>
                <h2>Результат парсинга (JSON):</h2>
                <pre style={{
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ccc',
                  padding: '15px',
                  maxHeight: '60vh',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
              {JSON.stringify(parsedJson, null, 2)}
            </pre>
              </div>
          )}
          {parsedJson && parsedJson.length === 0 && !error && !isLoading && (
              <p>Сообщения в файле не найдены или не соответствуют ожидаемой структуре.</p>
          )}
        </main>
      </div>
  );
}

export default App;
