export async function handleAfterTime(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;

  await bot.answerCallbackQuery(callbackQuery.id);
  await afterInput(bot, chatId);
  setupInputHandler(bot, chatId);
}

async function afterInput(bot, chatId) {
  await bot.sendMessage(
    chatId,
    'Вы выбрали напоминание через время. Укажите минуты или часы. Например:\n14мин\nИЛИ\n1ч 17мин',
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

    const { hour, minute } = parseInput(msg.text);
    bot.removeTextListener(handler);
    await bot.sendMessage(chatId, `Напоминание будет через: ${hour}ч ${minute}мин`);
  };

  bot.onText(/.*/, handler);
}

function checkInput(text) {
  const trimmed = text.trim();
  
  if (/^\d+мин$/.test(trimmed)) {
    const minutes = parseInt(trimmed);
    if (minutes >= 0 && minutes <= 59) {
      return { valid: true, error: '' };
    }
    return {
      valid: false,
      error: 'Минуты должны быть от 0 до 59'
    };
  }
  
  if (/^\d+ч \d+мин$/.test(trimmed)) {
    const [hoursPart, minsPart] = trimmed.split(' ');
    const hours = parseInt(hoursPart);
    const minutes = parseInt(minsPart);
    
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return { valid: true, error: '' };
    }
    
    if (hours > 23) {
      return {
        valid: false,
        error: 'Часы должны быть от 0 до 23. Для большего интервала выберите точную дату.'
      };
    }
    
    return {
      valid: false,
      error: 'Минуты должны быть от 0 до 59'
    };
  }

  return {
    valid: false,
    error: 'Неверный формат. Примеры:\n14мин\nИЛИ\n1ч 17мин'
  };
}

function parseInput(text) {
  const trimmed = text.trim();
  
  if (/^\d+мин$/.test(trimmed)) {
    return {
      hour: 0,
      minute: parseInt(trimmed)
    };
  }
  
  if (/^\d+ч \d+мин$/.test(trimmed)) {
    const [hoursPart, minsPart] = trimmed.split(' ');
    return {
      hour: parseInt(hoursPart),
      minute: parseInt(minsPart)
    };
  }
  
  return { hour: 0, minute: 0 };
}

function checkHour(hour) {
  return hour >= 0 && hour <= 23;
}

function checkMinute(minute) {
  return minute >= 0 && minute <= 59;
}