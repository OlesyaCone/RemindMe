import fs from 'fs';
import path from 'path';
import api from '../../config/api.js';  

const filesDir = path.resolve(process.cwd(), 'data/files');

export async function getReminds(bot, chatId) {
  try {
    const response = await api.get('/reminds', { params: { chatId } });
    const reminds = response.data;

    if (!reminds || reminds.length === 0) {
      await bot.sendMessage(chatId, '📭 Нет напоминаний');
      return;
    }

    for (const item of reminds) {
      const remind = item.remind || item;

      if (!remind || !remind.type) {
        await bot.sendMessage(chatId, '❌ Некорректное напоминание');
        continue;
      }

      const filePath = remind.file_id
        ? path.join(filesDir, remind.file_id)
        : null;

      switch (remind.type) {
        case 'text':
          await bot.sendMessage(chatId, ` ${remind.content}`);
          break;

        case 'photo':
          await bot.sendPhoto(chatId, fs.createReadStream(filePath), { caption: remind.caption || '' });
          break;

        case 'video':
          await bot.sendVideo(chatId, fs.createReadStream(filePath), { caption: remind.caption || '' });
          break;

        case 'video_note':
          await bot.sendVideoNote(chatId, fs.createReadStream(filePath));
          break;

        case 'document':
          await bot.sendDocument(chatId, fs.createReadStream(filePath), {
            caption: remind.caption || '',
            filename: remind.file_name || undefined
          });
          break;

        case 'voice':
          await bot.sendVoice(chatId, fs.createReadStream(filePath));
          break;

        case 'sticker':
          await bot.sendSticker(chatId, fs.createReadStream(filePath));
          break;

        case 'location':
          await bot.sendLocation(chatId, remind.latitude, remind.longitude);
          break;

        case 'contact':
          await bot.sendContact(
            chatId,
            remind.phone_number,
            remind.first_name,
            { last_name: remind.last_name || '' }
          );
          break;

        case 'poll':
          await bot.sendMessage(
            chatId,
            ` ${remind.question} ${remind.options.join(', ')}`
          );
          break;

        case 'media_group':
          for (const m of remind.items) {
            const mPath = path.join(filesDir, m.file_id);
            const stream = fs.createReadStream(mPath);
            if (m.type === 'photo') {
              await bot.sendPhoto(chatId, stream);
            } else if (m.type === 'video') {
              await bot.sendVideo(chatId, stream);
            } else if (m.type === 'document') {
              await bot.sendDocument(chatId, stream, { filename: m.file_name });
            }
          }
          if (remind.caption) {
            await bot.sendMessage(chatId, ` ${remind.caption}`);
          }
          break;

        default:
          await bot.sendMessage(chatId, `❔ Неизвестный тип напоминания (${remind.type})`);
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки напоминаний:', error);
    await bot.sendMessage(chatId, '❌ Ошибка загрузки напоминаний');
  }
}

