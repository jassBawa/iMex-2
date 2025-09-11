import express from 'express';
import {
  closeOrder,
  createOrder,
  fetchCloseOrders,
  fetchOpenOrders,
} from '../controllers/trade.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const tradeRouter = express();

tradeRouter.post('/create-order', authMiddleware, createOrder);
tradeRouter.post('/close-order', authMiddleware, closeOrder);
tradeRouter.get('/get-open-orders', authMiddleware, fetchOpenOrders);
tradeRouter.get('/get-close-orders', authMiddleware, fetchCloseOrders);

export default tradeRouter;
