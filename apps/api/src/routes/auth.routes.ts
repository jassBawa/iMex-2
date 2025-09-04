import express from 'express';
import { signupHandler } from '../controllers/auth.controller';

const authRouter = express();

authRouter.post('/signup', signupHandler);

export default authRouter;
