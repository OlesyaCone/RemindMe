import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';
import { CallbackHandler } from './handler/callbackHandler.js';
import { showMainMenu } from './handler/menuUtils.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

new CallbackHandler(bot);

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendSticker(chatId, 'CAACAgIAAxkBAAMiaGVOMjWTtSFY_38we1Lz1o65bfIAAjQBAAJSiZEjE83Xb_UcB1g2BA');
  await bot.sendMessage(chatId, '[Инструкция](https://telegra.ph/RemindMe-07-02)', {
    parse_mode: 'MarkdownV2'
  });
  await showMainMenu(bot, chatId);
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(
    chatId,
    '[Инструкция](https://telegra.ph/RemindMe-07-02)',
    {
      parse_mode: 'MarkdownV2',
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬅️ Добавить напоминание", callback_data: "back" }]
        ]
      }
    }
  );

});

bot.onText(/\/remind/, async (msg) => {
  const chatId = msg.chat.id;
  await showMainMenu(bot, chatId);
});