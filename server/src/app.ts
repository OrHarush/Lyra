import dotenv from 'dotenv';

if (process.env.ENV_FILE) {
  dotenv.config({ path: process.env.ENV_FILE });
}
dotenv.config({ path: '.env' });

import express, { Request, Response } from 'express';
import helmet from 'helmet';

import { corsConfig } from './config/security';
import { mcpRouter } from './mcp/mcpHttp';
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

// Mounted ahead of the web CORS allowlist: MCP clients are not browser origins of the web app,
// and the SDK's OAuth handlers apply their own CORS policy.
app.use(mcpRouter);

app.use(corsConfig);

app.use(express.json({ limit: '200kb' }));

app.use(requestIdMiddleware);

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/api', apiRouter);

app.get('/', (_req: Request, res: Response) => {
  res.send('Lyra server is running');
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
