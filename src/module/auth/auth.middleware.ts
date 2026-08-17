import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '#src/lib/logger/request-context.js'
import { importSPKI, jwtVerify } from 'jose'
import { appConfig } from '#src/config/index.js'
import { AppError } from '#src/lib/http/app-error.js'
import { errorCode } from '#src/lib/http/error-code.js'

const verifyToken = async (token: string) => {
  try {
    const publicKey = await importSPKI(appConfig.jwtPublicKey, 'RS256')

    return await jwtVerify(token, publicKey, {
      algorithms: ['RS256'],
    })
  } catch {
    throw new AppError(errorCode.unauthorized, 'Invalid token')
  }
}

export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const authorization = c.req.header('Authorization')

  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError(errorCode.unauthorized, 'Authorization token is required')
  }

  const token = authorization.slice('Bearer '.length).trim()

  if (!token) {
    throw new AppError(errorCode.unauthorized, 'Authorization token is required')
  }

  const { payload } = await verifyToken(token)

  if (typeof payload.sub !== 'string' || typeof payload.name !== 'string') {
    throw new AppError(errorCode.unauthorized, 'Invalid token')
  }

  c.set('authUser', {
    id: payload.sub,
    name: payload.name,
  })

  await next()
}
