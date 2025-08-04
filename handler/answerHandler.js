import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { confirmAction } from './confirmAction.js';
import { CallbackHandler } from './callbackHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

const filesDir = path.join(__dirname, '../files');
if (!fs.existsSync(filesDir)) {
    await mkdir(filesDir, { recursive: true });
}

async function saveFile(fileId, fileData) {
    const filePath = path.join(filesDir, fileId);
    await writeFile(filePath, fileData);
    return `../files/${fileId}`;
}

export async function answerHandler(bot, post, callbackQuery) {
    if (callbackQuery) {
        await bot.answerCallbackQuery(callbackQuery.id);
    }

    await bot.sendMessage(
        post.chatId,
        '📝 Введите напоминание. Можно отправить:\n' +
        '• Текст\n• Фото/видео\n• Документ\n• Голосовое\n• Альбом файлов\n' +
        '• Стикер\n• Геолокацию\n• Контакт\n• Опрос'
    );;

    bot.removeTextListener(/.*/);

    const mediaGroups = new Map();

    const onMessage = async (msg) => {
        if (msg.chat.id !== post.chatId) return;

        if (msg.media_group_id) {
            if (!mediaGroups.has(msg.media_group_id)) {
                mediaGroups.set(msg.media_group_id, {
                    timer: setTimeout(async () => {
                        const groupMsgs = mediaGroups.get(msg.media_group_id).messages;
                        await handleMediaGroup(bot, groupMsgs, post.chatId, post);
                        mediaGroups.delete(msg.media_group_id);
                    }, 3000),
                    messages: []
                });
            }
            mediaGroups.get(msg.media_group_id).messages.push(msg);
            return;
        }
        bot.removeListener('message', onMessage);
        await handleUniversalMessage(bot, msg, true, post);
    };

    bot.on('message', onMessage);
}

async function handleUniversalMessage(bot, msg, isReminder = false, post) {
    const chatId = msg.chat.id;
    let responseText = '';

    try {
        switch (true) {
            case !!msg.text && !msg.entities:
                responseText = isReminder
                    ? `📝 Напоминание: "${msg.text}"`
                    : `Вы прислали текст: "${msg.text}"`;
                post.remind = {
                    type: 'text',
                    content: msg.text,
                    entities: msg.entities || []
                };
                break;

            case !!msg.photo:
                const photoId = msg.photo[msg.photo.length - 1].file_id;
                const photoFile = await bot.getFile(photoId);
                const photoPath = await saveFile(photoId, await downloadFile(bot, photoFile));
                responseText = msg.caption
                    ? `📸 Напоминание с фото: "${msg.caption}"`
                    : '📸 Напоминание с фото';
                post.remind = {
                    type: 'photo',
                    file_id: photoPath,
                    caption: msg.caption || '',
                };
                break;

            case !!msg.video:
                const videoFile = await bot.getFile(msg.video.file_id);
                const videoPath = await saveFile(msg.video.file_id, await downloadFile(bot, videoFile));
                responseText = msg.caption
                    ? `🎥 Напоминание с видео: "${msg.caption}"`
                    : '🎥 Напоминание с видео';
                post.remind = {
                    type: 'video',
                    file_id: videoPath,
                    caption: msg.caption || '',
                };
                break;

            case !!msg.document:
                const docFile = await bot.getFile(msg.document.file_id);
                const docBuffer = await downloadFile(bot, docFile);
                const fileExt = msg.document.file_name?.split('.').pop() || 'bin';
                const uniqueFileName = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;
                const docPath = await saveFile(uniqueFileName, docBuffer);
                responseText = `📄 Напоминание с документом: ${msg.document.file_name || 'Без названия'}`;
                post.remind = {
                    type: 'document',
                    file_id: docPath,
                    file_name: msg.document.file_name,
                    caption: msg.caption || ''
                };
                break;

            case !!msg.voice:
                const voiceFile = await bot.getFile(msg.voice.file_id);
                const voicePath = await saveFile(msg.voice.file_id, await downloadFile(bot, voiceFile));
                responseText = '🎤 Голосовое напоминание';
                post.remind = {
                    type: 'voice',
                    file_id: voicePath,
                };
                break;

            case !!msg.video_note:
                const videoNoteFile = await bot.getFile(msg.video_note.file_id);
                const videoNotePath = await saveFile(msg.video_note.file_id, await downloadFile(bot, videoNoteFile));
                responseText = '🌀 Видео-кружок';
                post.remind = {
                    type: 'video_note',
                    file_id: videoNotePath,
                };
                break;

            case !!msg.sticker:
                const stickerFile = await bot.getFile(msg.sticker.file_id);
                const stickerPath = await saveFile(msg.sticker.file_id, await downloadFile(bot, stickerFile));
                responseText = '😺 Стикер';
                post.remind = {
                    type: 'sticker',
                    file_id: stickerPath,
                    emoji: msg.sticker.emoji || '',
                };
                break;

            case !!msg.location:
                responseText = `📍 Локация: ${msg.location.latitude}, ${msg.location.longitude}`;
                post.remind = {
                    type: 'location',
                    latitude: msg.location.latitude,
                    longitude: msg.location.longitude,
                    live_period: msg.location.live_period || null
                };
                break;

            case !!msg.contact:
                responseText = `👤 Контакт: ${msg.contact.first_name} ${msg.contact.phone_number}`;
                post.remind = {
                    type: 'contact',
                    phone_number: msg.contact.phone_number,
                    first_name: msg.contact.first_name,
                    last_name: msg.contact.last_name || '',
                    vcard: msg.contact.vcard || ''
                };
                break;

            case !!msg.poll:
                responseText = `📊 Опрос: ${msg.poll.question}`;
                post.remind = {
                    type: 'poll',
                    question: msg.poll.question,
                    options: msg.poll.options.map(opt => opt.text),
                    is_anonymous: msg.poll.is_anonymous,
                    type: msg.poll.type,
                    allows_multiple_answers: msg.poll.allows_multiple_answers || false
                };
                break;

            case !!msg.dice:
                responseText = `🎲 ${getDiceType(msg.dice.emoji)}: ${msg.dice.value}`;
                post.remind = {
                    type: 'dice',
                    emoji: msg.dice.emoji,
                    value: msg.dice.value
                };
                break;

            default:
                responseText = '❌ Этот тип сообщения не поддерживается для напоминаний';
                post.remind = {
                    type: 'unsupported'
                };
        }

        if (isReminder) {
            await bot.sendMessage(chatId, responseText);

            const callbackHandler = new CallbackHandler(bot);
            callbackHandler.storePost(post);
            await confirmAction(bot, post)

            if (post.remind.file_id) {
                await sendSavedFile(bot, chatId, post.remind);
            }
        } else {
            await bot.sendMessage(chatId, responseText);
        }

        console.log(post)
    } catch (error) {
        console.error('Ошибка при обработке сообщения:', error);
        await bot.sendMessage(chatId, '⚠️ Произошла ошибка при сохранении файла');
    }
}

