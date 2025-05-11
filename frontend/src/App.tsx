import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';

// Предполагаем, что parser.ts находится в ./parser/parser.ts
// и экспортирует ParsedMessage и parseChatHtmlToJson
import { parseChatHtmlToJson, ParsedMessage as ImportedParsedMessage } from './parser/parser';

// Интерфейс для сообщений в чате с AI (соответствует ожиданиям бэкенда)
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Расширяем ParsedMessage из вашего парсера, если нужно, или используем его как есть
// Для этого примера, будем считать, что ImportedParsedMessage это то, что возвращает парсер
interface ParsedMessage extends ImportedParsedMessage {}

const API_BASE_URL = 'http://localhost:5001'; // URL вашего бэкенд-сервера

function App() {
  // Состояния для парсера HTML
  const [parsedHtmlJson, setParsedHtmlJson] = useState<ParsedMessage[] | null>(null);
  const [htmlFileName, setHtmlFileName] = useState<string>('');
  const [htmlParserError, setHtmlParserError] = useState<string | null>(null);
  const [isHtmlLoading, setIsHtmlLoading] = useState<boolean>(false);

  // Состояния для чата с AI
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const chatEndRef = useRef<null | HTMLDivElement>(null); // Для автоскролла

  // Автоскролл к последнему сообщению в чате
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [chatMessages]);


  // Эффект для инициализации чата на основе спарсенных HTML данных
  useEffect(() => {
    if (parsedHtmlJson && parsedHtmlJson.length > 0) {
      // Преобразуем спарсенные сообщения в формат для чата с AI
      // Здесь простая логика: все сообщения из HTML считаются от пользователя.
      // Вы можете усложнить, если нужно определить роли на основе `sender`.

      const initialChatMsgs: ChatMessage[] = parsedHtmlJson.map(msg => ({

        role: `${msg.sender == "Ivan Koptyaev" ? "user" : "assistant"}`, // Или более сложная логика
        content: `${msg.text}` // Добавляем контекст
      }));
      setChatMessages(initialChatMsgs);

      // Опционально: можно сразу отправить эти сообщения AI для "продолжения" диалога
      // если это требуется по логике вашего приложения.
      // handleSendMessage(undefined, initialChatMsgs);
    }
  }, [parsedHtmlJson, htmlFileName]);
  const [character, setCharacter] = useState("AI");
  // Запускается при изменении спарсенных данных


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setHtmlFileName('');
    setParsedHtmlJson(null);
    setHtmlParserError(null);
    setChatMessages([]); // Очищаем текущий чат при загрузке нового файла

    if (file) {
      setHtmlFileName(file.name);
      setIsHtmlLoading(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        const htmlString = e.target?.result as string;
        if (htmlString) {
          try {
            const jsonData = parseChatHtmlToJson(htmlString); // Вызов вашего парсера
            if (jsonData.length === 0) {
              setHtmlParserError("Сообщений не найдено в файле. Возможно, структура HTML не соответствует ожидаемой, или файл пуст.");
              setParsedHtmlJson([]);
            } else {
              setParsedHtmlJson(jsonData);
              // useEffect выше обработает это и заполнит chatMessages
            }
          } catch (err) {
            console.error("Ошибка при парсинге HTML:", err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            setHtmlParserError(`Ошибка при обработке файла "${file.name}": ${errorMessage}`);
            setParsedHtmlJson(null);
          }
        } else {
          setHtmlParserError("Не удалось прочитать содержимое файла.");
        }
        setIsHtmlLoading(false);
      };
      reader.onerror = () => {
        console.error("Ошибка чтения файла");
        setHtmlParserError(`Ошибка при чтении файла "${file.name}".`);
        setIsHtmlLoading(false);
      };
      reader.readAsText(file);
    }
  };

  const handleSendMessage = async (event?: FormEvent<HTMLFormElement>, predefinedMessages?: ChatMessage[]) => {
    if (event) event.preventDefault();
    setAiError(null);

    let currentMessageHistory: ChatMessage[];
    let messagesToSendToServer: ChatMessage[];

    if (predefinedMessages) { // Если переданы сообщения (например, из HTML для первого запроса)
      messagesToSendToServer = predefinedMessages;
      // Обновляем chatMessages, чтобы отобразить их, если они еще не там
      // Однако, useEffect выше уже должен был их добавить, если parsedHtmlJson изменился.
      // Если мы хотим, чтобы отправка произошла только по кнопке, то useEffect не должен их автоматически отправлять.
      // Для данного примера, будем считать, что predefinedMessages используются для специальной отправки.
      // setChatMessages(prev => [...prev, ...predefinedMessages.filter(pm => !prev.find(cm => cm.content === pm.content && cm.role === pm.role))]);

    } else if (userInput.trim()) {
      const newUserMessage: ChatMessage = {role: 'user', content: userInput.trim()};

      currentMessageHistory = [...chatMessages, newUserMessage];

      setChatMessages(currentMessageHistory); // Отображаем сообщение пользователя сразу
      messagesToSendToServer = currentMessageHistory;
      setUserInput('');
    } else {
      return; // Ничего не отправлять
    }

    if (messagesToSendToServer.length === 0) return;

    setIsAiLoading(true);

    // Выберите модель (можно сделать это более динамичным позже)
    const modelToUse = "deepseek/deepseek-prover-v2:free"; // Пример

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesToSendToServer, // Отправляем всю релевантную историю
          model: modelToUse,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Запрос не удался со статусом ${response.status}`);
      }

      const data = await response.json();
      const aiReply: ChatMessage = {role: 'assistant', content: data.reply};

      setChatMessages(prevMessages => [...prevMessages, aiReply]); // Добавляем ответ AI к истории

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Произошла неизвестная ошибка AI";
      console.error('Ошибка при отправке сообщения AI:', errorMessage);
      setAiError(errorMessage);
      // Опционально: можно откатить последнее сообщение пользователя, если отправка не удалась
    } finally {
      setIsAiLoading(false);
    }
  };

  // Функция для начала нового чата (сбрасывает текущий)
  const handleNewChat = () => {
    setChatMessages([]);
    setUserInput('');
    setAiError(null);
    // Не сбрасываем HTML парсер, чтобы пользователь мог снова на его основе начать чат, если захочет
  };


  return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <p>Анализатор HTML чатов и Чат-бот</p>
          <div style={{
            margin: '20px 0',
            border: '1px solid #555',
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: '#333842'
          }}>
            <h4>Загрузка и парсинг HTML файла чата</h4>
            <input
                type="file"
                accept=".html,.htm"
                onChange={handleFileChange}
                disabled={isHtmlLoading || isAiLoading}
                style={{marginBottom: '10px'}}
            />
            {isHtmlLoading && <p>Обработка файла: {htmlFileName}...</p>}
            {!isHtmlLoading && htmlFileName && !htmlParserError && parsedHtmlJson !== null && (
                <p>Файл "{htmlFileName}" обработан. Сообщения из него загружены в чат ниже.</p>
            )}
            {htmlParserError && <p style={{color: 'red'}}>{htmlParserError}</p>}
          </div>
        </header>

        <main style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
          {/* Отображение спарсенного JSON (если нужно для отладки или информации) */}
          {/* {parsedHtmlJson && parsedHtmlJson.length > 0 && (
          <div style={{marginBottom: '20px'}}>
            <h2>Результат парсинга HTML (JSON):</h2>
            <pre style={{
              backgroundColor: '#f5f5f5', color: '#333',
              border: '1px solid #ccc', padding: '15px',
              maxHeight: '200px', overflowY: 'auto',
              whiteSpace: 'pre-wrap', wordBreak: 'break-all', textAlign: 'left'
            }}>
              {JSON.stringify(parsedHtmlJson, null, 2)}
            </pre>
          </div>
        )} */}

          {/* Секция чата с AI */}
          <div style={{border: '1px solid #444', borderRadius: '8px', padding: '15px', backgroundColor: '#282c34'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
              <h3>Чат с `${character}`</h3>
              <button onClick={handleNewChat} disabled={isAiLoading} style={{padding: '8px 12px'}}>Новый чат</button>
            </div>
            <div className="chat-window" style={{
              height: '400px',
              overflowY: 'auto',
              border: '1px solid #555',
              padding: '10px',
              marginBottom: '10px',
              backgroundColor: '#3a3f4b',
              borderRadius: '4px'
            }}>
              {chatMessages.map((msg, index) => (
                  <div key={index} className={`message ${msg.role}`}>
                    <span className="message-sender">{msg.role === 'user' ? 'Вы' : `${character}`}: </span>
                    <span className="message-content">{msg.content}</span>
                  </div>
              ))}
              {isAiLoading && <div className="message system"><em>AI думает...</em></div>}
              <div ref={chatEndRef}/>
              {/* Элемент для автоскролла */}
            </div>
            {aiError && <p style={{color: 'red', marginTop: '10px'}}>Ошибка AI: {aiError}</p>}

            <form onSubmit={handleSendMessage} style={{display: 'flex', marginTop: '10px'}}>
              <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Введите ваше сообщение..."
                  disabled={isAiLoading || isHtmlLoading}
                  style={{
                    flexGrow: 1,
                    marginRight: '10px',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #555'
                  }}
              />
              <button type="submit" disabled={isAiLoading || isHtmlLoading || !userInput.trim()}
                      style={{padding: '10px 15px', borderRadius: '4px'}}>
                Отправить
              </button>
            </form>
          </div>
        </main>
      </div>
  );
}

export default App;
