export async function showMainMenu(bot, chatId) {
  await bot.sendMessage(chatId, 'Выберите тип напоминания:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: "⏰ Ежедневно", callback_data: "daily" }],
        [{ text: "📅 В определенную дату", callback_data: "specific_date" }],
        [{ text: "🔄 По дням недели", callback_data: "weekly" }],
        [{ text: "⏱️ Через несколько минут/часов", callback_data: "after_time" }],
        [{ text: "📝 Мои напоминания", callback_data: "my_reminders" }],
        [{ 
          text: "📱 Открыть веб-приложение", 
          web_app: { url: "https://remind-me-ot-menya.netlify.app/" } 
        }]
      ]
    },
    parse_mode: 'Markdown'
  });
}
