import dotenv from 'dotenv';

if (process.env.ENV_FILE) {
  dotenv.config({ path: process.env.ENV_FILE });
}
dotenv.config({ path: '.env' });

import express, { Request, Response } from 'express';
import helmet from 'helmet';
import os from 'os';

import { corsConfig } from './config/security';
import { mcpMiddleware } from './mcp/mcpServer';
import { errorHandlerMiddleware } from './middlewares/errorHandlerMiddleware';
import { notFoundMiddleware } from './middlewares/notFoundMiddleware';
import { requestIdMiddleware } from './middlewares/requestIdMiddleware';
import apiRouter from './routes';

const app = express();
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);

app.use(corsConfig);

app.use(express.json({ limit: '200kb' }));

app.use(requestIdMiddleware);

app.get('/health', (req, res) => {
  console.log('[health]', {
    host: os.hostname(),
    reqIp: req.ip,
    xForwardedFor: req.headers['x-forwarded-for'],
    hostHeader: req.headers.host,
  });
  res.status(200).json({ ok: true, host: os.hostname() });
});

app.use('/api', apiRouter);

app.post('/mcp', mcpMiddleware);

app.get('/', (_req: Request, res: Response) => {
  res.send('Lyra server is running');
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
