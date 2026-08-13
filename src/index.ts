import { serve } from '@hono/node-server'
import { app } from './app/index.js'
import { appConfig } from './config/index.js'

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
