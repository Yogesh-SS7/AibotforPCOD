import axios from 'axios';
import { Platform } from 'react-native';

// Android Emulator uses 10.0.2.2 for localhost
// iOS Simulator uses localhost
// Physical device needs your machine's IP (e.g., 192.168.1.x)
// const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';
const BASE_URL = 'http://192.168.0.109:3000/api'; // Updated with your IP

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 60000, // Increased to 60s for local LLM slowness
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
