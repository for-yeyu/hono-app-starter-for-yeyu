import { z } from 'zod'

export const authLoginValidator = z.object({
  name: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(255),
})
