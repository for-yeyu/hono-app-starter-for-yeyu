import pino from 'pino'
import { appConfig } from '#src/config/index.js'

export const logger = pino({
  level: appConfig.environment === 'production' ? 'info' : 'debug',
  transport:
    appConfig.environment === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            singleLine: true,
            translateTime: 'SYS:standard',
          },
        }
      : undefined,
  base: {
    service: appConfig.serviceName,
    environment: appConfig.environment,
  },
  serializers: {
    err: pino.stdSerializers.err,
  },
})

export type Logger = typeof logger
