var moment = require('moment');
var winston = require('winston');


var config = winston.config;
var format = winston.format;
var logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      timestamp() {
        return moment().format('DD/MM/YYYY HH:mm:ss');
      },
      level: 'info', // { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
      filename: './logs/logs.log',
      handleExceptions: true,
      maxsize: 5242880, //5MB
      colorize: false,
      format: format.combine(
        format.timestamp(),
        format.json(),
        format.printf(info => `${moment().format('DD/MM/YYYY HH:mm:ss')} ${info.level}: ${info.message}`)
      )
    }),
    new winston.transports.Console({
      timestamp() {
        return moment().format('DD/MM/YYYY HH:mm:ss');
      },
      level: 'info', // { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
      handleExceptions: true,
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.simple(),
        format.printf(info => `${moment().format('DD/MM/YYYY HH:mm:ss')} ${info.level}: ${info.message}`)
      )
    })
  ],
  exitOnError: false
});

logger.stream = {
  write: function (message, encoding) {
    console.log(message);
    logger.info(message.replace(/(\r\n|\n|\r)/gm, ""));
  }
};

module.exports = logger;