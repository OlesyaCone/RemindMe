export async function answerHandler(bot, post, callbackQuery) {
    if (callbackQuery) {
        await bot.answerCallbackQuery(callbackQuery.id);
    }
    await answerInput(bot, post.chatId);
    console.log(post);
}

async function answerInput(bot, chatId) {
    await bot.sendMessage(
        chatId,
        '📝 Введите напоминание. Можно отправить:\n' +
        '• Текст\n• Фото/видео\n• Документ\n• Голосовое\n• Альбом файлов\n' +
        '• Стикер\n• Геолокацию\n• Контакт\n• Опрос'
    );
    bot.removeTextListener(/.*/);

    bot.once('message', (msg) => {
        if (msg.chat.id !== chatId) return;

        if (msg.media_group_id) {
            bot.once('media_group', (groupMsgs) =>
                handleMediaGroup(bot, groupMsgs, chatId, post));
            return;
        }

        handleUniversalMessage(bot, msg, true, post);
    });
}

function handleUniversalMessage(bot, msg, isReminder = false, post) {
    const chatId = msg.chat.id;
    let responseText = '';

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
            responseText = msg.caption
                ? `📸 Напоминание с фото: "${msg.caption}"`
                : '📸 Напоминание с фото';
            post.remind = {
                type: 'photo',
                file_id: photoId,
                file_unique_id: msg.photo[msg.photo.length - 1].file_unique_id,
                caption: msg.caption || '',
                width: msg.photo[msg.photo.length - 1].width,
                height: msg.photo[msg.photo.length - 1].height,
                file_size: msg.photo[msg.photo.length - 1].file_size
            };
            break;

        case !!msg.video:
            responseText = msg.caption
                ? `🎥 Напоминание с видео: "${msg.caption}"`
                : '🎥 Напоминание с видео';
            post.remind = {
                type: 'video',
                file_id: msg.video.file_id,
                file_unique_id: msg.video.file_unique_id,
                caption: msg.caption || '',
                duration: msg.video.duration,
                width: msg.video.width,
                height: msg.video.height,
                mime_type: msg.video.mime_type,
                file_size: msg.video.file_size
            };
            break;

        case !!msg.document:
            responseText = `📄 Напоминание с документом: ${msg.document.file_name || 'Без названия'}`;
            post.remind = {
                type: 'document',
                file_id: msg.document.file_id,
                file_unique_id: msg.document.file_unique_id,
                file_name: msg.document.file_name || '',
                mime_type: msg.document.mime_type || '',
                file_size: msg.document.file_size,
                caption: msg.caption || ''
            };
            break;

        case !!msg.voice:
            responseText = '🎤 Голосовое напоминание';
            post.remind = {
                type: 'voice',
                file_id: msg.voice.file_id,
                file_unique_id: msg.voice.file_unique_id,
                duration: msg.voice.duration,
                mime_type: msg.voice.mime_type,
                file_size: msg.voice.file_size
            };
            break;

        case !!msg.video_note:
            responseText = '🌀 Видео-кружок';
            post.remind = {
                type: 'video_note',
                file_id: msg.video_note.file_id,
                file_unique_id: msg.video_note.file_unique_id,
                duration: msg.video_note.duration,
                length: msg.video_note.length,
                file_size: msg.video_note.file_size
            };
            break;

        case !!msg.sticker:
            responseText = '😺 Стикер';
            post.remind = {
                type: 'sticker',
                file_id: msg.sticker.file_id,
                file_unique_id: msg.sticker.file_unique_id,
                emoji: msg.sticker.emoji || '',
                width: msg.sticker.width,
                height: msg.sticker.height,
                file_size: msg.sticker.file_size
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

    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: "✏️ Изменить", callback_data: "edit_reminder" }],
                [{ text: "🗑️ Удалить", callback_data: "delete_reminder" }]
            ]
        }
    };

    if (isReminder) {
        bot.sendMessage(chatId, responseText, options);

        // Пересылаем оригинальное медиа для напоминаний
        if (post.remind.file_id) {
            const mediaMethods = {
                photo: 'sendPhoto',
                video: 'sendVideo',
                document: 'sendDocument',
                voice: 'sendVoice',
                video_note: 'sendVideoNote',
                sticker: 'sendSticker'
            };

            const type = Object.keys(mediaMethods).find(k => post.remind.type === k);
            if (type) {
                bot[mediaMethods[type]](chatId, post.remind.file_id, {
                    caption: post.remind.caption || undefined
                });
            }
        }
    } else {
        bot.sendMessage(chatId, responseText);
    }
}

function handleMediaGroup(bot, groupMsgs, chatId, post) {
    const firstMsg = groupMsgs[0];
    const caption = firstMsg.caption || '';
    const fileTypes = new Set();

    post.remind = {
        type: 'media_group',
        media_group_id: firstMsg.media_group_id,
        items: [],
        caption: caption
    };

    groupMsgs.forEach(msg => {
        if (msg.photo) {
            fileTypes.add('фото');
            const photo = msg.photo[msg.photo.length - 1];
            post.remind.items.push({
                type: 'photo',
                file_id: photo.file_id,
                file_unique_id: photo.file_unique_id,
                width: photo.width,
                height: photo.height,
                file_size: photo.file_size
            });
        }
        else if (msg.video) {
            fileTypes.add('видео');
            post.remind.items.push({
                type: 'video',
                file_id: msg.video.file_id,
                file_unique_id: msg.video.file_unique_id,
                duration: msg.video.duration,
                width: msg.video.width,
                height: msg.video.height,
                mime_type: msg.video.mime_type,
                file_size: msg.video.file_size
            });
        }
        else if (msg.document) {
            fileTypes.add('документ');
            post.remind.items.push({
                type: 'document',
                file_id: msg.document.file_id,
                file_unique_id: msg.document.file_unique_id,
                file_name: msg.document.file_name || '',
                mime_type: msg.document.mime_type || '',
                file_size: msg.document.file_size
            });
        }
    });

    const typesStr = Array.from(fileTypes).join(' + ');
    const responseText = caption
        ? `🖼️ Напоминание с альбомом (${typesStr}): "${caption}"`
        : `🖼️ Напоминание с альбомом (${typesStr})`;

    bot.sendMessage(chatId, responseText, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "✏️ Изменить", callback_data: "edit_reminder" }],
                [{ text: "🗑️ Удалить", callback_data: "delete_reminder" }]
            ]
        }
    });
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