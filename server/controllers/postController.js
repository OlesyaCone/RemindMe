class RemindController {
    async createRemind(req, res) {
        try {
            const { remind } = req.body;
        } catch (err) {
            console.log('Ошибка в createRemind:', err);
        }
    }
}

export default new RemindController();