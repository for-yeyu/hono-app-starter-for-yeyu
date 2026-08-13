import { z } from 'zod'

export const userCreateValidator = z.object({
  name: z.string().min(1),
  email: z.email(),
})

export const userUpdateValidator = userCreateValidator.partial()
