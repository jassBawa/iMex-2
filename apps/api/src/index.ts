import express from 'express';
import cors from 'cors';
import mainRouter from './routes';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/api/v1', mainRouter);

app.listen(4000, () => {
    console.log('Server started')
})