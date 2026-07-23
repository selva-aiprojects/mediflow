import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import express from 'express';

// @ts-ignore
import { AppModule } from '../dist/src/app.module.js';

let app: any = null;
let bootstrapPromise: Promise<void> | null = null;

async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(app));

  app.use((req: any, res: any, next: any) => {
    res.setHeader('X-Vercel-Api-Reached', 'true');
    res.setHeader('X-Vercel-Req-Url', req.url);
    if (req.url === '/api/test-vercel' || req.url === '/test-vercel') {
      return res.json({ success: true, url: req.url, message: "Vercel API is reached!" });
    }
    next();
  });

  app.use((req: any, _res: any, next: any) => {
    if (req.url === '/api') {
      req.url = '/';
    } else if (req.url.startsWith('/api/')) {
      req.url = req.url.slice('/api'.length);
    }
    next();
  });

  nestApp.enableCors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  });

  // @ts-ignore
  nestApp.use(cookieParser());

  await nestApp.init();
}

export default async function handler(req: any, res: any) {
  try {
    if (!app) {
      app = express();
    }
    
    if (!bootstrapPromise) {
      bootstrapPromise = bootstrap();
    }
    await bootstrapPromise;
    return app(req, res);
  } catch (error: any) {
    console.error('API Initialization Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: "API crashed during initialization",
      error: error?.message || String(error),
      stack: error?.stack
    });
  }
}
