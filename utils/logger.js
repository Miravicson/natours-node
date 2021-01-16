const { createLogger, format, transports } = require('winston');

const { simple, json } = format;
const env = process.env.NODE_ENV || 'local';
const service =
  process.env.MY_APPLICATION_NAME ||
  process.env.APPLICATION_NAME ||
  'natours-service';

const addSeverity = format((info) => {
  info.severity = info.level.toUpperCase();
  return info;
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    addSeverity(),
    env === 'local' || env === 'development' ? simple() : json()
  ),
  defaultMeta: { serviceContext: { service: `${env}-${service}` } },
  transports: [new transports.Console()],
  exitOnError: false, // do not exit on handled exceptions
});

const decorateLogger = (chosenLogger) => ({
  ...chosenLogger,
  info(...args) {
    chosenLogger.info(args.join(' '));
  },
  error(...args) {
    chosenLogger.error(args.join(' '));
  },
});

global.logger = decorateLogger(logger);
module.exports = logger;
