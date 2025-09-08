import express from 'express';
import { getUserBalance } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const balanceRouter = express();

balanceRouter.get('/me', authMiddleware, getUserBalance);

export default balanceRouter;
