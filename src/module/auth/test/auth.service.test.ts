import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  process.env.Environment = 'development'
  process.env.ServerPort = '3000'
  process.env.CorsOrigins = 'http://localhost:3000'
  process.env.DatabaseUrl = 'postgres://user:password@localhost:5432/app'
  process.env.JwtPrivateKey = 'test-private-key'
  process.env.JwtPublicKey = 'test-public-key'
})

const dbMock = vi.hoisted(() => ({
  select: vi.fn(),
}))

const bcryptMock = vi.hoisted(() => ({
  compare: vi.fn(),
}))

const signJwtMock = vi.hoisted(() => ({
  setProtectedHeader: vi.fn(),
  setIssuedAt: vi.fn(),
  setExpirationTime: vi.fn(),
  sign: vi.fn(),
}))

const joseMock = vi.hoisted(() => ({
  SignJWT: vi.fn(function () {
    return signJwtMock
  }),
  importPKCS8: vi.fn(),
}))

vi.mock('#src/db/index.js', () => ({
  db: dbMock,
}))

vi.mock('bcrypt', () => ({
  default: bcryptMock,
}))

vi.mock('jose', () => joseMock)

import { authService } from '../auth.service.js'
import { users } from '#src/db/schema/index.js'

const user = {
  id: 'b8ae72c2-a34f-4b77-9b83-6f2071bb6f8d',
  name: 'Ada Lovelace',
  password: 'hashed-password',
  createdAt: new Date('2026-08-14T00:00:00.000Z'),
  updatedAt: new Date('2026-08-14T00:00:00.000Z'),
}

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    joseMock.importPKCS8.mockResolvedValue('private-key')
    signJwtMock.setProtectedHeader.mockReturnValue(signJwtMock)
    signJwtMock.setIssuedAt.mockReturnValue(signJwtMock)
    signJwtMock.setExpirationTime.mockReturnValue(signJwtMock)
    signJwtMock.sign.mockResolvedValue('signed-token')
  })

  it('logs in a user and signs an access token', async () => {
    const limit = vi.fn().mockResolvedValue([user])
    const where = vi.fn().mockReturnValue({ limit })
    const from = vi.fn().mockReturnValue({ where })
    dbMock.select.mockReturnValue({ from })
    bcryptMock.compare.mockResolvedValue(true)

    await expect(
      authService.login({
        name: user.name,
        password: 'correct password',
      }),
    ).resolves.toEqual({
      accessToken: 'signed-token',
      user: {
        id: user.id,
        name: user.name,
      },
    })

    expect(where).toHaveBeenCalledWith(eq(users.name, user.name))
    expect(bcryptMock.compare).toHaveBeenCalledWith('correct password', user.password)
    expect(joseMock.importPKCS8).toHaveBeenCalledWith('test-private-key', 'RS256')
    expect(joseMock.SignJWT).toHaveBeenCalledWith({
      sub: user.id,
      name: user.name,
    })
    expect(signJwtMock.setProtectedHeader).toHaveBeenCalledWith({ alg: 'RS256' })
    expect(signJwtMock.setIssuedAt).toHaveBeenCalledWith()
    expect(signJwtMock.setExpirationTime).toHaveBeenCalledWith('7d')
    expect(signJwtMock.sign).toHaveBeenCalledWith('private-key')
  })

  it('rejects invalid login credentials', async () => {
    const limit = vi.fn().mockResolvedValue([user])
    const where = vi.fn().mockReturnValue({ limit })
    const from = vi.fn().mockReturnValue({ where })
    dbMock.select.mockReturnValue({ from })
    bcryptMock.compare.mockResolvedValue(false)

    await expect(
      authService.login({
        name: user.name,
        password: 'wrong password',
      }),
    ).rejects.toMatchObject({
      code: 'unauthorized',
      message: 'Invalid credentials',
      status: 401,
    })

    expect(joseMock.importPKCS8).not.toHaveBeenCalled()
    expect(joseMock.SignJWT).not.toHaveBeenCalled()
  })
})
