import { handleDaily } from './dateSelection/dailyHandler.js';
import { handleSpecificDate } from './dateSelection/specificHandler.js';
import { handleWeekly } from './dateSelection/weeklyHandler.js';
import { handleAfterTime } from './dateSelection/afterHandler.js';
import { handleMyReminders } from './remindersHandler.js';
import { showMainMenu } from './menuUtils.js';
import { cancel, save } from './confirmAction.js';
import { putReminds } from './requests/putReminds.js';

export class CallbackHandler {
  constructor(bot) {
    if (CallbackHandler.instance) {
      return CallbackHandler.instance;
    }
    CallbackHandler.instance = this;
    this.bot = bot;
    this.postsStorage = new Map();
    this.clearStorage();
    this.setupCallbacks();
  }

  getClearStorage() {
    return this.clearStorage.bind(this);
  }

  async clearStorage() {
    this.postsStorage.clear();
    console.log('Хранилище напоминаний очищено');
  }

  async deleteMessage(chatId, messageId) {
    try {
      await this.bot.deleteMessage(chatId, messageId);
      console.log(`Сообщение ${messageId} удалено`);
    } catch (err) {
      console.warn(`Не удалось удалить сообщение ${messageId}:`, err.message);
    }
  }

  setupCallbacks() {
    if (!this.callbacksSetUp) {
      this.bot.on('callback_query', async (callbackQuery) => {
        const data = callbackQuery.data;
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;

        console.log(`Обработка callback: ${data}, messageId: ${messageId}`);

        try {
          if (data.startsWith('save_') || data.startsWith('cancel_')) {
            const postId = String(data.split('_')[1]);
            console.log(`Ищем пост с ID: ${postId}`);
            console.log(`Текущее содержимое хранилища:`, Array.from(this.postsStorage.keys()));

            const post = this.postsStorage.get(postId);

            if (!post) {
              console.log('Пост не найден в хранилище');
              await this.bot.answerCallbackQuery(callbackQuery.id, { text: 'Напоминание не найдено' });
              await this.bot.sendMessage(chatId, 'Ошибка: напоминание не найдено или устарело', {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: "⬅️ Вернуться в меню", callback_data: "back" }]
                  ]
                }
              });
              await this.deleteMessage(chatId, messageId);
              return;
            }

            console.log('Пост найден:', post);

            try {
              if (data.startsWith('save_')) {
                console.log('Обрабатываем сохранение...');
                await save(this.bot, post, chatId);
                await this.bot.answerCallbackQuery(callbackQuery.id, { text: 'Напоминание сохранено' });
              } else {
                console.log('Обрабатываем отмену...');
                await cancel(this.bot, post, chatId);
                await this.bot.answerCallbackQuery(callbackQuery.id, { text: 'Напоминание отменено' });
              }
            } catch (error) {
              console.error('Ошибка при обработке действия:', error);
              await this.bot.answerCallbackQuery(callbackQuery.id, { text: 'Произошла ошибка' });
              throw error;
            }

            this.postsStorage.delete(postId);
            console.log('Пост удален из хранилища');

            await this.deleteMessage(chatId, messageId);
            return;
          }

          await this.deleteMessage(chatId, messageId);

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
            case 'put':
              await putReminds(this.bot, chatId);
              break;
            case 'back':
              await showMainMenu(this.bot, chatId);
              break;
            
            case String(data.match(/put_(\w+)/)?.input || ''):
              const remindId = data.split('_')[1];
              await this.bot.sendMessage(chatId, 'Что изменяем?', {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: '🕰 Изменить время', callback_data: `change_time_${remindId}` }],
                    [{ text: '📝 Изменить напоминание', callback_data: `change_content_${remindId}` }],
                    [{ text: '⬅️ Назад', callback_data: 'back_to_reminds' }]
                  ]
                }
              });
              break;

            case String(data.match(/change_time_(\w+)/)?.input || ''):
              const timeRemindId = data.split('_')[2];
              const { handleDaily } = await import('./dateSelection/dailyHandler.js');
              await handleDaily(this.bot, callbackQuery, timeRemindId);
              break;

            case String(data.match(/change_content_(\w+)/)?.input || ''):
              const contentRemindId = data.split('_')[2];
              const post = {
                type: 'put_content',
                remindId: contentRemindId,
                chatId: chatId,
                messageId: Date.now(),
                put: true
              };
              const { answerHandler } = await import('./dataHandler.js');
              await answerHandler(this.bot, post);
              break;

            case 'back_to_reminds':
              await putReminds(this.bot, chatId);
              break;

            default:
              await this.bot.sendMessage(chatId, 'Неизвестная команда');
          }

          await this.bot.answerCallbackQuery(callbackQuery.id);
        } catch (err) {
          console.error('Ошибка обработки callback:', err);
          try {
            await this.bot.answerCallbackQuery(callbackQuery.id, { text: 'Ошибка обработки' });
          } catch (answerError) {
            console.error('Не удалось ответить на callback:', answerError);
          }
        }
      });
      this.callbacksSetUp = true;
    }
  }

  storePost(post) {
    this.postsStorage.set(String(post.messageId), post);
    console.log(`Пост сохранён в хранилище: ${post.messageId}`);
    console.log('Текущее содержимое хранилища:', Array.from(this.postsStorage.keys()));
  }
}

let callbackHandlerInstance = null;

export function initCallbackHandler(bot) {
  callbackHandlerInstance = new CallbackHandler(bot);
  return callbackHandlerInstance;
}

export function getCallbackHandler() {
  if (!callbackHandlerInstance) {
    throw new Error("CallbackHandler не инициализирован!");
  }
  return callbackHandlerInstance;
}