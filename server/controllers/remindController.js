import { MongoClient, ObjectId } from 'mongodb';
import { config } from 'dotenv';
import { resolve } from 'path';
import UserController from './userController.js';

config({ path: resolve(process.cwd(), '.env') });

class RemindController {
    client = null;

    async getCollection() {
        try {
            if (!this.client) {
                this.client = new MongoClient(process.env.MONGO_URL);
                await this.client.connect();
                console.log('Connected to MongoDB');
            }

            const database = this.client.db('Remind');
            return database.collection('reminds');
        } catch (error) {
            console.log('Ошибка подключения к MongoDB:', error);
            throw error;
        }
    }

    async createRemind(req, res) {
        try {
            const post = req.body;
            console.log('Сохраняем пост целиком:', post);

            const collection = await this.getCollection();
            const result = await collection.insertOne(post);

            const savedRemind = { ...post, _id: result.insertedId };
            UserController.scheduleReminder(savedRemind);

            res.json({ success: true, id: result.insertedId });
        } catch (err) {
            console.error('Ошибка в createRemind:', err);
            res.status(500).json({ error: err.message });
        }
    }

    async getRemind(req, res) {
        try {
            const { chatId } = req.query;
            console.log('Получение напоминаний для chatId=', chatId);
            const collection = await this.getCollection();
            const filter = isNaN(Number(chatId)) ? { chatId } : { chatId: Number(chatId) };

            const data = await collection.find(filter).toArray();
            res.json(data);
            console.log(data)
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Ошибка получения данных' });
        }
    }

    async deleteRemind(req, res) {
        try {
            const id = req.params.id;
            const collection = await this.getCollection();
            await collection.deleteOne({ _id: new ObjectId(id) });
            res.json({ success: true });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Ошибка удаления' });
        }
    }

    async putRemind(req, res) {
        try {
            const { id } = req.params;

            const updates = req.body;
            console.log('Обновление напоминания:', { id, updates });

            const collection = await this.getCollection();

            const existingRemind = await collection.findOne({ _id: new ObjectId(id) });
            console.log('Найденное напоминание:', existingRemind);

            const setUpdates = {};

            if (updates.content !== undefined) {
                setUpdates.content = updates.content;
            }

            if (updates.remind) {
                if (updates.remind.type !== undefined) {
                    setUpdates['remind.type'] = updates.remind.type;
                }
                if (updates.remind.content !== undefined) {
                    setUpdates['remind.content'] = updates.remind.content;
                }
                if (updates.remind.time !== undefined) {
                    setUpdates['remind.time'] = updates.remind.time;
                }
                if (updates.remind.file_id !== undefined) {
                    setUpdates['remind.file_id'] = updates.remind.file_id;
                }
                if (updates.remind.caption !== undefined) {
                    setUpdates['remind.caption'] = updates.remind.caption;
                }
            }

            console.log('Применяемые обновления:', setUpdates);

            const result = await collection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: setUpdates },
                { returnDocument: 'after' }
            );

            console.log('Успешно обновлено:', result.value);
            res.json(result.value);
        } catch (err) {
            console.error('Ошибка обновления:', err);
            res.status(500).json({ error: 'Ошибка обновления' });
        }
    }

    async closeConnection() {
        if (this.client) {
            await this.client.close();
            console.log('MongoDB connection closed');
        }
    }
}

export default new RemindController();