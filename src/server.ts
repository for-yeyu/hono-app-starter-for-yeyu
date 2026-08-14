import { serve } from '@hono/node-server'
import { app } from './app/index.js'
import { appConfig } from './config/index.js'
import { pool } from './db/index.js'
import { logger } from './lib/logger/index.js'

const server = serve(
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

const shutdown = async (signal: NodeJS.Signals) => {
  logger.info({ signal }, 'server shutting down')

  await Promise.all([
    new Promise<void>((resolve, reject) => {
      server.close(error => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    }),
    pool.end(),
  ])

  logger.info('server stopped')
}

process.once('SIGINT', () => {
  void shutdown('SIGINT')
})

process.once('SIGTERM', () => {
  void shutdown('SIGTERM')
})
