import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

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

    const isVerified = jwt.verify(authCookie, process.env.JWT_SECRET!);

    if (!isVerified) {
      res.cookie('token', {});
      res.status(400).json({ message: 'Invalid Cookie' });
      return;
    }

    next();

    console.log(authCookie);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


