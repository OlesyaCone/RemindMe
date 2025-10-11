class RemindsStorage {
    constructor() {
        this.remindsMap = new Map();
    }

    setReminds(chatId, reminds) {
        this.remindsMap.set(chatId, reminds);
    }

    getReminds(chatId) {
        return this.remindsMap.get(chatId) || [];
    }
}

const remindsStorage = new RemindsStorage();
export default remindsStorage;