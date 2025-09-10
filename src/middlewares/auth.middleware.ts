import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Log authentication attempts
    if (req.path.startsWith('/auth/')) {
      console.log(`Auth request: ${req.method} ${req.path} - ${new Date().toISOString()}`);
    }
    next();
  }
}
