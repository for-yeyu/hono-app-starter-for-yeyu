import { Hono } from 'hono'
import { appConfig } from '../config/index.js'
import { userController } from '../module/user/user.controller.js'

export const app = new Hono()

app.get('/', c => {
  return c.json({
    message: 'Hello Hono~',
    environment: appConfig.environment,
  })
})

app.get('/health', c => {
  return c.json({
    status: 'ok',
  })
})

app.route('/api/users', userController)
