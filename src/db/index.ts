import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { databaseConfig } from '#src/config/index.js'

export const pool = new Pool({
  connectionString: databaseConfig.url,
})

export const db = drizzle({
  client: pool,
})
