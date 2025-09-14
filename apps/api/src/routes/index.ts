import express from 'express';
import authRouter from './auth.routes';
import tradeRouter from './trade.routes';
import balanceRouter from './balance.route';
// import assetsRouter from './assets.route';

const mainRouter = express();

mainRouter.use('/auth', authRouter);
mainRouter.use('/trade', tradeRouter);
mainRouter.use('/balance', balanceRouter);
// mainRouter.use('/assets', assetsRouter);

export default mainRouter;
