import { env } from '../../app/config/env';

export type LogMeta = Record<string, unknown>;

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LOG_LEVEL_PRIORITY: Record<Lowercase<LogLevel>, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const writeLog = (level: LogLevel, message: string, meta?: LogMeta): void => {
  const currentLevelPriority = LOG_LEVEL_PRIORITY[env.LOG_LEVEL];
  const messageLevelPriority = LOG_LEVEL_PRIORITY[level.toLowerCase() as Lowercase<LogLevel>];

  if (messageLevelPriority < currentLevelPriority) {
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ?? {}),
  };

  const serializedEntry = JSON.stringify(entry);

  if (level === 'ERROR') {
    console.error(serializedEntry);
    return;
  }

  if (level === 'WARN') {
    console.warn(serializedEntry);
    return;
  }

  console.log(serializedEntry);
};

export const logger = {
  debug(message: string, meta?: LogMeta): void {
    writeLog('DEBUG', message, meta);
  },
  info(message: string, meta?: LogMeta): void {
    writeLog('INFO', message, meta);
  },
  warn(message: string, meta?: LogMeta): void {
    writeLog('WARN', message, meta);
  },
  error(message: string, meta?: LogMeta): void {
    writeLog('ERROR', message, meta);
  },
};
