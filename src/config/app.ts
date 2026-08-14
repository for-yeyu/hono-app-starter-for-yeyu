import { appConfigValidator } from './validator/app-validator.js'

export const appConfig = appConfigValidator.parse({
  environment: process.env.Environment,
  port: process.env.ServerPort,
})
