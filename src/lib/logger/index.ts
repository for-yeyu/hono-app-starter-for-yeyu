import pino from 'pino'
import { appConfig } from '#src/config/index.js'

export const logger = pino({
  level: appConfig.environment === 'production' ? 'info' : 'debug',
  base: {
    service: appConfig.serviceName,
    environment: appConfig.environment,
  },
  serializers: {
    err: pino.stdSerializers.err,
  },
})

export type Logger = typeof logger
