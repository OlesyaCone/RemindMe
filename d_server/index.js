import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';
import express from 'express';
import cors from 'cors'; 
import { initCallbackHandler } from './handler/callbackHandler.js';
import { showMainMenu } from './handler/menuUtils.js';
import router from './server/routes.js';
import UserController from './server/controllers/userController.js'; 

const app = express();
const port = process.env.PORT || 3000; 
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

app.use(cors({
  origin: ['http://10.7.0.190:5173/'],
  credentials: true
}));

app.use(express.json());
app.use('/api', router);

initCallbackHandler(bot);
UserController.setBot(bot); 

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

app.listen(port, '0.0.0.0', () => {  
    console.log(`Server running on port ${port}`);
});

setInterval(() => {
  console.log('Server alive');
}, 1800000);
