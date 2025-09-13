class RemindController {
    async createRemind(req, res) {
        try {
            const { remind } = req.body;
        } catch (err) {
            console.log('Ошибка в createRemind:', err);
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