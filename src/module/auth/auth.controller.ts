import type { AppEnv } from '#src/lib/logger/request-context.js'
import { Hono } from 'hono'
import { authMiddleware } from './auth.middleware.js'
import { authLoginSchema } from './auth.schema.js'
import { authService } from './auth.service.js'
import { zValidator } from '#src/lib/http/z-validator.js'

export const authController = new Hono<AppEnv>()

authController.post('/login', zValidator('json', authLoginSchema), async c => {
  return c.json({
    data: await authService.login(c.req.valid('json')),
  })
})

authController.get('/me', authMiddleware, async c => {
  return c.json({
    data: c.get('authUser'),
  })
})
