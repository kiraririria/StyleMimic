import React, { useState, useEffect } from 'react';
import './App.css';

import { ParsedMessage as ImportedParsedMessage, ChatMessage, CharacterProfile } from './types';


import UserProfileInput from './components/UserProfileInput';
import SettingsPanel, { AISettings, DEFAULT_AI_SETTINGS} from './components/SettingsPanel';
import HtmlUploader from './components/FileUploader';
import CharacterProfilePanel from './components/CharacterProfilePanel';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import ChatComponent from "./components/ChatComponent";

const API_BASE_URL = 'http://localhost:5001';

interface ParsedMessage extends ImportedParsedMessage {}

function App() {
  let tempName = localStorage.getItem('userName');
  if (tempName===null)
  {
    tempName = "";
  }
  const [userName, setUserName] = useState<string>(tempName);
  const [characterName, setCharacterName] = useState<string | null>(null);
  const [characterProfile, setCharacterProfile] = useState<CharacterProfile | null>(null);
  const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);

  const [parsedHtmlMessages, setParsedHtmlMessages] = useState<ParsedMessage[] | null>(null);
  const [htmlFileName, setHtmlFileName] = useState<string>('');
  const [htmlParserError, setHtmlParserError] = useState<string | null>(null);
  const [isHtmlLoading, setIsHtmlLoading] = useState<boolean>(false);
  const [isHtmlWaslLoading, setIsHtmlWasLoading] = useState<boolean>(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) setUserName(savedUserName);

    const savedSettings = localStorage.getItem('aiSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings) as AISettings;
        if (parsedSettings.analysisModel.length==0) parsedSettings.analysisModel = DEFAULT_AI_SETTINGS.analysisModel;
        if (parsedSettings.analysisModel.length==0) parsedSettings.chatModel = DEFAULT_AI_SETTINGS.chatModel;
        setAiSettings(parsedSettings);
      } catch (e) { setAiSettings(DEFAULT_AI_SETTINGS); }
    }
  }, []);

  const handleUserNameSet = (name: string) => {
    const trimmedName = name.trim();
    setUserName(trimmedName);
    localStorage.setItem('userName', trimmedName);
  };

  const handleAiSettingsChange = (newSettings: AISettings) => {
    setAiSettings(newSettings);
    localStorage.setItem('aiSettings', JSON.stringify(newSettings));
  };

  const handleHtmlUploaded = (fileName: string, messages: ParsedMessage[]) => {
    setIsHtmlLoading(true);
    setIsHtmlWasLoading(true)
    setHtmlParserError(null);
    setHtmlFileName(fileName);
    setParsedHtmlMessages(messages);
    setChatMessages([]);
    setCharacterName(null);
    setCharacterProfile(null);
    setIsHtmlLoading(false);
  };

  const handleHtmlUploadError = (errorMessage: string) => {
    setHtmlParserError(errorMessage);
    setHtmlFileName('');
    setParsedHtmlMessages(null);
    setIsHtmlLoading(false);
  };

  useEffect(() => {
    if (!parsedHtmlMessages || parsedHtmlMessages.length === 0 || !userName) {
      if (parsedHtmlMessages && parsedHtmlMessages.length > 0 && !userName) {
        setHtmlParserError("Пожалуйста, сначала введите ваше имя пользователя.");
      }
      return;
    }

    let identifiedCharName: string | null = null;
    for (const msg of parsedHtmlMessages) {
      if (msg.sender.toLowerCase() !== userName.toLowerCase()) {
        identifiedCharName = msg.sender;
        break;
      }
    }

    if (!identifiedCharName) {
      setHtmlParserError(`Не удалось определить другого участника в "${htmlFileName}", отличного от "${userName}".`);
      setCharacterName(null); setChatMessages([]); return;
    }

    setCharacterName(identifiedCharName);
    setHtmlParserError(null);

    const initialMsgs: ChatMessage[] = [];
    const charMsgsForProfile: string[] = [];
    parsedHtmlMessages.forEach(msg => {
      if (msg.sender.toLowerCase() === userName.toLowerCase()) {
        initialMsgs.push({ role: 'user', content: msg.text });
      } else if (msg.sender.toLowerCase() === identifiedCharName!.toLowerCase()) {
        initialMsgs.push({ role: 'assistant', content: msg.text });
        charMsgsForProfile.push(msg.text);
      }
    });
    setChatMessages(initialMsgs);

    if (identifiedCharName && charMsgsForProfile.length > 0) {
      createAndSetCharacterProfile(identifiedCharName, charMsgsForProfile);
    }
  }, [parsedHtmlMessages, userName, htmlFileName]);

  const createAndSetCharacterProfile = async (charName: string, messages: string[]) => {
    if (!charName || messages.length === 0) return;
    setIsAiLoading(true); setAiError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/create-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: charName,
          messages: messages.slice(-aiSettings.messagesForAnalysis),
          model: aiSettings.analysisModel,
          analysisMessages: aiSettings.messagesForAnalysis,
          aiOptionsFromClient: {
            temperature: aiSettings.temperature,
            maxTokens: aiSettings.maxTokens,
          }
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Ошибка создания профиля");
      }
      const profileData: CharacterProfile = await response.json();
      setCharacterProfile(profileData);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Не удалось создать профиль";
      setAiError(`Профиль для ${charName}: ${msg}`); setCharacterProfile(null);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendChatMessage = async (userInputText: string) => {
    if (!userInputText.trim()) return;

    const newUserMessage: ChatMessage = { role: 'user', content: userInputText.trim() };
    const updatedChatMessages = [...chatMessages, newUserMessage];
    setChatMessages(updatedChatMessages);
    setIsAiLoading(true);
    setAiError(null);

    try {
      const maxHistory = aiSettings.historyMessagesCount;
      const messagesToSend = updatedChatMessages.slice(-maxHistory - 1);

      const payload: any = {
        messages: messagesToSend,
        model: aiSettings.chatModel,
        aiOptionsFromClient: {
          temperature: aiSettings.temperature,
          maxTokens: aiSettings.maxTokens,
          historyMessagesCount: aiSettings.historyMessagesCount,
        }
      };

      if (characterProfile) {
        payload.characterProfile = characterProfile;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Запрос не удался: ${response.status}`);
      }

      const data = await response.json();
      const aiReply: ChatMessage = {
        role: 'assistant',
        content: data.reply.replace("```text", "")
      };

      setChatMessages(prev => [...prev, aiReply]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Ошибка AI";
      setAiError(msg);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleNewChat = () => {
    setChatMessages([]); setAiError(null);
    setCharacterName(null); setCharacterProfile(null);
    setParsedHtmlMessages(null); setHtmlFileName('');
    setIsHtmlWasLoading(false)
  };

  const handleDownloadChat = () => {
    if (chatMessages.length === 0) { alert("Нет сообщений для скачивания."); return; }
    let chatText = `История чата с ${characterName || 'AI'}\nПользователь: ${userName || 'Вы'}\n`;
    if (characterProfile) chatText += `Профиль: ${characterProfile.styleSummary}\n`;
    chatText += "--------------------------------------\n\n";
    chatMessages.forEach(msg => {
      const sender = msg.role === 'user' ? (userName || 'Вы') : (characterName || 'AI');
      chatText += `${sender}: ${msg.content}\n\n`;
    });
    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `chat_with_${(characterName || 'AI').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.txt`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const globalDisabled = isAiLoading || isHtmlLoading;

  return (
      <div className="App">
        <header className="App-header">
          <h1>Персонализированный Чат-бот</h1>
        </header>

        <main style={{ padding: '20px', maxWidth: '1300px', margin: '0 auto', display: 'flex', gap: '20px', alignItems: 'flex-center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <SettingsPanel
                settings={aiSettings}
                onSettingsChange={handleAiSettingsChange}
                disabled={globalDisabled}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <UserProfileInput
                currentUserName={userName}
                onUserNameSet={handleUserNameSet}
                disabled={globalDisabled}
            />
            <HtmlUploader
                onFileUpload={handleHtmlUploaded}
                onError={handleHtmlUploadError}
                isLoading={globalDisabled || !userName}
                currentFileName={htmlFileName}
            />
          </div>
          {isHtmlWaslLoading &&         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {htmlParserError && <p style={{ color: 'red', marginTop: '10px' }}>{htmlParserError}</p>}
            <CharacterProfilePanel
                profile={characterProfile}
                isLoading={isAiLoading && !characterProfile}
            />
          </div>}

          <ChatComponent
           characterName={characterName}
           characterProfile={characterProfile} 
           chatMessages={chatMessages} 
           globalDisabled={globalDisabled}
           handleDownloadChat={handleDownloadChat} 
           handleNewChat={handleNewChat}
           handleSendChatMessage={handleSendChatMessage}
           htmlParserError={htmlParserError} 
           isAiLoading={isAiLoading}
           isHtmlWaslLoading={isHtmlWaslLoading}
           parsedHtmlMessages={parsedHtmlMessages} userName={userName}/>
        </main>
      </div>
  );
}

export default App;
