import { z } from 'zod'

export const userIdParamValidator = z.object({
  id: z.uuid(),
})

export const userCreateValidator = z.object({
  name: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(255),
})

export const userUpdateValidator = userCreateValidator
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })
