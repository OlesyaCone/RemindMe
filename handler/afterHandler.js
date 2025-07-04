export async function handleAfterTime(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;

  await bot.answerCallbackQuery(callbackQuery.id);

  await bot.sendMessage(
    chatId,
    'Вы выбрали напоминание через время. Пожалуйста, укажите:',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Часы", callback_data: "h" }, { text: "Минуты", callback_data: "m" }],
          [{ text: "⬅️Вернуться к списку", callback_data: "back" }]
        ]
      }
    }
  );
}