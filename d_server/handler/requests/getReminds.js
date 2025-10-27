import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import api from "../../config/api.js";
import remindsStorage from "./remindsStorage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filesDir = path.join(__dirname, "../../data/files");

if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir, { recursive: true });
}

export async function getReminds(bot, chatId) {
  try {
    const response = await api.get("/reminds", { params: { chatId } });
    const reminds = response.data;
    remindsStorage.setReminds(chatId, reminds);

    if (!reminds || reminds.length === 0) {
      await bot.sendMessage(chatId, "📭 Нет напоминаний");
      return;
    }

    for (const item of reminds) {
      const remind = item.remind || item;

      if (!remind || !remind.type) {
        await bot.sendMessage(chatId, "❌ Некорректное напоминание");
        continue;
      }

      let filePath = null;
      if (remind.file_id) {
        filePath = path.join(filesDir, remind.file_id);

        if (!fs.existsSync(filePath)) {
          console.warn(`Файл не найден: ${filePath}`);
          await bot.sendMessage(
            chatId,
            `⚠️ Файл для напоминания не найден (${
              remind.caption || remind.type
            })`
          );
          continue;
        }
      }

      switch (remind.type) {
        case "text":
          await bot.sendMessage(chatId, `📝 ${remind.content}`);
          break;

        case "photo":
          await bot.sendPhoto(chatId, fs.createReadStream(filePath), {
            caption: remind.caption || "",
          });
          break;

        case "video":
          await bot.sendVideo(chatId, fs.createReadStream(filePath), {
            caption: remind.caption || "",
          });
          break;

        case "video_note":
          await bot.sendVideoNote(chatId, fs.createReadStream(filePath));
          break;

        case "document":
          await bot.sendDocument(chatId, fs.createReadStream(filePath), {
            caption: remind.caption || "",
            filename: remind.file_name || undefined,
          });
          break;

        case "voice":
          await bot.sendVoice(chatId, fs.createReadStream(filePath));
          break;

        case "sticker":
          await bot.sendSticker(chatId, fs.createReadStream(filePath));
          break;

        case "location":
          await bot.sendLocation(chatId, remind.latitude, remind.longitude);
          break;

        case "contact":
          await bot.sendContact(
            chatId,
            remind.phone_number,
            remind.first_name,
            { last_name: remind.last_name || "" }
          );
          break;

        case "poll":
          await bot.sendMessage(
            chatId,
            `📊 ${remind.question}\nВарианты: ${remind.options.join(", ")}`
          );
          break;

        case "media_group": {
          const media = [];

          for (const m of remind.items) {
            const mPath = path.join(filesDir, m.file_id);
            if (!fs.existsSync(mPath)) {
              console.warn(`Файл из медиагруппы не найден: ${mPath}`);
              continue;
            }

            const inputFile = fs.createReadStream(mPath);
            media.push({
              type: m.type,
              media: inputFile,
              caption: media.length === 0 ? remind.caption || "" : undefined,
            });
          }

          if (media.length > 0) {
            await bot.sendMediaGroup(chatId, media);
          } else {
            await bot.sendMessage(
              chatId,
              "⚠️ Не удалось отправить медиагруппу — файлы не найдены."
            );
          }
          break;
        }

        default:
          await bot.sendMessage(
            chatId,
            `❔ Неизвестный тип напоминания (${remind.type})`
          );
      }
    }
  } catch (error) {
    console.error("❌ Ошибка загрузки напоминаний:", error);
    await bot.sendMessage(chatId, "❌ Ошибка загрузки напоминаний");
  }
}
