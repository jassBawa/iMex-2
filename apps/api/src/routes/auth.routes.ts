import express from 'express';
import { signInVerify, signupHandler } from '../controllers/auth.controller';

const authRouter = express();

authRouter.post('/signup', signupHandler);
authRouter.get('/signin/verify', signInVerify)

export default authRouter;
