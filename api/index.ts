import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from '../backend/dist/src/app.module';

const app = express();
let bootstrapPromise: Promise<void> | null = null;

async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(app));

  app.use((req, res, next) => {
    res.setHeader('X-Vercel-Api-Reached', 'true');
    res.setHeader('X-Vercel-Req-Url', req.url);
    if (req.url === '/api/test-vercel' || req.url === '/test-vercel') {
      return res.json({ success: true, url: req.url, message: "Vercel API is reached!" });
    }
    next();
  });

  // Vercel strips the /api mount path natively.
  // We remove the global prefix and defensively ensure req.url starts from the controller root.
  app.use((req, _res, next) => {
    if (req.url === '/api') {
      req.url = '/';
    } else if (req.url.startsWith('/api/')) {
      req.url = req.url.slice('/api'.length);
    }
    next();
  });

  nestApp.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
      const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
      
      if (
        origin === 'http://localhost:3000' || 
        origin === vercelUrl ||
        origin.endsWith('.vercel.app') ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  nestApp.use(cookieParser());

  await nestApp.init();
}

export default async function handler(req: express.Request, res: express.Response) {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrap();
  }
  await bootstrapPromise;
  return app(req, res);
}
