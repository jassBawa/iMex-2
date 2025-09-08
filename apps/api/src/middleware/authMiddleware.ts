import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: string;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authCookie = req.cookies['token'];

    if (!authCookie) {
      res.status(404).json({ message: 'Cookie not found' });
      return;
    }

    const payload = jwt.verify(authCookie, process.env.JWT_SECRET!) as {
      email: string;
    };

    if (!payload) {
      res.cookie('token', {});
      res.status(400).json({ message: 'Invalid Cookie' });
      return;
    }

    req.user = payload.email;
    console.log(payload);
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
