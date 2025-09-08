import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCallbackHandler } from './callbackHandler.js';
import axios from 'axios';
import api from '../config/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filesDir = path.join(__dirname, '../data/files');

export async function confirmAction(bot, post) {
    const chatId = post.chatId;
    await bot.sendMessage(chatId, 'Сохранить это напоминание?', {
        reply_markup: {
            inline_keyboard: [
                [{ text: "💾 Сохранить", callback_data: `save_${post.messageId}` }],
                [{ text: "🚫 Отменить", callback_data: `cancel_${post.messageId}` }]
            ]
        }
    });

    console.log('Подтверждение действия для поста:', post);
    bot.removeTextListener(/.*/);
}

export async function cancel(bot, post, chatId) {
    try {
        if (!post) {
            throw new Error('Пост не передан в cancel()');
        }

        console.log('Отмена напоминания:', post);

        if (post.remind) {
            const callbackHandler = getCallbackHandler();
            const clearStorageFn = callbackHandler.getClearStorage();

            switch (post.remind.type) {
                case 'photo':
                case 'video':
                case 'document':
                case 'voice':
                case 'video_note':
                case 'sticker':
                case 'text':
                    if (post.remind.file_id) {
                        await deleteFile(post.remind.file_id);
                    }
                    await clearStorageFn();
                    break;

                case 'media_group':
                    if (post.remind.items) {
                        for (const item of post.remind.items) {
                            if (item?.file_id) {
                                await deleteFile(item.file_id);
                            }
                        }
                    }
                    await clearStorageFn();
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
        const cleanPath = filePath.replace(/^\.\.\//, '');
        const absolutePath = path.join(filesDir, cleanPath);

        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            console.log(`Файл удалён: ${absolutePath}`);
        }
    } catch (err) {
        console.error(`Ошибка при удалении файла ${filePath}:`, err);
    }
}

export async function save(bot, post, chatId) {
    try {
        if (!post) {
            throw new Error('Пост не передан в save()');
        }

        console.log('Сохранение напоминания:', post);
        console.log('Тип напоминания:', post.remind.type);
        console.log('Содержимое напоминания:', post.remind);

        const response = await api.post('/reminds/create', {
            remind: post.remind
        });

        await bot.sendMessage(chatId, '✅ Напоминание сохранено!', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "⬅️ Вернуться в меню", callback_data: "back" }]
                ]
            }
        });

        console.log('Ответ от сервера:', response.data);

    } catch (err) {
        console.error('Ошибка при сохранении напоминания:', err);
        console.error('Стек ошибки:', err.stack);
        await bot.sendMessage(chatId, '⚠️ Произошла ошибка при сохранении напоминания');
    }
}