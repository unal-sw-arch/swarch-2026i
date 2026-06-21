import 'dotenv/config';
import { app } from './app';
import { env } from './app/config/env';
import { logger } from './shared/utils/logger';

app.listen(env.PORT, () => {
  logger.info(`API Gateway escuchando en puerto ${env.PORT}`);
});
