import { MongoClient, ObjectId } from 'mongodb';

class RemindController {

    async getCollection() {
        const client = new MongoClient(process.env.MONGO_URL);
        await client.connect();
        const database = client.db('Remind');
        return database.collection('reminds');
    }

    async createRemind(req, res) {
    try {
        const { remind } = req.body;
        const collection = await this.getCollection();

        const result = await collection.insertOne({ remind });

        res.status(201).json(result);
    } catch (err) {
        console.log('Ошибка в createRemind:', err);
        res.status(500).json({ error: 'Не удалось создать напоминание' });
    }
}


    async getRemind(req, res) {
        try {
            const { chatId } = req.query;
            const data = await Remind.find({ chatId: chatId });
        } catch (err) {
            console.log(err);
        }
    }

    async deleteRemind(req, res) {
        try {
            const id = req.params.id;
            await Remind.deleteOne({ _id: id });
        } catch (err) {
            console.log(err);
        }
    }

    async putRemind(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const updatedRemind = await Remind.findOneAndUpdate(
                { _id: id },
                updates,
                { new: true }
            );
        } catch (err) {
            console.log(err);
        }
    }
}

export default new RemindController();