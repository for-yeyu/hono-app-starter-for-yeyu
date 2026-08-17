import { appConfigValidator } from './validator/app-validator.js'

export const appConfig = appConfigValidator.parse({
  environment: process.env.Environment,
  port: process.env.ServerPort,
  serviceName: process.env.ServiceName,
  corsOrigins: process.env.CorsOrigins,
  jwtPrivateKey: process.env.JwtPrivateKey,
  jwtPublicKey: process.env.JwtPublicKey,
})
