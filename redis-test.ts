import Redis from 'ioredis';
import * as dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
}
const client = new Redis(redisUrl);

client.on('connect', () => console.log('✅ Redis Connected'));
client.on('error', (err) => console.error('❌ Redis error:', err));