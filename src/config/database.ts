import { databaseConfigValidator } from './validator/database-validator.js'

export const databaseConfig = databaseConfigValidator.parse({
  url: process.env.DatabaseUrl,
})
