import express from 'express';
import { closeOrder, createOrder } from '../controllers/trade.controller';

const tradeRouter = express();

tradeRouter.post('/create-order', createOrder);
tradeRouter.post('/close-order', closeOrder);

export default tradeRouter;