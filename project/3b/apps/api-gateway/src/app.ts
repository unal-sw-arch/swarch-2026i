import express from 'express';
import { env } from './app/config/env';
import { requestIdMiddleware } from './app/middlewares/request-id.middleware';
import { accessLogMiddleware } from './middlewares/access-log.middleware';
import { notFoundMiddleware } from './app/middlewares/not-found.middleware';
import { errorMiddleware } from './app/middlewares/error.middleware';
import { rootRouter } from './routes';

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: env.BODY_LIMIT }));
app.use(requestIdMiddleware);
app.use(accessLogMiddleware);
app.use(rootRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
