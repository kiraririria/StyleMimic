// parser.tsx

export interface ParsedMessage {
    sender: string;
    text: string;
}

/**
 * Парсит HTML-файл телеграм чата
 * <div class="history">
 *   <div class="message" id="messageXXX">
 *     <div class="body">
 *       <div class="from_name">Отправитель</div>
 *       <div class="text">Текст сообщения</div>
 *     </div>
 *   </div>
 *   ...
 * </div>

 * @param htmlString Строка с HTML-содержимым файла чата.
 * @returns Массив объектов ParsedMessage.
 */
export const parseChatHtmlToJson = (htmlString: string): ParsedMessage[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const messages: ParsedMessage[] = [];

    const messageNodes = doc.querySelectorAll('div.history div.message');

    messageNodes.forEach((messageNode, index) => {

        const bodyNode = messageNode.querySelector('div.body');
        let sender = 'Неизвестный отправитель';
        let textContent = 'Нет текста';

        if (bodyNode) {
            const fromNameNode = bodyNode.querySelector('div.from_name');
            if (fromNameNode && fromNameNode.textContent) {
                sender = fromNameNode.textContent.trim();
            }

            const textNode = bodyNode.querySelector('div.text');
            if (textNode && textNode.textContent) {
                textContent = textNode.textContent.trim();
            } else if (fromNameNode && bodyNode.textContent) {
                let fullBodyText = bodyNode.textContent.trim();
                if (sender !== 'Неизвестный отправитель') {
                    if (fullBodyText.startsWith(sender)) {
                        fullBodyText = fullBodyText.substring(sender.length).trim();
                    }
                }
                textContent = fullBodyText || 'Нет текста';
            }
        }

        if ((sender !== 'Неизвестный отправитель' || textContent !== 'Нет текста')) {
            messages.push({
                sender,
                text: textContent,
            });
        } else {
            console.warn(`Пропущено сообщение (index: ${index}) из-за отсутствия ключевых данных. HTML: ${messageNode.outerHTML.substring(0,100)}...`);
        }
    });

    return messages;
};