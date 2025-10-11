import { getReminds } from "./requests/getReminds.js";
import {putReminds} from "./requests/putReminds.js";
import {deleteReminds} from "./requests/deleteReminds.js"

export async function handleMyReminders(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;

  await bot.answerCallbackQuery(callbackQuery.id);

  await bot.sendMessage(
    chatId,
    '⏳ Загружаю ваши напоминания...'
  );

  await getReminds(bot, chatId);

  await bot.sendMessage(
    chatId,
    'Что вы хотите сделать?',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📝Изменить напоминание', callback_data: 'put' }],
          [{ text: '🗑Удалить напоминание', callback_data: 'delete' }],
          [{ text: '⬅️Вернуться в меню', callback_data: 'back' }]
        ]
      }
    }
  );
}

export async function putReminders(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;

  await bot.answerCallbackQuery(callbackQuery.id);

  await bot.sendMessage(
    chatId,
    'Выбран режим изменения напоминаний📝'
  );

  await putReminds(bot, chatId);
}

export async function deleteReminders(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;

  await bot.answerCallbackQuery(callbackQuery.id);

  await bot.sendMessage(
    chatId,
    'Выбран режим удаления напоминаний📝'
  );

  await deleteReminds(bot, chatId);
}