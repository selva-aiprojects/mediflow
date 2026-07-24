import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { requestContext } from './context';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const storeId = req.headers['x-store-id'] as string;
    
    // We will run the rest of the request inside this ALS context
    requestContext.run({ storeId }, () => {
      next();
    });
  }
}
