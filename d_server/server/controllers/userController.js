import { MongoClient, ObjectId } from 'mongodb';
import { config } from 'dotenv';
import { resolve } from 'path';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: resolve(process.cwd(), '.env') });

class UserController {
    client = null;
    bot = null;
    scheduledTasks = new Map();

    setBot(botInstance) {
        this.bot = botInstance;
        this.startScheduler();
    }

    async getCollection() {
        try {
            if (!this.client) {
                this.client = new MongoClient(process.env.MONGO_URL);
                await this.client.connect();
                console.log('Connected to MongoDB for reminders');
            }
            const database = this.client.db('Remind');
            return database.collection('reminds');
        } catch (error) {
            console.log('Ошибка подключения к MongoDB:', error);
            throw error;
        }
    }

    async startScheduler() {
        console.log('🚀 Запуск планировщика напоминаний...');

        try {
            const collection = await this.getCollection();
            const allReminds = await collection.find({}).toArray();

            console.log(`📋 Найдено ${allReminds.length} напоминаний для планирования`);

            for (const remind of allReminds) {
                this.scheduleReminder(remind);
            }

            cron.schedule('1 0 * * *', async () => {
                console.log('🔍 Ежедневная проверка напоминаний...');
                await this.rescheduleAllReminders();
            });

        } catch (error) {
            console.error('Ошибка при запуске планировщика:', error);
        }
    }

    scheduleReminder(remind) {
        const remindId = remind._id.toString();

        if (this.scheduledTasks.has(remindId)) {
            this.scheduledTasks.get(remindId).stop();
            this.scheduledTasks.delete(remindId);
        }

        const remindType = remind.type; 
        const remindTime = remind.time; 
        const remindData = remind.remind;
        const chatId = remind.chatId;

        console.log(`🔍 Напоминание ${remindId}: type=${remindType}, time=${remindTime}`);

        if (!remindType || !remindTime) {
            console.log(`❌ Неверный формат напоминания ${remindId}`);
            return;
        }

        try {
            let task;

            switch (remindType) {
                case 'daily':
                    task = this.scheduleDailyReminder(remindData, chatId, remindId, remindTime);
                    break;

                case 'specific':
                    task = this.scheduleSpecificReminder(remindData, chatId, remindId, remindTime, remind.date);
                    break;

                case 'weekly':
                    task = this.scheduleWeeklyReminder(remindData, chatId, remindId, remindTime, remind.days);
                    break;

                case 'after':
                    console.log(`⏰ Напоминание "через время" ${remindId} не требует планирования`);
                    return;

                default:
                    console.log(`❌ Неизвестный тип напоминания: ${remindType}`);
                    return;
            }

            if (task) {
                this.scheduledTasks.set(remindId, task);
                console.log(`✅ Запланировано напоминание ${remindId} для чата ${chatId}`);
            }

        } catch (error) {
            console.error(`❌ Ошибка планирования напоминания ${remindId}:`, error);
        }
    }

    // Обновляем методы чтобы принимать time как параметр
    scheduleDailyReminder(remindData, chatId, remindId, time) {
        const [hours, minutes] = time.split(':');
        const cronExpression = `${minutes} ${hours} * * *`;

        console.log(`📅 Ежедневное напоминание ${remindId} в ${time}`);

        return cron.schedule(cronExpression, async () => {
            await this.sendReminder(remindData, chatId, remindId);
        }, {
            scheduled: true,
            timezone: "Europe/Moscow"
        });
    }

    scheduleSpecificReminder(remindData, chatId, remindId, time, date) {
        if (!date) {
            console.log(`❌ Отсутствует дата для напоминания ${remindId}`);
            return null;
        }

        const [day, month, year] = date.split('.').map(Number);
        const [hours, minutes] = time.split(':');

        const reminderDate = new Date(year, month - 1, day, hours, minutes);
        const now = new Date();

        if (reminderDate < now) {
            console.log(`⏰ Напоминание ${remindId} уже прошло`);
            return null;
        }

        const delay = reminderDate.getTime() - now.getTime();

        console.log(`📅 Напоминание ${remindId} на ${date} ${time}`);

        const timeout = setTimeout(async () => {
            await this.sendReminder(remindData, chatId, remindId);
            this.scheduledTasks.delete(remindId);
        }, delay);

        return {
            stop: () => clearTimeout(timeout)
        };
    }

