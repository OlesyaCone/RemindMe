import { handleDaily } from './dateSelection/dailyHandler.js';
import { handleSpecificDate } from './dateSelection/specificHandler.js';
import { handleWeekly } from './dateSelection/weeklyHandler.js';
import { handleAfterTime } from './dateSelection/afterHandler.js';
import { handleMyReminders } from './remindersHandler.js';
import { showMainMenu } from './menuUtils.js';
import { cancel, save } from './confirmAction.js';

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
          await this.deleteMessage(chatId, messageId);

          if (data.startsWith('save_') || data.startsWith('cancel_')) {
            const postId = data.split('_')[1];
            const post = this.postsStorage.get(postId);

            if (!post) {
              await this.bot.sendMessage(chatId, 'Ошибка: напоминание не найдено или устарело', {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: "⬅️ Вернуться в меню", callback_data: "back" }]
                  ]
                }
              });
              return;
            }

            if (data.startsWith('save_')) {
              await save(this.bot, post, chatId);
            } else {
              await cancel(this.bot, post, chatId);
            }

            this.postsStorage.delete(postId); 
            return;
          }

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
        } catch (err) {
          console.error('Ошибка обработки callback:', err);
        }
      });
      this.callbacksSetUp = true;
    }
  }

  storePost(post) {
    this.postsStorage.set(post.messageId, post);
    console.log(`Пост сохранён в хранилище: ${post.messageId}`);
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