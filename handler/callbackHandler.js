import { handleDaily } from './dateSelection/dailyHandler.js';
import { handleSpecificDate } from './dateSelection/specificHandler.js';
import { handleWeekly } from './dateSelection/weeklyHandler.js';
import { handleAfterTime } from './dateSelection/afterHandler.js';
import { handleMyReminders } from './remindersHandler.js';
import { showMainMenu } from './menuUtils.js';
import { cancel, save } from './confirmAction.js';
import { putReminds } from './requests/putReminds.js';
import { answerHandler } from './dataHandler.js';
import { deleteReminds } from './requests/deleteReminds.js';
import remindsStorage from './requests/remindsStorage.js';
import api from '../config/api.js';

export class CallbackHandler {
  constructor(bot) {
    if (CallbackHandler.instance) return CallbackHandler.instance;
    CallbackHandler.instance = this;
    this.bot = bot;
    this.postsStorage = new Map();
    this.clearStorage();
    this.setupCallbacks();
  }

  getClearStorage() { return this.clearStorage.bind(this); }

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
    if (this.callbacksSetUp) return;
    this.bot.on('callback_query', async (callbackQuery) => {
      const data = callbackQuery.data;
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;
      console.log(`Обработка callback: ${data}, messageId: ${messageId}`);

      try {
        if (data.startsWith('save_') || data.startsWith('cancel_')) {
          const postId = String(data.split('_')[1]);
          const post = this.postsStorage.get(postId);

          if (!post) {
            console.log('Пост не найден в хранилище:', postId);
            await this.bot.answerCallbackQuery(callbackQuery.id, { text: 'Напоминание не найдено' });
            await this.bot.sendMessage(chatId, 'Ошибка: напоминание не найдено или устарело', {
              reply_markup: { inline_keyboard: [[{ text: "⬅️ Вернуться в меню", callback_data: "back" }]] }
            });
            await this.deleteMessage(chatId, messageId);
            return;
          }

          if (data.startsWith('save_')) {
            await save(this.bot, post, chatId);
            await this.bot.answerCallbackQuery(callbackQuery.id, { text: 'Напоминание сохранено' });
          } else {
            await cancel(this.bot, post, chatId);
            await this.bot.answerCallbackQuery(callbackQuery.id, { text: 'Напоминание отменено' });
          }

          this.postsStorage.delete(postId);
          await this.deleteMessage(chatId, messageId);
          return;
        }

        await this.deleteMessage(chatId, messageId);

        switch (true) {
          case data === 'daily':
            await handleDaily(this.bot, callbackQuery);
            break;

          case data === 'specific_date':
            await handleSpecificDate(this.bot, callbackQuery);
            break;

          case data === 'weekly':
            await handleWeekly(this.bot, callbackQuery);
            break;

          case data === 'after_time':
            await handleAfterTime(this.bot, callbackQuery);
            break;

          case data === 'my_reminders':
            await handleMyReminders(this.bot, callbackQuery);
            break;

          case data === 'put':
            await putReminds(this.bot, chatId);
            break;

          case data === 'delete':
            await deleteReminds(this.bot, chatId);
            break;

          case data === 'back':
            await showMainMenu(this.bot, chatId);
            break;

          case data === 'cancel_delete':
          case data === 'cancel_put':
            await showMainMenu(this.bot, chatId);
            break;

          case /^delete_(.+)$/.test(data): {
            const remindId = data.match(/^delete_(.+)$/)[1];
            if (!remindId || remindId === 'undefined') {
              console.warn('Попытка удалить напоминание без id:', data);
              await this.bot.sendMessage(chatId, '❗ Невозможно удалить это напоминание — отсутствует идентификатор.');
              break;
            }
            
            try {
              await this.bot.answerCallbackQuery(callbackQuery.id, {
                text: 'Удаляем напоминание...'
              });

              const response = await api.delete(`/reminds/${remindId}`);
              
              if (response.status === 200) {
                const reminds = remindsStorage.getReminds(chatId);
                const updatedReminds = reminds.filter(remind => {
                  const id = remind._id || remind.id;
                  return id && id.toString() !== remindId;
                });
                remindsStorage.setReminds(chatId, updatedReminds);

                await this.bot.sendMessage(
                  chatId,
                  '✅ Напоминание успешно удалено!'
                );
              } else {
                throw new Error('Ошибка при удалении');
              }
            } catch (error) {
              console.error('Ошибка при удалении напоминания:', error);
              await this.bot.sendMessage(
                chatId,
                '❌ Произошла ошибка при удалении напоминания. Попробуйте снова.'
              );
            }
            break;
          }

          case /^put_(.+)$/.test(data): {
            const remindId = data.match(/^put_(.+)$/)[1];
            if (!remindId || remindId === 'undefined') {
              console.warn('Попытка изменить напоминание без id:', data);
              await this.bot.sendMessage(chatId, '❗ Невозможно изменить это напоминание — отсутствует идентификатор.');
              break;
            }

            await this.bot.sendMessage(
              chatId,
              'Что вы хотите изменить?',
              {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: '📝 Изменить содержание', callback_data: `change_content_${remindId}` }],
                    [{ text: '🕰 Изменить время', callback_data: `change_time_${remindId}` }],
                    [{ text: '❌ Отмена', callback_data: 'cancel_put' }]
                  ]
                }
              }
            );
            break;
          }

