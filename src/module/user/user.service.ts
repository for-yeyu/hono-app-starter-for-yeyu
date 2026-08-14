import { eq } from 'drizzle-orm'
import { db } from '#src/db/index.js'
import { users } from '#src/db/schema/index.js'
import { AppError } from '#src/lib/http/app-error.js'
import { errorCode } from '#src/lib/http/error-code.js'

const isUniqueViolationError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false
  }

  if ('code' in error && error.code === '23505') {
    return true
  }

  return isUniqueViolationError(error.cause)
}

const withUniqueViolationHandling = async <T>(operation: () => Promise<T>) => {
  try {
    return await operation()
  } catch (error) {
    if (isUniqueViolationError(error)) {
      throw new AppError(errorCode.conflict, 'Email already exists')
    }

    throw error
  }
}

export const userService = {
  async findMany() {
    return db.select().from(users).orderBy(users.createdAt)
  },

  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)

    return user
  },

  async create(data: { name: string; email: string }) {
    return withUniqueViolationHandling(async () => {
      const [user] = await db.insert(users).values(data).returning()

      return user
    })
  },

  async update(id: string, data: { name?: string; email?: string }) {
    return withUniqueViolationHandling(async () => {
      const [user] = await db
        .update(users)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning()

      return user
    })
  },

  async delete(id: string) {
    const [user] = await db.delete(users).where(eq(users.id, id)).returning()

    return user
  },
}
