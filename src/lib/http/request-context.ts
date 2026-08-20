import type { Logger } from '#src/lib/logger/index.js'

export type AppEnv = {
  Variables: {
    logger: Logger
    requestId: string
  }
}
