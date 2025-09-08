import express from 'express';
import { closeOrder, createOrder } from '../controllers/trade.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const tradeRouter = express();

tradeRouter.post('/create-order', authMiddleware, createOrder);
tradeRouter.post('/close-order', authMiddleware, closeOrder);

export default tradeRouter;
