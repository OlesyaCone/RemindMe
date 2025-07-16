export async function handleWeekly(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;

  await bot.answerCallbackQuery(callbackQuery.id);
  await weeklyInput(bot, chatId);
  setupInputHandler(bot, chatId);
}

async function weeklyInput(bot, chatId) {
  await bot.sendMessage(
    chatId,
    'Вы выбрали еженедельное напоминание. Укажите дни недели и время. Например: \nпн, вт 15:00\nвс 02:00',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬅️Вернуться к списку", callback_data: "back" }]
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

    const { days, time } = parseInput(msg.text);
    bot.removeTextListener(handler);
    await bot.sendMessage(chatId, `Напоминание установлено на: ${days.join(', ')} ${time}`);
  };

  bot.onText(/.*/, handler);
}

function checkInput(text) {
  const trimmed = text.trim();
  const parts = trimmed.split(' ');
  const time = parts.pop();
  const days = parts.join(' ');

  const validTime = checkTime(time);
  const validDays = checkDays(days);

  if (!validTime || !validDays) {
    return {
      valid: false,
      error: 'Неверный формат. Пример: пн, ср, пт 15:00\nДоступные дни: пн, вт, ср, чт, пт, сб, вс\nВремя: ЧЧ:MM (24ч)'
    };
  }

  return { valid: true, error: '' };
}

function parseInput(text) {
  const trimmed = text.trim();
  const parts = trimmed.split(' ');
  const time = parts.pop();
  const days = parts.join(' ').split(',').map(day => day.trim());
  
  return { days, time };
}

function checkTime(time) {
  const [hours, mins] = time.split(':');
  return (
    hours >= 0 && hours <= 23 &&
    mins >= 0 && mins <= 59
  );
}

function checkDays(days) {
  const week = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
  const inputDays = days.split(',').map(day => day.trim());
  return inputDays.every(day => week.includes(day));
}