async function handleMediaGroup(bot, groupMsgs, chatId, post) {
    try {
        if (!groupMsgs || groupMsgs.length === 0) {
            throw new Error('Получена пустая медиагруппа');
        }

        const firstMsg = groupMsgs[0];
        const caption = firstMsg.caption || '';
        const fileTypes = new Set();

        post.remind = {
            type: 'media_group',
            media_group_id: firstMsg.media_group_id,
            items: [],
            caption: caption
        };

        const fileProcessingPromises = groupMsgs.map(async (msg) => {
            try {
                if (msg.photo) {
                    fileTypes.add('фото');
                    const photo = msg.photo[msg.photo.length - 1];
                    const photoFile = await bot.getFile(photo.file_id);
                    const photoBuffer = await downloadFile(bot, photoFile);
                    const uniqueFileName = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.jpg`;
                    const photoPath = await saveFile(uniqueFileName, photoBuffer);

                    return {
                        type: 'photo',
                        file_id: photoPath
                    };
                }
                else if (msg.video) {
                    fileTypes.add('видео');
                    const videoFile = await bot.getFile(msg.video.file_id);
                    const videoBuffer = await downloadFile(bot, videoFile);
                    const uniqueFileName = `video_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.mp4`;
                    const videoPath = await saveFile(uniqueFileName, videoBuffer);

                    return {
                        type: 'video',
                        file_id: videoPath
                    };
                }
                else if (msg.document) {
                    fileTypes.add('документ');
                    const docFile = await bot.getFile(msg.document.file_id);
                    const docBuffer = await downloadFile(bot, docFile);
                    const fileExt = msg.document.file_name?.split('.').pop() || 'bin';
                    const uniqueFileName = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;
                    const docPath = await saveFile(uniqueFileName, docBuffer);

                    return {
                        type: 'document',
                        file_id: docPath,
                        file_name: msg.document.file_name
                    };
                }
            } catch (error) {
                console.error(`Ошибка обработки файла из медиагруппы:`, error);
                return null;
            }
        });

        const processedItems = await Promise.all(fileProcessingPromises);

        post.remind.items = processedItems.filter(item => item !== null);

        if (post.remind.items.length === 0) {
            throw new Error('Не удалось сохранить ни одного файла из медиагруппы');
        }

        const typesStr = Array.from(fileTypes).join(' + ');
        const responseText = caption
            ? `🖼️ Напоминание с альбомом (${typesStr}): "${caption}"`
            : `🖼️ Напоминание с альбомом (${typesStr})`;

        await bot.sendMessage(chatId, responseText);

        const callbackHandler = new CallbackHandler(bot);
        callbackHandler.storePost(post);
        await confirmAction(bot, post);

        const sendPromises = post.remind.items.map(item =>
            sendSavedFile(bot, chatId, item).catch(error => {
                console.error('Ошибка отправки файла:', error);
            })
        );

        await Promise.all(sendPromises);
        console.log(post)
    } catch (error) {
        console.error('Ошибка при обработке медиагруппы:', error);
        await bot.sendMessage(chatId, '⚠️ Произошла ошибка при сохранении медиагруппы');
    }
}

async function downloadFile(bot, file) {
    const fileUrl = await bot.getFileLink(file.file_id);
    const response = await fetch(fileUrl);
    return await response.buffer();
}

async function sendSavedFile(bot, chatId, fileData) {
    try {
        const filePath = path.join(__dirname, fileData.file_id);
        const fileStream = fs.createReadStream(filePath);

        const sendMethods = {
            photo: 'sendPhoto',
            video: 'sendVideo',
            document: 'sendDocument',
            voice: 'sendVoice',
            video_note: 'sendVideoNote',
            sticker: 'sendSticker'
        };

        const method = sendMethods[fileData.type];
        if (method) {
            const options = {
                caption: fileData.caption || undefined
            };

            if (fileData.type === 'document' && fileData.file_name) {
                options.filename = fileData.file_name;
            }

            await bot[method](chatId, fileStream, options);
        }
    } catch (error) {
        console.error('Ошибка при отправке сохраненного файла:', error);
    }
}

function getDiceType(emoji) {
    const types = {
        '🎲': 'Кости',
        '🎯': 'Дартс',
        '🏀': 'Баскетбол',
        '⚽': 'Футбол',
        '🎰': 'Слот-машина'
    };
    return types[emoji] || 'Игра';
} 