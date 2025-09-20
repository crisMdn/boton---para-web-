import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import imagesRouter from './routes/images.routes.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.get('/health', (_req, res) => res.send('OK'));
app.use('/api', imagesRouter);

export default app;
