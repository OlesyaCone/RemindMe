import { handleDaily } from './dailyHandler.js';
import { handleSpecificDate } from './specificHandler.js';
import { handleWeekly } from './weeklyHandler.js';
import { handleAfterTime } from './afterHandler.js';
import { handleMyReminders } from './remindersHandler.js';
import { showMainMenu } from './menuUtils.js';

export class CallbackHandler {
  constructor(bot) {
    this.bot = bot;
    this.setupCallbacks();
  }

  setupCallbacks() {
    this.bot.on('callback_query', async (callbackQuery) => {
      const data = callbackQuery.data;
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;

      try {
        await this.bot.deleteMessage(chatId, messageId)

        switch (data) {
          case 'daily':
            await handleDaily(this.bot, callbackQuery);
            break;
          case 'specific_date':
            await handleSpecificDate(this.bot, callbackQuery);
            break;
          case 'weekly':
            await handleWeekly(this.bot, callbackQuery);
            break;
          case 'after_time':
            await handleAfterTime(this.bot, callbackQuery);
            break;
          case 'my_reminders':
            await handleMyReminders(this.bot, callbackQuery);
            break;
          case 'back':
            await showMainMenu(this.bot, chatId);
            break;
          default:
            await this.bot.sendMessage(chatId, 'Неизвестная команда');
        }

        await this.bot.answerCallbackQuery(callbackQuery.id);
      } catch (error) {
        console.error('Error handling callback:', error);
        await this.bot.sendMessage(chatId, 'Произошла ошибка при обработке запроса')
          .catch(e => console.error('Не удалось отправить сообщение об ошибке:', e));
      }
    });
  }
}