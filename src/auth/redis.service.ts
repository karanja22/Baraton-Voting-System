// redis.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    onModuleInit() {
        this.client = new Redis({
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT ?? '6379'),
            password: process.env.REDIS_PASSWORD,
            tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        });

        this.client.on('connect', () => console.log('Connected to Redis Cloud'));
        this.client.on('error', (err) => console.error('Redis error:', err));
    }

    onModuleDestroy() {
        this.client.quit();
    }

    async setRefreshToken(studentId: string, token: string): Promise<void> {
        await this.client.set(`refresh:${studentId}`, token, 'EX', 7 * 24 * 60 * 60);
    }

    async getRefreshToken(studentId: string): Promise<string | null> {
        return this.client.get(`refresh:${studentId}`);
    }

    async deleteRefreshToken(studentId: string): Promise<void> {
        await this.client.del(`refresh:${studentId}`);
    }
}
