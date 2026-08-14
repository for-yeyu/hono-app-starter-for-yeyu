import { serve } from '@hono/node-server'
import { app } from './app/index.js'
import { appConfig } from './config/index.js'
import { logger } from './lib/logger/index.js'

serve(
  {
    fetch: app.fetch,
    port: appConfig.port,
  },
  info => {
    logger.info(
      {
        port: info.port,
        url: `http://localhost:${info.port}`,
      },
      'server started <(￣︶￣)↗ 😋',
    )
  },
)
