import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { appConfig } from './config/index.js'

const app = new Hono()

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

serve(
  {
    fetch: app.fetch,
    port: appConfig.port,
  },
  info => {
    // biome-ignore lint/suspicious/noConsole: <ignore>
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)
