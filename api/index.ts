import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from '../backend/src/app.module';

const app = express();

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
}

let isColdStart = true;

export default async function handler(req: express.Request, res: express.Response) {
  if (isColdStart) {
    await bootstrap();
    isColdStart = false;
  }
  return app(req, res);
}
