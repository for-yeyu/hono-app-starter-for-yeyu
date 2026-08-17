import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '#src/db/index.js'
import { users } from '#src/db/schema/index.js'
import { AppError } from '#src/lib/http/app-error.js'
import { errorCode } from '#src/lib/http/error-code.js'

const saltRounds = 10

const publicUserFields = {
  id: users.id,
  name: users.name,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
}

export const userService = {
  async findMany() {
    return db.select(publicUserFields).from(users).orderBy(users.createdAt)
  },

  async findById(id: string) {
    const [user] = await db.select(publicUserFields).from(users).where(eq(users.id, id)).limit(1)

    return user
  },

  async create(data: { name: string; password: string }) {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.name, data.name))
      .limit(1)

    if (existingUser) {
      throw new AppError(errorCode.conflict, 'User already exists')
    }

    const password = await bcrypt.hash(data.password, saltRounds)
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        password,
      })
      .returning(publicUserFields)

    return user
  },

  async update(id: string, data: { name?: string; password?: string }) {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    }

    if (data.password !== undefined) {
      updateData.password = await bcrypt.hash(data.password, saltRounds)
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning(publicUserFields)

    return user
  },

  async delete(id: string) {
    const [user] = await db.delete(users).where(eq(users.id, id)).returning(publicUserFields)

    return user
  },
}
