import type { AppEnv } from '#src/lib/logger/request-context.js'
import { Hono } from 'hono'
import { authService } from './auth.service.js'
import { authLoginValidator } from './auth.validator.js'
import { zValidator } from '#src/lib/http/z-validator.js'

export const authController = new Hono<AppEnv>()

authController.post('/login', zValidator('json', authLoginValidator), async c => {
  return c.json({
    data: await authService.login(c.req.valid('json')),
  })
})
