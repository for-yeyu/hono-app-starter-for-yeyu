import type { MiddlewareHandler } from 'hono'
import type { AuthEnv } from './auth-context.js'
import { verify } from 'hono/jwt'
import { appConfig } from '#src/config/index.js'
import { AppError } from '#src/lib/http/app-error.js'
import { errorCode } from '#src/lib/http/error-code.js'

export const authMiddleware: MiddlewareHandler<AuthEnv> = async (c, next) => {
  const authorization = c.req.header('Authorization')

  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError(errorCode.unauthorized, 'Authorization token is required')
  }

  const token = authorization.slice('Bearer '.length).trim()

  if (!token) {
    throw new AppError(errorCode.unauthorized, 'Authorization token is required')
  }

  let payload: Awaited<ReturnType<typeof verify>>
  try {
    payload = await verify(token, appConfig.jwtPublicKey, 'RS256')
  } catch {
    throw new AppError(errorCode.unauthorized, 'Invalid token')
  }

  if (typeof payload.sub !== 'string' || typeof payload.name !== 'string') {
    throw new AppError(errorCode.unauthorized, 'Invalid token')
  }

  c.set('authUser', {
    id: payload.sub,
    name: payload.name,
  })

  await next()
}
