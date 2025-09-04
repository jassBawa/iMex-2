import type { NextFunction, Request, Response } from "express";
import { signupSchema } from "../validations/signupSchema";

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


    res.status(201).json({

    });
  } catch (err: any) {
    next(err);
  }
}


