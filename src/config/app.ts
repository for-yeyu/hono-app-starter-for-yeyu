import { appConfigSchema } from './schema/app.schema.js'

export const appConfig = appConfigSchema.parse({
  environment: process.env.Environment,
  port: process.env.ServerPort,
  serviceName: process.env.ServiceName,
  corsOrigins: process.env.CorsOrigins,
  jwtPrivateKey: process.env.JwtPrivateKey,
  jwtPublicKey: process.env.JwtPublicKey,
})
