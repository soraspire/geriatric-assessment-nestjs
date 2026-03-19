import { createServer } from 'http';
import { AppModule } from '../src/app.module';
import { NestFactory } from '@nestjs/core';

let cachedServer: any;

async function bootstrap() {
    if (!cachedServer) {
        const app = await NestFactory.create(AppModule);

        app.setGlobalPrefix('api');

        // 👇 vẫn giữ CORS trong Nest (không thừa)
        app.enableCors({
            origin: 'https://danhgialaokhoa.vercel.app',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
        });

        await app.init();

        const server = createServer((req, res) => {
            app.getHttpAdapter().getInstance()(req, res);
        });

        cachedServer = server;
    }

    return cachedServer;
}

export default async function handler(req: any, res: any) {
    // 👇 FIX CORS ở tầng Vercel (QUAN TRỌNG NHẤT)
    res.setHeader('Access-Control-Allow-Origin', 'https://danhgialaokhoa.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // 👇 HANDLE PREFLIGHT (fix lỗi hiện tại của bạn)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const server = await bootstrap();
    return server.emit('request', req, res);
}