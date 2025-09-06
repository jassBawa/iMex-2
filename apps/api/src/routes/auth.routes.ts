import express from 'express';
import { signInVerify, signupHandler } from '../controllers/auth.controller';

const authRouter = express();

authRouter.post('/signup', signupHandler);
authRouter.get('/sigin/post', signInVerify)

export default authRouter;
