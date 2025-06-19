import React, {MouseEventHandler} from 'react';
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import {CharacterProfile, ChatMessage, ParsedMessage} from "../types";


interface ChatComponentProps {
    chatMessages: ChatMessage[],
    handleDownloadChat: MouseEventHandler<HTMLButtonElement>,
    globalDisabled: boolean,
    handleNewChat: MouseEventHandler<HTMLButtonElement>,
    handleSendChatMessage: (message: string) => void,
    parsedHtmlMessages: ParsedMessage[] | null,
    htmlParserError: string | null,
    characterProfile: CharacterProfile | null,
    aiError?: string | null,
    isAiLoading: boolean,
    userName: string,
    characterName: string | null,
    isHtmlWaslLoading: boolean
}

const ChatComponent: React.FC<ChatComponentProps> = ({
                                                         chatMessages,
                                                         handleDownloadChat,
                                                         globalDisabled,
                                                         handleNewChat,
                                                         handleSendChatMessage,
                                                         parsedHtmlMessages,
                                                         htmlParserError,
                                                         characterProfile,
                                                         aiError,
                                                         isAiLoading,
                                                         userName,
                                                         characterName,
                                                         isHtmlWaslLoading
                                                     }) => {

    if (!isHtmlWaslLoading)
    {
        return (
            <div></div>
        )
    }
    return (
        <div className="card" style={{ flex: 2, border: '1px solid #444', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', minHeight: '600px',maxWidth: '650px' /* Для лучшего вида */ }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 className="card-header">Чат с {characterName ? characterName : (userName ? "AI" : "...")}</h3>
                <div>
                    <button onClick={handleDownloadChat} disabled={chatMessages.length === 0 || globalDisabled} style={{ padding: '8px 12px', marginRight: '10px' }}>
                        Скачать чат
                    </button>
                    <button onClick={handleNewChat} disabled={globalDisabled} style={{ padding: '8px 12px' }}>
                        Новый чат / Сброс
                    </button>
                </div>
            </div>
            <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                <ChatWindow
                    messages={chatMessages}
                    isLoadingAi={isAiLoading}
                    aiError={aiError}
                    userName={userName || "Вы"}
                    characterName={characterName}
                />
            </div>
            <ChatInput
                onSendMessage={handleSendChatMessage}
                isLoading={globalDisabled || !userName || (parsedHtmlMessages !== null && !characterName && !htmlParserError && !characterProfile) }
            />
        </div>
    );
};

export default ChatComponent;