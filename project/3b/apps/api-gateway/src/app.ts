import express from 'express';
import { env } from './app/config/env';
import { requestIdMiddleware } from './app/middlewares/request-id.middleware';
import { accessLogMiddleware } from './middlewares/access-log.middleware';
import { throttleMiddleware } from './middlewares/throttle.middleware';
import { notFoundMiddleware } from './app/middlewares/not-found.middleware';
import { errorMiddleware } from './app/middlewares/error.middleware';
import { rootRouter } from './routes';
import { wafMiddleware } from './security/waf.middleware';

export const app = express();

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,x-request-id');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});
app.use(express.json({ limit: env.BODY_LIMIT }));
app.use(requestIdMiddleware);
app.use(wafMiddleware);
app.use(accessLogMiddleware);
app.use(throttleMiddleware);
app.use(rootRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
