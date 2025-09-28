import remindsStorage from './remindsStorage.js';
import api from '../../config/api.js';

export async function deleteReminds(bot, chatId) {
    try {
        const response = await api.get('/reminds', { params: { chatId } });
        const reminds = response.data;
        remindsStorage.setReminds(chatId, reminds);

        if (!reminds || reminds.length === 0) {
            await bot.sendMessage(
                chatId,
                '📭 У вас нет активных напоминаний для удаления.'
            );
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
                    callback_data: `delete_missing_${i}`
                }]);
                continue;
            }
            
            inline_keyboard.push([{
                text: `${i + 1}`,
                callback_data: `delete_${id}`
            }]);
        }

        inline_keyboard.push([{ text: '❌ Отмена', callback_data: 'cancel_delete' }]);

        await bot.sendMessage(
            chatId,
            '🗑 Выберите напоминание для удаления:',
            { 
                reply_markup: { 
                    inline_keyboard 
                } 
            }
        );
    } catch (error) {
        console.error('Ошибка загрузки напоминаний для удаления:', error);
        await bot.sendMessage(
            chatId,
            '❌ Ошибка загрузки напоминаний'
        );
    }
}