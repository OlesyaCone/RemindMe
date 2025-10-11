import remindsStorage from './remindsStorage.js';
import api from '../../config/api.js';

export async function putReminds(bot, chatId) {
    try {
        const response = await api.get('/reminds', { params: { chatId } });
        const reminds = response.data;
        remindsStorage.setReminds(chatId, reminds);

        if (!reminds || reminds.length === 0) {
            await bot.sendMessage(
                chatId,
                '📭 У вас нет напоминаний для изменения.'
            );
            return;
        }

        const inline_keyboard = [];

        for (let i = 0; i < reminds.length; i++) {
            const item = reminds[i];
            const remindObj = item.remind || item;

            const rawId = item._id || remindObj._id || item.id || remindObj.id;
            const id = rawId && rawId.toString ? rawId.toString() : null;
            
            inline_keyboard.push([{
                text: `${i + 1}`,
                callback_data: `put_${id}`
            }]);
        }

        await bot.sendMessage(
            chatId,
            '📝 Выберите напоминание для изменения:',
            { 
                reply_markup: { 
                    inline_keyboard 
                } 
            }
        );
    } catch (error) {
        console.error('Ошибка загрузки напоминаний для изменения:', error);
        await bot.sendMessage(
            chatId,
            '❌ Ошибка загрузки напоминаний'
        );
    }
}