import { z } from 'zod'

export const databaseConfigSchema = z.object({
  url: z.url(),
})
