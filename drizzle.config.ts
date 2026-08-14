import { defineConfig } from 'drizzle-kit'
import { databaseConfig } from './src/config/database.js'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: databaseConfig.url,
  },
})
