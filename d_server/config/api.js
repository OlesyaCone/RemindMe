import axios from 'axios';

const API_BASE = 'http://127.0.0.1:3000/api';

const instance = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default instance;