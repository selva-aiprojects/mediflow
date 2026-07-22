import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from '../backend/dist/src/app.module';

const app = express();
let bootstrapped = false;

async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(app));

  nestApp.setGlobalPrefix('api');

  nestApp.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [
      process.env.VERCEL_URL || 'http://localhost:3000',
    ],
    credentials: true,
  });

  nestApp.use(cookieParser());

  await nestApp.init();
  bootstrapped = true;
}

export default async function handler(req: express.Request, res: express.Response) {
  if (!bootstrapped) {
    await bootstrap();
  }
  return app(req, res);
}
