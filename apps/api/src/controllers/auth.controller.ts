import type { NextFunction, Request, Response } from 'express';
import { signupSchema } from '../validations/signupSchema';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../services/mail.service';

export async function signupHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = signupSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.flatten().fieldErrors });
    }

    const { email } = parsed.data;
    const token = jwt.sign(email, process.env.JWT_SECRET!);

    if (process.env.NODE_ENV === 'production') {
      const { data, error } = await sendEmail(email, token);
      if (error) {
        res.status(400).json({ error });
      }
    } else {
      console.log(
        `http://localhost:4000/v1/api/auth/signin/post?token=${token}`
      );
    }

    res.status(201).json({});
  } catch (err: any) {
    next(err);
  }
}

export async function signInVerify(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.query.token?.toString();

    if (!token) {
      console.log('Token not found');
      res.status(411).json({
        message: 'Token not found',
      });
      return;
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

    //todo: review this approach
    res.cookie('jwt', token);
    res.cookie('email', decodedToken.toString());

    res.json({
      message: 'Logged in',
    });
  } catch (err: any) {
    next(err);
  }
}
