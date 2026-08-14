import { z } from 'zod'

export const userIdParamValidator = z.object({
  id: z.uuid(),
})

export const userCreateValidator = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().trim().max(255).toLowerCase(),
})

export const userUpdateValidator = userCreateValidator
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })
