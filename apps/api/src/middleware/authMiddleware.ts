import type { NextFunction, Request, Response } from "express";


export async function authMiddleware(req: Request, res: Response, next: NextFunction){
    const authCookie = req.cookies['token']
}