import type { Logger } from './index.js'

export type AppEnv = {
  Variables: {
    authUser: {
      id: string
      name: string
    }
    logger: Logger
    requestId: string
  }
}
