export async function handleMyReminders(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;

  await bot.answerCallbackQuery(callbackQuery.id);

  await bot.sendMessage(
    chatId,
    'Вот список ваших напоминаний:',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬅️Вернуться к списку", callback_data: "back" }]
        ]
      }
    }
  );
}