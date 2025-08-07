import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { CallbackHandler } from './handler/callbackHandler.js';
import { showMainMenu } from './handler/menuUtils.js';

const app = express();
const port = process.env.PORT || 3005;
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const mongoUrl = process.env.MONGO_URL;

export const callbackHandler = new CallbackHandler(bot);

mongoose.connect(mongoUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});