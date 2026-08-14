import { beforeEach, describe, expect, it, vi } from 'vitest'

const dbMock = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('#src/db/index.js', () => ({
  db: dbMock,
}))

import { userService } from '../user.service.js'
import { users } from '#src/db/schema/index.js'
import { AppError } from '#src/lib/http/app-error.js'

const user = {
  id: 'b8ae72c2-a34f-4b77-9b83-6f2071bb6f8d',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  createdAt: new Date('2026-08-14T00:00:00.000Z'),
  updatedAt: new Date('2026-08-14T00:00:00.000Z'),
}

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('finds users ordered by creation time', async () => {
    const orderBy = vi.fn().mockResolvedValue([user])
    const from = vi.fn().mockReturnValue({ orderBy })
    dbMock.select.mockReturnValue({ from })

    await expect(userService.findMany()).resolves.toEqual([user])

    expect(from).toHaveBeenCalledWith(users)
    expect(orderBy).toHaveBeenCalledWith(users.createdAt)
  })

  it('finds a user by id', async () => {
    const limit = vi.fn().mockResolvedValue([user])
    const where = vi.fn().mockReturnValue({ limit })
    const from = vi.fn().mockReturnValue({ where })
    dbMock.select.mockReturnValue({ from })

    await expect(userService.findById(user.id)).resolves.toEqual(user)

    expect(from).toHaveBeenCalledWith(users)
    expect(limit).toHaveBeenCalledWith(1)
  })

  it('creates a user', async () => {
    const returning = vi.fn().mockResolvedValue([user])
    const values = vi.fn().mockReturnValue({ returning })
    dbMock.insert.mockReturnValue({ values })

    await expect(
      userService.create({
        name: user.name,
        email: user.email,
      }),
    ).resolves.toEqual(user)

    expect(values).toHaveBeenCalledWith({
      name: user.name,
      email: user.email,
    })
  })

  it('translates a direct unique violation into a conflict error', async () => {
    const returning = vi.fn().mockRejectedValue(
      Object.assign(new Error('duplicate email'), {
        code: '23505',
      }),
    )
    const values = vi.fn().mockReturnValue({ returning })
    dbMock.insert.mockReturnValue({ values })

    await expect(
      userService.create({
        name: user.name,
        email: user.email,
      }),
    ).rejects.toMatchObject({
      code: 'conflict',
      message: 'Email already exists',
      status: 409,
    })
  })

  it('rethrows unexpected database errors', async () => {
    const databaseError = new Error('database unavailable')
    const returning = vi.fn().mockRejectedValue(databaseError)
    const values = vi.fn().mockReturnValue({ returning })
    dbMock.insert.mockReturnValue({ values })

    await expect(
      userService.create({
        name: user.name,
        email: user.email,
      }),
    ).rejects.toBe(databaseError)
  })

  it('updates a user and refreshes the update timestamp', async () => {
    const returning = vi.fn().mockResolvedValue([user])
    const where = vi.fn().mockReturnValue({ returning })
    const set = vi.fn().mockReturnValue({ where })
    dbMock.update.mockReturnValue({ set })

    await expect(
      userService.update(user.id, {
        name: 'Ada Byron',
      }),
    ).resolves.toEqual(user)

    expect(set).toHaveBeenCalledWith({
      name: 'Ada Byron',
      updatedAt: expect.any(Date),
    })
  })

  it('translates a nested unique violation into a conflict error', async () => {
    const returning = vi.fn().mockRejectedValue(
      Object.assign(new Error('query failed'), {
        cause: Object.assign(new Error('duplicate email'), {
          code: '23505',
        }),
      }),
    )
    const where = vi.fn().mockReturnValue({ returning })
    const set = vi.fn().mockReturnValue({ where })
    dbMock.update.mockReturnValue({ set })

    await expect(userService.update(user.id, { email: user.email })).rejects.toBeInstanceOf(
      AppError,
    )
  })

  it('deletes a user', async () => {
    const returning = vi.fn().mockResolvedValue([user])
    const where = vi.fn().mockReturnValue({ returning })
    dbMock.delete.mockReturnValue({ where })

    await expect(userService.delete(user.id)).resolves.toEqual(user)

    expect(returning).toHaveBeenCalled()
  })
})
