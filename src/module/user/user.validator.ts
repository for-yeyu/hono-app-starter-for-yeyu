import { z } from 'zod'

export const userIdParamValidator = z.object({
  id: z.uuid(),
})

export const userCreateValidator = z.object({
  name: z.string().min(1),
  email: z.email(),
})

export const userUpdateValidator = userCreateValidator.partial()
