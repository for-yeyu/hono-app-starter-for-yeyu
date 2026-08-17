import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import jwt from 'jsonwebtoken'
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

    return {
      accessToken: jwt.sign(
        {
          sub: user.id,
          name: user.name,
        },
        appConfig.jwtPrivateKey,
        {
          algorithm: 'RS256',
          expiresIn: '7d',
        },
      ),
      user: {
        id: user.id,
        name: user.name,
      },
    }
  },
}
