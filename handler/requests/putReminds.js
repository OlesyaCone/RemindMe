import remindsStorage from './remindsStorage.js';
import api from '../../config/api.js';

export async function putReminds(bot, chatId) {
    const reminds = remindsStorage.getReminds(chatId);

    if (!reminds || reminds.length === 0) {
        await bot.sendMessage(chatId, '📭 У вас нет напоминаний');
        return;
    }

    const inline_keyboard = [];

    for (let i = 0; i < reminds.length; i++) {
        const item = reminds[i];
        const remindObj = item.remind || item;

        const rawId = item._id || remindObj._id || item.id || remindObj.id;
        const id = rawId && rawId.toString ? rawId.toString() : null;

        if (!id) {
            console.warn(`Напоминание без корректного id (index ${i}):`, item);
            inline_keyboard.push([{
                text: `${i + 1} ⚠️`,
                callback_data: `put_missing_${i}`
            }]);
            continue;
        }

        inline_keyboard.push([{
            text: String(i + 1),
            callback_data: `put_${id}`
        }]);
    }

    inline_keyboard.push([{ text: '⬅️Вернуться в меню', callback_data: 'back' }]);

    await bot.sendMessage(
        chatId,
        '📋 Выберите напоминание для изменения:',
        { reply_markup: { inline_keyboard } }
    );
}

export async function updateRemindContent(bot, chatId, remindId, newContent) {
    try {
        await api.put(`/reminds/${remindId}`, { 
            content: newContent 
        });
        await bot.sendMessage(chatId, '✅ Содержание напоминания обновлено!');
    } catch (error) {
        console.error('Ошибка обновления содержания:', error);
        await bot.sendMessage(chatId, '❌ Ошибка обновления содержания');
    }
}

export async function updateRemindTime(bot, chatId, remindId, newTime, type = 'daily') {
    try {
        await api.put(`/reminds/${remindId}`, { 
            remind: {
                type: type,
                time: newTime
            }
        });
        await bot.sendMessage(chatId, '✅ Время напоминания обновлено!');
    } catch (error) {
        console.error('Ошибка обновления времени:', error);
        await bot.sendMessage(chatId, '❌ Ошибка обновления времени');
    }
}