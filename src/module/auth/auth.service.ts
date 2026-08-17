import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { importPKCS8, SignJWT } from 'jose'
import { appConfig } from '#src/config/index.js'
import { db } from '#src/db/index.js'
import { users } from '#src/db/schema/index.js'
import { AppError } from '#src/lib/http/app-error.js'
import { errorCode } from '#src/lib/http/error-code.js'

export const authService = {
  async login(data: { name: string; password: string }) {
    const [user] = await db.select().from(users).where(eq(users.name, data.name)).limit(1)

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new AppError(errorCode.unauthorized, 'Invalid credentials')
    }

    const privateKey = await importPKCS8(appConfig.jwtPrivateKey, 'RS256')
    const accessToken = await new SignJWT({
      sub: user.id,
      name: user.name,
    })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(privateKey)

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
      },
    }
  },
}
