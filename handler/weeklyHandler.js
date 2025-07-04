export async function handleWeekly(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;

  await bot.answerCallbackQuery(callbackQuery.id);

  await bot.sendMessage(
    chatId,
    'Вы выбрали еженедельное напоминание. Укажите сколько раз в неделю',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Один", callback_data: "one" }, { text: "Несколько", callback_data: "several" },],
          [{ text: "⬅️Вернуться к списку", callback_data: "back" }]
        ]
      }
    }
  );
}