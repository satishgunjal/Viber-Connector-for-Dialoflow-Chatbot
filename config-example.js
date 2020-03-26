//Important: Set the env to either development or production to use the appropriate config
/****************************************/
const env = "development"; // 'development' or 'production'
/*******************************************/

let appRoot = require("app-root-path");
const { format } = require("winston");
//const { combine, timestamp, printf } = format;
const timestampFormat = 'YYYY-MM-DD HH:mm:ss.SSS';

//All Configurations
const development = { 
  projectId: 'gdfrestapi',
  sessionIdTimeoutInMinutes: '2',
  port:'1234',
  jsonKey:{
    privateKey: 'private key from JSON file',
    clientEmail: 'client email from JSON file'
  },
  viber:{
    webhookUrl : 'webhook URL',
    botName : 'bot name',
    botAvatarLink : 'avatar link',
    viberToken : 'bot verification token'
  },
  logs: {
    file: {
      level: 'debug',
      filename: `D:/AGC/Logs/EBL-DIA-Viber-Connector/%DATE%-trace.log`,
      datePattern: "YYYY-MM-DD",
      zippedArchive: false,
      maxSize: '10m',
      maxFiles: '30',
      format: format.combine(
          format.timestamp({format: timestampFormat}),
          format.printf(
              info => `${info.timestamp} [${info.logId}] ${info.level}: ${info.message}`
          )
      ),
    },
    console: {
      level: 'info',
      datePattern: "YYYY-MM-DD",
      format: format.combine(
        format.colorize(),
        format.timestamp({format: timestampFormat}),
        format.printf(
        info => `${info.timestamp} [${info.logId}] ${info.level}: ${info.message}`
        )
      ),
    },
    morgan: {
      format: ":method :url :status :res[content-length] - :response-time ms"
    }
  }
};

const production = {
  port:1234,
  viber:{
    webhookUrl : 'webhook URL',
    botName : 'bot name',
    botAvatarLink : 'avatar link',
    viberToken : 'bot verification token'
  },
    logs: {
      file: {
        level: 'debug',
        filename: `C:/Users/satish.gunjal/Google Drive/Projects/ChatBOT/EBL-Dia/1-Source-Code/Logs/EBL-DIA-Viber-Connector/%DATE%-trace.log`,
        datePattern: "YYYY-MM-DD",
        zippedArchive: false,
        maxSize: '10m',
        maxFiles: '30',
        format: format.combine(
            format.timestamp({format: timestampFormat}),
            format.printf(
                info => `${info.timestamp} [${info.logId}] ${info.level}: ${info.message}`
            )
        ),
      },
      console: {
        level: 'info',
        datePattern: "YYYY-MM-DD",
        format: format.combine(
          format.colorize(),
          format.timestamp({format: timestampFormat}),
          format.printf(
          info => `${info.timestamp} [${info.logId}] ${info.level}: ${info.message}`
          )
        ),
      },
      morgan: {
        format: ":method :url :status :res[content-length] - :response-time ms"
      }
    }
  };

const config = {
  development,
  production
};

module.exports = config[env];
