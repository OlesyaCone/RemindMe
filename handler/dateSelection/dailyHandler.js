import { answerHandler } from '../dataHandler.js';

export async function handleDaily(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;

  await bot.answerCallbackQuery(callbackQuery.id);
  await dailyInput(bot, chatId);
  setupInputHandler(bot, chatId);
}

async function dailyInput(bot, chatId) {
  await bot.sendMessage(
    chatId,
    'Вы выбрали ежедневное напоминание. Укажите время в формате HH:MM. Например:\n15:00',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬅️Вернуться в меню", callback_data: "back" }]
        ]
      }
    }
  );
  bot.removeTextListener(/.*/);
}

function setupInputHandler(bot, chatId) {
  const handler = async (msg) => {
    if (msg.chat.id !== chatId) return;

    const { valid, error } = checkInput(msg.text);

    if (!valid) {
      await bot.sendMessage(chatId, error);
      return;
    }

    const time = parseInput(msg.text);
    bot.removeTextListener(handler);
    await bot.sendMessage(chatId, `Ежедневное напоминание будет установлено на ${time}`);

    const post = {
      type: 'daily',
      time: time,
      messageId: msg.message_id,
      chatId: chatId
    };

    await answerHandler(bot, post);
  };

  bot.onText(/.*/, handler);
}

function checkInput(text) {
  const trimmed = text.trim();
  const parts = trimmed.split(' ');
  const time = parts.pop();

  const validTime = checkTime(time);

  if (!validTime) {
    return {
      valid: false,
      error: 'Неверный формат. Пример: 15:00\nВремя: ЧЧ:MM (24ч)\n🔄Попробуйте еще раз🔄\n✅Просто отправьте время в правильном формате✅'
    };
  }

  return { valid: true, error: '' };
}

function parseInput(text) {
  const trimmed = text.trim();
  const parts = trimmed.split(' ');
  const time = parts.pop();

  return time;
}

function checkTime(time) {
  const [hours, mins] = time.split(':');
  return (
    hours >= 0 && hours <= 23 &&
    mins >= 0 && mins <= 59
  );
}