import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  process.env.Environment = 'development'
  process.env.ServerPort = '3000'
  process.env.CorsOrigins = 'http://localhost:3000'
  process.env.DatabaseUrl = 'postgres://user:password@localhost:5432/app'
})

import { app } from '#src/app/index.js'
import { AppError } from '#src/lib/http/app-error.js'
import { errorCode } from '#src/lib/http/error-code.js'

const userServiceMock = vi.hoisted(() => ({
  findMany: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('../user.service.js', () => ({
  userService: userServiceMock,
}))

const user = {
  id: 'b8ae72c2-a34f-4b77-9b83-6f2071bb6f8d',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  createdAt: new Date('2026-08-14T00:00:00.000Z'),
  updatedAt: new Date('2026-08-14T00:00:00.000Z'),
}

describe('userController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns users', async () => {
    userServiceMock.findMany.mockResolvedValue([user])

    const response = await app.request('/api/users')

    expect(response.status).toBe(200)
    expect(response.headers.get('x-request-id')).toEqual(expect.any(String))
    expect(await response.json()).toEqual({
      data: [
        {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      ],
    })
  })

  it('returns a user by id', async () => {
    userServiceMock.findById.mockResolvedValue(user)

    const response = await app.request(`/api/users/${user.id}`)

    expect(response.status).toBe(200)
    expect(userServiceMock.findById).toHaveBeenCalledWith(user.id)
    expect(await response.json()).toEqual({
      data: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    })
  })

  it('returns 404 when user does not exist', async () => {
    userServiceMock.findById.mockResolvedValue(undefined)

    const response = await app.request(`/api/users/${user.id}`)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      success: false,
      error: {
        code: 'not_found',
        message: 'User not found',
      },
    })
  })

  it('creates a user', async () => {
    userServiceMock.create.mockResolvedValue(user)

    const response = await app.request('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: user.name,
        email: user.email,
      }),
      headers: {
        'content-type': 'application/json',
      },
    })

    expect(response.status).toBe(201)
    expect(userServiceMock.create).toHaveBeenCalledWith({
      name: user.name,
      email: user.email,
    })
    expect(await response.json()).toEqual({
      data: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    })
  })

  it('updates a user', async () => {
    const data = {
      name: 'Ada Byron',
    }

    userServiceMock.update.mockResolvedValue({
      ...user,
      ...data,
    })

    const response = await app.request(`/api/users/${user.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'content-type': 'application/json',
      },
    })

    expect(response.status).toBe(200)
    expect(userServiceMock.update).toHaveBeenCalledWith(user.id, data)
    expect(await response.json()).toEqual({
      data: {
        ...user,
        ...data,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    })
  })

  it('deletes a user', async () => {
    userServiceMock.delete.mockResolvedValue(user)

    const response = await app.request(`/api/users/${user.id}`, {
      method: 'DELETE',
    })

    expect(response.status).toBe(200)
    expect(userServiceMock.delete).toHaveBeenCalledWith(user.id)
    expect(await response.json()).toEqual({
      data: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    })
  })

  it('rejects invalid user id params', async () => {
    const response = await app.request('/api/users/invalid-id')

    expect(response.status).toBe(400)
    expect(userServiceMock.findById).not.toHaveBeenCalled()
    expect(await response.json()).toEqual({
      success: false,
      error: {
        code: 'validation_error',
        message: 'Invalid request',
        details: [
          {
            path: 'id',
            message: expect.any(String),
          },
        ],
      },
    })
  })

  it('returns 409 when email already exists', async () => {
    userServiceMock.create.mockRejectedValue(
      new AppError(errorCode.conflict, 'Email already exists'),
    )

    const response = await app.request('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: user.name,
        email: user.email,
      }),
      headers: {
        'content-type': 'application/json',
      },
    })

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      success: false,
      error: {
        code: 'conflict',
        message: 'Email already exists',
      },
    })
  })

  it('returns a safe response for unexpected errors', async () => {
    userServiceMock.findMany.mockRejectedValue(new Error('database exploded'))

    const response = await app.request('/api/users')

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({
      success: false,
      error: {
        code: 'internal_server_error',
        message: 'Internal server error',
      },
    })
  })
})

describe('app error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a unified 404 response for unmatched routes', async () => {
    const response = await app.request('/missing')

    expect(response.status).toBe(404)
    expect(response.headers.get('x-request-id')).toEqual(expect.any(String))
    expect(await response.json()).toEqual({
      success: false,
      error: {
        code: 'not_found',
        message: 'Not found',
      },
    })
  })

  it('reuses a valid request id header', async () => {
    const requestId = 'test-request-id'
    const response = await app.request('/health', {
      headers: {
        'x-request-id': requestId,
      },
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('x-request-id')).toBe(requestId)
  })

  it('allows configured cors origins', async () => {
    const response = await app.request('/health', {
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:3000',
        'access-control-request-method': 'GET',
      },
    })

    expect(response.status).toBe(204)
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:3000')
    expect(response.headers.get('access-control-allow-methods')).toBe(
      'GET,POST,PATCH,DELETE,OPTIONS',
    )
    expect(response.headers.get('access-control-expose-headers')).toBe('x-request-id')
  })

  it('does not allow unconfigured cors origins', async () => {
    const response = await app.request('/health', {
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'GET',
      },
    })

    expect(response.status).toBe(204)
    expect(response.headers.get('access-control-allow-origin')).toBeNull()
  })
})
