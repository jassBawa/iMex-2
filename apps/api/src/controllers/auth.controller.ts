import type { NextFunction, Request, Response } from 'express';
import { signupSchema } from '../validations/signupSchema';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../services/mail.service';
import dbClient from '@imex/db';
import { createUserInEngine } from '../services/engine.service';

export async function signupHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { success, data, error } = signupSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({ error: error.flatten().fieldErrors });
    }

    const { email } = data;
    const token = jwt.sign(data, process.env.JWT_SECRET!, {
      expiresIn: '5m',
    });

    const isUserAvailable = await dbClient.user.findFirst({
      where: {
        email,
      },
    });

    if (!isUserAvailable) {
      const user = await dbClient.user.create({
        data: {
          email: email,
          lastLoggedIn: new Date(),
        },
      });

      await createUserInEngine(user);
    }

    // if (process.env.NODE_ENV === 'production') {
    //   const { error } = await sendEmail(email, token);
    //   if (error) {
    //     res.status(400).json({ error });
    //   }
    // } else {
    console.log(
      `http://localhost:4000/api/v1/auth/signin/verify?token=${token}`
    );
    // }

    res.status(201).json({ message: 'Email Sent' });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: 'Interal server error' });
  }
}

export async function signInVerify(req: Request, res: Response) {
  try {
    const token = req.query.token?.toString();

    if (!token) {
      console.log('Token not found');
      res.status(400).json({
        message: 'Verification token not found in params',
      });
      return;
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!); // email;

    if (!decodedToken) {
      res.status(400).json({ message: 'Invalid token' });
      return;
    }

    const sessionToken = jwt.sign(
      { email: decodedToken },
      process.env.JWT_SECRET!,
      { expiresIn: '2d' }
    );

    res.cookie('token', sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'User verified successfully. Logged in.',
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: 'Interal server error' });
  }
}
