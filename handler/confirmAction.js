import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filesDir = path.join(__dirname, '../files');

export async function confirmAction(bot, post) {
    const chatId = post.chatId;
    await bot.sendMessage(chatId, 'Сохранить это напоминание?', {
        reply_markup: {
            inline_keyboard: [
                [{ text: "💾 Сохранить", callback_data: "save" }],
                [{ text: "🚫 Отменить", callback_data: "cancel" }]
            ]
        }
    });

    bot.removeTextListener(/.*/);
}

export async function cancel(bot, post, chatId) {
    try {
        try {
            await bot.deleteMessage(chatId, post.messageId);
        } catch (deleteError) {
            console.warn(`Не удалось удалить сообщение ${post.messageId}:`, deleteError.message);
        }

        if (post.remind) {
            switch (post.remind.type) {
                case 'photo':
                case 'video':
                case 'document':
                case 'voice':
                case 'video_note':
                case 'sticker':
                    await deleteFile(post.remind.file_id);
                    break;

                case 'media_group':
                    for (const item of post.remind.items) {
                        if (item.file_id) {
                            await deleteFile(item.file_id);
                        }
                    }
                    break;
            }
        }

        await bot.sendMessage(chatId, 'Напоминание отменено', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "⬅️ Вернуться в меню", callback_data: "back" }]
                ]
            }
        });

    } catch (err) {
        console.error('Ошибка при отмене напоминания:', err);
        await bot.sendMessage(chatId, '⚠️ Произошла ошибка при отмене напоминания');
    }
}

async function deleteFile(filePath) {
    try {
        const absolutePath = path.join(__dirname, filePath);
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            console.log(`Файл удалён: ${absolutePath}`);
        }
    } catch (err) {
        console.error(`Ошибка при удалении файла ${filePath}:`, err);
    }
}
export async function save(bot, post, chatId) { 
    
}