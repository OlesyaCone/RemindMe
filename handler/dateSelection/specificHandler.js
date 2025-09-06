import { answerHandler } from '../dataHandler.js';

export async function handleSpecificDate(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;

  await bot.answerCallbackQuery(callbackQuery.id);
  await specificInput(bot, chatId);
  setupInputHandler(bot, chatId);
}

async function specificInput(bot, chatId) {
  await bot.sendMessage(
    chatId,
    'Вы выбрали напоминание на конкретную дату. Укажите дату и время. Например:\n01.01.2001 12:00',
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

    const { date, time } = parseInput(msg.text);
    bot.removeTextListener(handler);
    await bot.sendMessage(chatId, `Напоминание будет установлено на: ${date} ${time}`);
    const post = {
      type: 'specific',
      date: date,
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

  if (parts.length !== 2) {
    return {
      valid: false,
      error: 'Неверный формат. Пример: 01.01.2001 12:00\nДата: ДД.ММ.ГГГГ\nВремя: ЧЧ:MM (24ч)\n\n🔄Попробуйте еще раз\n✅Просто отправьте время в правильном формате'
    };
  }

  const [date, time] = parts;
  const validDate = checkDate(date);
  const validTime = checkTime(time);

  if (!validDate || !validTime) {
    return {
      valid: false,
      error: 'Неверный формат. Пример: 01.01.2001 12:00\nДата: ДД.ММ.ГГГГ\nВремя: ЧЧ:MM (24ч)\n\n🔄Попробуйте еще раз\n✅Просто отправьте время в правильном формате'
    };
  }

  return { valid: true, error: '' };
}

function parseInput(text) {
  const trimmed = text.trim();
  const [date, time] = trimmed.split(' ');
  return { date, time };
}

function checkTime(time) {
  const [hours, mins] = time.split(':');
  return (
    hours >= 0 && hours <= 23 &&
    mins >= 0 && mins <= 59
  );
}

function checkDate(date) {
  const [day, month, year] = date.split('.').map(Number);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1000 || year > 9999) return false;

  if ([4, 6, 9, 11].includes(month) && day > 30) return false;

  if (month === 2) {
    const isLeap = (year % 400 === 0) || (year % 100 !== 0 && year % 4 === 0);
    if (day > (isLeap ? 29 : 28)) return false;
  }

  return true;
}