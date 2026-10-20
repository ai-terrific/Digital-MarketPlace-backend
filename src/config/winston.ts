import winston from 'winston';
import { LogLevel } from './key';

const { combine, colorize, timestamp, simple, printf } = winston.format;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

export const logger = winston.createLogger({
  level: LogLevel,
  levels,
  format: combine(
    colorize({ all: true }),
    simple(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(({ timestamp, level, message, ...meta }) => {
      let msg = `${timestamp} [${level}]: ${message} `;
      if (Object.keys(meta).length) {
        msg += JSON.stringify(meta);
      }
      return msg;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/all.log' }),
  ],
});

logger.on('error', (error) => {
  console.error(error.message);
});
