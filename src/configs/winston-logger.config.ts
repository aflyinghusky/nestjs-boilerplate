import { format, transports } from 'winston';

export const loggerOptions = {
	transports: [
		new transports.Console({
			format: format.combine(
				format.timestamp({
					format: 'YY-MM-DD HH:mm:ss',
				}),
				format.colorize(),
				format.printf(
					(info) => `${info.timestamp} ${info.level} : ${info.message}`,
				),
			),
		}),
	],
};
