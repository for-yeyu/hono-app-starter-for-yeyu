import type { AppEnv } from '#src/lib/http/request-context.js'

export type AuthEnv = {
  Variables: AppEnv['Variables'] & {
    authUser: {
      id: string
      name: string
    }
  }
}
