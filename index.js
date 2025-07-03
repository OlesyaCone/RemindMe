import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendSticker(chatId, 'CAACAgIAAxkBAAMiaGVOMjWTtSFY_38we1Lz1o65bfIAAjQBAAJSiZEjE83Xb_UcB1g2BA');
  await bot.sendMessage(chatId, '[Инструкция](https://telegra.ph/RemindMe-07-02)', {
    parse_mode: 'MarkdownV2'
  });

  await bot.sendMessage(chatId, 'Выберите тип напоминания:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: "⏰ Ежедневно", callback_data: "daily" }],
        [{ text: "📅 В определенную дату", callback_data: "specific_date" }],
        [{ text: "🔄 По дням недели", callback_data: "weekly" }],
        [{ text: "🕒 Через несколько минут/часов", callback_data: "after_time" }],
        [{ text: "📝 Мои напоминания", callback_data: "my_reminders" }]
      ]
    },
    parse_mode: 'Markdown'
  });
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '[Инструкция](https://telegra.ph/RemindMe-07-02)', {
    parse_mode: 'MarkdownV2',
  });
});

bot.onText(/\/remind/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '');
});