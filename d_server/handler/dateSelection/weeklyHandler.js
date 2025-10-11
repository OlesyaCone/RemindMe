import { answerHandler } from '../dataHandler.js';
import api from '../../config/api.js';

export async function handleWeekly(bot, callbackQuery, remindId = null) {
  const chatId = callbackQuery.message.chat.id;

  await bot.answerCallbackQuery(callbackQuery.id);
  await weeklyInput(bot, chatId);
  setupInputHandler(bot, chatId, remindId);
}

async function weeklyInput(bot, chatId) {
  await bot.sendMessage(
    chatId,
    'Вы выбрали еженедельное напоминание. Укажите дни недели и время. Например: \nпн, вт 15:00\nвс 02:00',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬅️Вернуться в меню", callback_data: "back" }]
        ]
      }
    }
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

    const { days, time } = parseInput(msg.text);
    bot.removeListener('text', handler);
    await bot.sendMessage(chatId, `Напоминание будет установлено на ${days.join(', ')} ${time}`);
    
    if (remindId) {
      try {
        await api.put(`/reminds/${remindId}`, {
          remind: {
            type: 'weekly',
            time: time,
            days: days
          }
        });
        await bot.sendMessage(chatId, '✅ Время напоминания обновлено!');
      } catch (error) {
        console.error('Ошибка обновления времени:', error);
        await bot.sendMessage(chatId, '❌ Ошибка обновления времени');
      }
    } else {
      const post = {
        type: 'weekly',
        time: time,
        chatId: chatId,
        messageId: msg.message_id,
        days: days,
        put: false,
        remindId: null
      };
      await answerHandler(bot, post);
    }
  };

  bot.on('text', handler);
}

function checkInput(text) {
  const trimmed = text.trim();
  const parts = trimmed.split(' ');
  
  if (parts.length < 2) {
    return {
      valid: false,
      error: 'Неверный формат. Пример: пн, ср, пт 15:00\nДоступные дни: пн, вт, ср, чт, пт, сб, вс\nВремя: ЧЧ:MM (24ч)\n\n🔄Попробуйте еще раз\n✅Просто отправьте время в правильном формате'
    };
  }

  const time = parts.pop();
  const days = parts.join(' ');

  const validTime = checkTime(time);
  const validDays = checkDays(days);

  if (!validTime || !validDays) {
    return {
      valid: false,
      error: 'Неверный формат. Пример: пн, ср, пт 15:00\nДоступные дни: пн, вт, ср, чт, пт, сб, вс\nВремя: ЧЧ:MM (24ч)\n\n🔄Попробуйте еще раз\n✅Просто отправьте время в правильном формате'
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
  const h = Number(hours), m = Number(mins);
  return Number.isInteger(h) && Number.isInteger(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

function checkDays(days) {
  const week = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
  const inputDays = days.split(',').map(day => day.trim());
  
  if (inputDays.length === 0 || inputDays.some(day => day === '')) {
    return false;
  }
  
  return inputDays.every(day => week.includes(day));
}