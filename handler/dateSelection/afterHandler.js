import { answerHandler } from '../dataHandler.js';
import { updateRemindTime } from '../requests/putReminds.js';

export async function handleAfterTime(bot, callbackQuery, remindId = null) {
  const chatId = callbackQuery.message.chat.id;

  await bot.answerCallbackQuery(callbackQuery.id);
  await afterInput(bot, chatId);
  setupInputHandler(bot, chatId, remindId);
}

async function afterInput(bot, chatId) {
  await bot.sendMessage(
    chatId,
    'Вы выбрали напоминание через время. Укажите минуты или часы. Например:\n0ч 14мин\nИЛИ\n1ч 17мин',
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

    const { valid, error, markup, hour = 0, minute = 0 } = checkInput(msg.text);

    if (!valid) {
      await bot.sendMessage(chatId, error, {
        reply_markup: markup
      });
      return;
    }

    bot.removeListener('text', handler);
    const reminderTime = addTimeToCurrent(hour, minute);
    await bot.sendMessage(chatId, `Напоминание будет через ${hour}ч ${minute}мин`);
    const post = {
      type: 'after',
      time: reminderTime,
      messageId: msg.message_id,
      chatId: chatId,
      put: remindId ? true : false,
      remindId: remindId
    };

    if (post.put) {
      await updateRemindTime(bot, chatId, remindId, reminderTime);
    } else {
      await answerHandler(bot, post);
    }
  };

  bot.on('text', handler);
}

function checkInput(text) {
  if (!text.trim()) {
    return {
      valid: false,
      error: 'Введите время в формате: "30мин 2ч" или "1ч 15мин"\n\n🔄Попробуйте еще раз\n✅Просто отправьте время в правильном формате',
      markup: {
        inline_keyboard: [
          [{ text: "📅 В определенную дату", callback_data: "specific_date" }]
        ]
      }
    };
  }

  const { minute, hours } = parseInput(text);

  if (minute === undefined && hours === undefined) {
    return {
      valid: false,
      error: 'Неверный формат. Укажите минуты (0-59) или часы (0-23). Например:\n0ч 14мин\nИЛИ\n1ч 17мин\n\n🔄Попробуйте еще раз\n✅Просто отправьте время в правильном формате',
      markup: {
        inline_keyboard: [
          [{ text: "📅 В определенную дату", callback_data: "specific_date" }]
        ]
      }
    };
  }

  let hourNum = 0;
  let minuteNum = 0;

  if (minute !== undefined) {
    minuteNum = parseInt(minute);
    if (isNaN(minuteNum) || !checkMin(minuteNum)) {
      return {
        valid: false,
        error: 'Некорректное количество минут. Должно быть от 0 до 59\n\n🔄Попробуйте еще раз\n✅Просто отправьте время в правильном формате',
        markup: {
          inline_keyboard: [
            [{ text: "📅 В определенную дату", callback_data: "specific_date" }]
          ]
        }
      };
    }
  }

  if (hours !== undefined) {
    hourNum = parseInt(hours);
    const [isNegative, isTooLarge] = checkHour(hourNum);
    if (isNegative || isTooLarge) {
      return {
        valid: false,
        error: 'Некорректное количество часов. Должно быть от 0 до 23\n\n🔄Попробуйте еще раз\n✅Просто отправьте время в правильном формате',
        markup: {
          inline_keyboard: [
            [{ text: "📅 В определенную дату", callback_data: "specific_date" }]
          ]
        }
      };
    }
  }

  return {
    valid: true,
    hour: hourNum,
    minute: minuteNum
  };
}

function parseInput(text) {
  const trimmed = text.trim().toLowerCase();
  let minute, hours;

  const minuteMatch = trimmed.match(/(\d+)\s*мин(?:ут)?/);
  if (minuteMatch) minute = minuteMatch[1];

  const hourMatch = trimmed.match(/(\d+)\s*ч(?:ас(?:ов)?)?/);
  if (hourMatch) hours = hourMatch[1];

  return { minute, hours };
}

function checkMin(minute) {
  return minute >= 0 && minute < 60;
}

function checkHour(hours) {
  return [hours < 0, hours >= 24];
}

function addTimeToCurrent(hoursToAdd, minutesToAdd) {
  const now = new Date();
  now.setHours(now.getHours() + hoursToAdd);
  now.setMinutes(now.getMinutes() + minutesToAdd);

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}