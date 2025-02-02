import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

const logFormat =  printf(({ level, message, label, timestamp }) => {
	return `${timestamp} ${level}: ${message}`;
  });

const logger = createLogger({
	level: 'info',
	format: combine(
		timestamp(),
		logFormat
	),
	transports: [
		new transports.Console(),
		new transports.File({ filename: 'logs/error.log', level: 'error', options: { flags: 'a' } }),
		new transports.File({ filename: 'logs/combined.log', options: { flags: 'a' } })
	]
});

export default logger;
