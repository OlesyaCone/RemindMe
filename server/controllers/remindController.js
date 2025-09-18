import { MongoClient, ObjectId } from 'mongodb';
import { config } from 'dotenv';
import { resolve } from 'path';

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
            const { remind } = req.body;
            console.log('Содержимое напоминания:', remind);
            
            const collection = await this.getCollection();
            const result = await collection.insertOne(remind); 
            
            res.json({ 
                success: true, 
                id: result.insertedId 
            });
            
        } catch (err) {
            console.log('Ошибка в createRemind:', err);
            res.status(500).json({ error: err.message });
        }
    }

    async getRemind(req, res) {
        try {
            const { chatId } = req.query;
            const collection = await this.getCollection();
            const data = await collection.find({ chatId: chatId }).toArray();
            res.json(data);
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
            const collection = await this.getCollection();

            const result = await collection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updates },
                { returnDocument: 'after' }
            );
            
            res.json(result.value);
        } catch (err) {
            console.log(err);
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