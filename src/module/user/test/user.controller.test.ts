import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  process.env.Environment = 'development'
  process.env.ServerPort = '3000'
  process.env.CorsOrigins = 'http://localhost:3000'
  process.env.DatabaseUrl = 'postgres://user:password@localhost:5432/app'
})

import { app } from '#src/app/index.js'

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
  password: 'correct horse battery staple',
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
        password: user.password,
      }),
      headers: {
        'content-type': 'application/json',
      },
    })

    expect(response.status).toBe(201)
    expect(userServiceMock.create).toHaveBeenCalledWith({
      name: user.name,
      password: user.password,
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

  it('returns 404 when updating a missing user', async () => {
    userServiceMock.update.mockResolvedValue(undefined)

    const response = await app.request(`/api/users/${user.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Ada Byron',
      }),
      headers: {
        'content-type': 'application/json',
      },
    })

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      success: false,
      error: {
        code: 'not_found',
        message: 'User not found',
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

  it('returns 404 when deleting a missing user', async () => {
    userServiceMock.delete.mockResolvedValue(undefined)

    const response = await app.request(`/api/users/${user.id}`, {
      method: 'DELETE',
    })

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      success: false,
      error: {
        code: 'not_found',
        message: 'User not found',
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

  it('rejects an invalid user body', async () => {
    const response = await app.request('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: '',
        password: '',
      }),
      headers: {
        'content-type': 'application/json',
      },
    })

    expect(response.status).toBe(400)
    expect(userServiceMock.create).not.toHaveBeenCalled()
    expect(await response.json()).toEqual({
      success: false,
      error: {
        code: 'validation_error',
        message: 'Invalid request',
        details: expect.arrayContaining([
          {
            path: 'name',
            message: expect.any(String),
          },
          {
            path: 'password',
            message: expect.any(String),
          },
        ]),
      },
    })
  })

  it('rejects an empty user update', async () => {
    const response = await app.request(`/api/users/${user.id}`, {
      method: 'PATCH',
      body: JSON.stringify({}),
      headers: {
        'content-type': 'application/json',
      },
    })

    expect(response.status).toBe(400)
    expect(userServiceMock.update).not.toHaveBeenCalled()
    expect(await response.json()).toEqual({
      success: false,
      error: {
        code: 'validation_error',
        message: 'Invalid request',
        details: [
          {
            path: 'json',
            message: 'At least one field is required',
          },
        ],
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

  it('returns the application metadata from the root route', async () => {
    const response = await app.request('/')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      message: 'Hello Hono~',
      environment: 'development',
    })
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

  it('generates a request id for an invalid header and records request metadata', async () => {
    const response = await app.request('/health', {
      headers: {
        'x-request-id': 'invalid request id',
        'x-forwarded-for': '192.0.2.10, 198.51.100.20',
        'user-agent': 'vitest',
      },
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('x-request-id')).toEqual(
      expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ),
    )
  })

  it('uses the real ip header when forwarded for is absent', async () => {
    const response = await app.request('/health', {
      headers: {
        'x-real-ip': '192.0.2.20',
      },
    })

    expect(response.status).toBe(200)
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
