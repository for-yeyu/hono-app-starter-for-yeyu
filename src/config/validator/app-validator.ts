import { z } from 'zod'

export const appConfigValidator = z.object({
  environment: z.enum(['development', 'production']),
  port: z.coerce.number().int().min(1).max(65_535),
})
