import { z } from 'zod'

export const appConfigValidator = z.object({
  environment: z.enum(['development', 'production']),
  port: z.coerce.number().int().min(1).max(65_535),
  corsOrigins: z
    .string()
    .transform(value => {
      const origins = value
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean)

      return origins.length === 1 && origins[0] === '*' ? '*' : origins
    })
    .pipe(z.union([z.literal('*'), z.array(z.url()).min(1)])),
})
