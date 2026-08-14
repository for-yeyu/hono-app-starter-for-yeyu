import pino from 'pino'
import { appConfig } from '#/config/index.js'

export const logger = pino({
  level: appConfig.environment === 'production' ? 'info' : 'debug',
  base: {
    service: 'hono-app-starter-for-yeyu',
    environment: appConfig.environment,
  },
  serializers: {
    err: pino.stdSerializers.err,
  },
})

export type Logger = typeof logger
