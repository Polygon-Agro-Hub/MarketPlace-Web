// Example axios configuration
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3200/api',
  timeout: 10000,
});

export default instance;