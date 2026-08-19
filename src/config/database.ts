import { databaseConfigSchema } from './schema/database.schema.js'

export const databaseConfig = databaseConfigSchema.parse({
  url: process.env.DatabaseUrl,
})
