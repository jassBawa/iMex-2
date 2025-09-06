import express from 'express';
import { signInVerify, signupHandler } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const authRouter = express();

authRouter.post('/signup', signupHandler);
authRouter.get('/signin/verify', signInVerify)

// protected route for testing
authRouter.get('/protected-route-test', authMiddleware ,(req, res) => {
    console.log("hello sir")
    res.json({})
})

export default authRouter;
