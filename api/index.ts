import { createServer } from 'http';
import { parse } from 'url';
import { AppModule } from '../src/app.module';
import { NestFactory } from '@nestjs/core';

let cachedServer: any;

async function bootstrap() {
    if (!cachedServer) {
        const app = await NestFactory.create(AppModule);
        await app.init();

        const server = createServer((req, res) => {
            app.getHttpAdapter().getInstance()(req, res);
        });

        cachedServer = server;
    }

    return cachedServer;
}

export default async function handler(req: any, res: any) {
    const server = await bootstrap();
    return server.emit('request', req, res);
}