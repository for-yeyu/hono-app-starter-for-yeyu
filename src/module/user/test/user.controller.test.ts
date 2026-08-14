import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userController } from '../user.controller.js'

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

    const response = await userController.request('/')

    expect(response.status).toBe(200)
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

    const response = await userController.request(`/${user.id}`)

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

    const response = await userController.request(`/${user.id}`)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      message: 'User not found',
    })
  })

  it('creates a user', async () => {
    userServiceMock.create.mockResolvedValue(user)

    const response = await userController.request('/', {
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

    const response = await userController.request(`/${user.id}`, {
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

    const response = await userController.request(`/${user.id}`, {
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
    const response = await userController.request('/invalid-id')

    expect(response.status).toBe(400)
    expect(userServiceMock.findById).not.toHaveBeenCalled()
  })
})
