export async function handleWeekly(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;

  await bot.answerCallbackQuery(callbackQuery.id);

  await bot.sendMessage(
    chatId,
    'Вы выбрали еженедельное напоминание. Укажите дни недели и время. Например: \n пн 15:00 \n вс 02:00',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬅️Вернуться к списку", callback_data: "back" }]
        ]
      }
    }
  );

}