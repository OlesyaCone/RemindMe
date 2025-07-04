export async function handleSpecificDate(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;

  await bot.answerCallbackQuery(callbackQuery.id);

  await bot.sendMessage(
    chatId,
    'Вы выбрали напоминание на конкретную дату. Укажите дату и время.Например:\n 01.01.2001 12:00',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬅️Вернуться к списку", callback_data: "back" }]
        ]
      }
    }
  );
}