          case /^change_time_(.+)$/.test(data): {
            const remindId = data.match(/^change_time_(.+)$/)[1];
            if (!remindId) {
              await this.bot.sendMessage(chatId, '❗ Невозможно изменить время — отсутствует идентификатор.');
              break;
            }

            await this.bot.sendMessage(
              chatId,
              'Выберите тип напоминания:',
              {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: "⏰ Ежедневно", callback_data: `put_daily_${remindId}` }],
                    [{ text: "📅 В определенную дату", callback_data: `put_specific_${remindId}` }],
                    [{ text: "🔄 По дням недели", callback_data: `put_weekly_${remindId}` }],
                    [{ text: "⏱️ Через несколько минут/часов", callback_data: `put_after_${remindId}` }]
                  ]
                }
              }
            );
            break;
          }

          case /^change_content_(.+)$/.test(data): {
            const remindId = data.match(/^change_content_(.+)$/)[1];
            if (!remindId) {
              await this.bot.sendMessage(chatId, '❗ Невозможно изменить содержание — отсутствует идентификатор.');
              break;
            }

            const post = {
              type: 'put_content',
              remindId: remindId,
              chatId: chatId,
              messageId: Date.now(),
              put: true
            };
            await answerHandler(this.bot, post);
            break;
          }

          case /^put_daily_(.+)$/.test(data):
            await handleDaily(this.bot, callbackQuery, data.match(/^put_daily_(.+)$/)[1]);
            break;

          case /^put_specific_(.+)$/.test(data):
            await handleSpecificDate(this.bot, callbackQuery, data.match(/^put_specific_(.+)$/)[1]);
            break;

          case /^put_weekly_(.+)$/.test(data):
            await handleWeekly(this.bot, callbackQuery, data.match(/^put_weekly_(.+)$/)[1]);
            break;

          case /^put_after_(.+)$/.test(data):
            await handleAfterTime(this.bot, callbackQuery, data.match(/^put_after_(.+)$/)[1]);
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

  storePost(post) {
    if (!post || !post.messageId) {
      console.warn('Попытка сохранить некорректный пост:', post);
      return;
    }
    const key = String(post.messageId);

    if (this.postsStorage.has(key)) {
      console.log(`Пост ${key} уже есть в хранилище, повторное сохранение пропущено`);
      return;
    }

    this.postsStorage.set(key, post);
    console.log(`Пост сохранён в хранилище: ${key}`);
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