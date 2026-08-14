import type { Logger } from './index.js'

export type AppEnv = {
  Variables: {
    logger: Logger
    requestId: string
  }
}
