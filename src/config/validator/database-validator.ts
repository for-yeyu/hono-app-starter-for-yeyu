import { z } from 'zod'

export const databaseConfigValidator = z.object({
  url: z.url(),
})
