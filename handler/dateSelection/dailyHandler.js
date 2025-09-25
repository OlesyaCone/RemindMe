import { answerHandler } from '../dataHandler.js';
import { updateRemindTime } from '../requests/putReminds.js';

export async function handleDaily(bot, callbackQuery, remindId = null) {
  const chatId = callbackQuery.message.chat.id;
  await bot.answerCallbackQuery(callbackQuery.id);
  await dailyInput(bot, chatId);
  setupInputHandler(bot, chatId, remindId);
}

async function dailyInput(bot, chatId) {
  await bot.sendMessage(
    chatId,
    'Вы выбрали ежедневное напоминание. Укажите время в формате HH:MM. Например:\n15:00',
    { reply_markup: { inline_keyboard: [[{ text: "⬅️Вернуться в меню", callback_data: "back" }]] } }
  );
}

function setupInputHandler(bot, chatId, remindId = null) {
  const handler = async (msg) => {
    if (msg.chat.id !== chatId) return;
    const { valid, error } = checkInput(msg.text);
    if (!valid) {
      await bot.sendMessage(chatId, error);
      return;
    }
    const time = parseInput(msg.text);
    bot.removeListener('text', handler);
    await bot.sendMessage(chatId, `Ежедневное напоминание будет установлено на ${time}`);
    const post = {
      type: 'daily',
      time,
      messageId: msg.message_id,
      chatId,
      put: !!remindId,
      remindId
    };
    if (post.put) {
      await updateRemindTime(bot, chatId, remindId, time);
    } else {
      await answerHandler(bot, post);
    }
  };
  bot.on('text', handler);
}

function checkInput(text) {
  const trimmed = text.trim();
  const time = trimmed.split(' ').pop();
  if (!checkTime(time)) {
    return {
      valid: false,
      error: 'Неверный формат. Пример: 15:00\nВремя: ЧЧ:MM (24ч)\n\n🔄Попробуйте еще раз\n✅Просто отправьте время в правильном формате'
    };
  }
  return { valid: true };
}

function parseInput(text) {
  return text.trim().split(' ').pop();
}

function checkTime(time) {
  const [hours, mins] = time.split(':');
  const h = Number(hours), m = Number(mins);
  return Number.isInteger(h) && Number.isInteger(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59;
}