    scheduleWeeklyReminder(remindData, chatId, remindId, time, days) {
        if (!days || !Array.isArray(days)) {
            console.log(`❌ Отсутствуют дни недели для напоминания ${remindId}`);
            return null;
        }

        const [hours, minutes] = time.split(':');
        const daysMap = {
            'пн': 1, 'вт': 2, 'ср': 3, 'чт': 4, 'пт': 5, 'сб': 6, 'вс': 0
        };

        const daysOfWeek = days.map(day => daysMap[day]).join(',');
        const cronExpression = `${minutes} ${hours} * * ${daysOfWeek}`;

        console.log(`📅 Еженедельное напоминание ${remindId} по ${days.join(',')} в ${time}`);

        return cron.schedule(cronExpression, async () => {
            await this.sendReminder(remindData, chatId, remindId);
        }, {
            scheduled: true,
            timezone: "Europe/Moscow"
        });
    }
    
    async sendReminder(remindData, chatId, remindId) {
        try {
            if (!this.bot) {
                console.log('❌ Бот не инициализирован');
                return;
            }

            console.log(`🔔 Отправка напоминания ${remindId} в чат ${chatId}`);

            switch (remindData.type) {
                case 'text':
                    await this.bot.sendMessage(chatId, `🔔 Напоминание: ${remindData.content}`);
                    break;

                case 'photo':
                    await this.sendPhotoReminder(remindData, chatId);
                    break;

                case 'video':
                    await this.sendVideoReminder(remindData, chatId);
                    break;

                case 'document':
                    await this.sendDocumentReminder(remindData, chatId);
                    break;

                case 'voice':
                    await this.sendVoiceReminder(remindData, chatId);
                    break;

                case 'video_note':
                    await this.sendVideoNoteReminder(remindData, chatId);
                    break;

                case 'sticker':
                    await this.sendStickerReminder(remindData, chatId);
                    break;

                case 'location':
                    await this.bot.sendLocation(chatId, remindData.latitude, remindData.longitude);
                    break;

                case 'contact':
                    await this.bot.sendContact(
                        chatId,
                        remindData.phone_number,
                        remindData.first_name,
                        { last_name: remindData.last_name || '' }
                    );
                    break;

                case 'poll':
                    await this.bot.sendMessage(
                        chatId,
                        `🔔 Опрос: ${remindData.question}\nВарианты: ${remindData.options.join(', ')}`
                    );
                    break;

                case 'media_group':
                    await this.sendMediaGroupReminder(remindData, chatId);
                    break;

                default:
                    await this.bot.sendMessage(chatId, `🔔 Напоминание: ${remindData.content || 'Время пришло!'}`);
            }

            console.log(`✅ Напоминание ${remindId} отправлено в чат ${chatId}`);

        } catch (error) {
            console.error(`❌ Ошибка отправки напоминания ${remindId}:`, error);

            if (error.response && error.response.statusCode === 403) {
                console.log(`🗑️ Чат ${chatId} не доступен, удаляем напоминание ${remindId}`);
                await this.deleteReminderFromDB(remindId);
            }
        }
    }

    async deleteReminderFromDB(remindId) {
        try {
            const collection = await this.getCollection();
            await collection.deleteOne({ _id: new ObjectId(remindId) });
            console.log(`🗑️ Напоминание ${remindId} удалено из БД`);
        } catch (error) {
            console.error(`❌ Ошибка удаления напоминания ${remindId}:`, error);
        }
    }

    async rescheduleAllReminders() {
        try {
            const collection = await this.getCollection();
            const allReminds = await collection.find({}).toArray();

            for (const task of this.scheduledTasks.values()) {
                task.stop();
            }
            this.scheduledTasks.clear();

            for (const remind of allReminds) {
                this.scheduleReminder(remind);
            }

            console.log(`✅ Перепланировано ${allReminds.length} напоминаний`);
        } catch (error) {
            console.error('❌ Ошибка перепланирования напоминаний:', error);
        }
    }

    stopScheduler() {
        for (const task of this.scheduledTasks.values()) {
            task.stop();
        }
        this.scheduledTasks.clear();
    }

    async closeConnection() {
        this.stopScheduler();
        if (this.client) {
            await this.client.close();
            console.log('MongoDB connection closed');
        }
    }
}

export default new UserController();