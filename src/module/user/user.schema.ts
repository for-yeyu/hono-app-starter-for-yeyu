import { z } from 'zod'

export const userIdParamSchema = z.object({
  id: z.uuid(),
})

export const userCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(255),
})

export const userUpdateSchema = userCreateSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })
