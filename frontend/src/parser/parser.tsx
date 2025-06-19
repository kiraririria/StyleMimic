export interface ParsedMessage {
    sender: string;
    text: string;
}

export const parseHtmlFile = (htmlString: string): ParsedMessage[] => {
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

        if ((sender !== 'Неизвестный отправитель' || textContent !== 'Нет текста') &&
            !textContent.includes("Not included") &&
            !textContent.includes("<!DOCTYPE")) {
            messages.push({
                sender,
                text: textContent,
            });
        } else {
            console.warn(`Пропущено сообщение (index: ${index}) из-за отсутствия ключевых данных.`);
        }
    });

    return messages;
};

export const parseJsonFile = (jsonString: string): ParsedMessage[] => {
    try {
        const data = JSON.parse(jsonString);

        if (!data.messages || !Array.isArray(data.messages)) {
            throw new Error('Некорректный формат JSON: отсутствует массив сообщений');
        }

        const messages: ParsedMessage[] = [];

        data.messages.forEach((msg: any) => {
            if (msg.type !== 'message') return;

            const sender = msg.from || 'Неизвестный отправитель';
            let text = '';

            if (typeof msg.text === 'string') {
                text = msg.text;
            } else if (Array.isArray(msg.text)) {
                text = msg.text
                    .filter((entity: any) => entity.text && typeof entity.text === 'string')
                    .map((entity: any) => entity.text)
                    .join('');
            }

            if (text.trim()) {
                messages.push({
                    sender,
                    text: text.trim(),
                });
            }
        });

        return messages;
    } catch (err) {
        throw new Error(`Ошибка парсинга JSON: ${err instanceof Error ? err.message : String(err)}`);
    }
};