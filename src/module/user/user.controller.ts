import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { userService } from './user.service.js'
import { userCreateValidator, userUpdateValidator } from './user.validator.js'

export const userController = new Hono()

userController.get('/', c => {
  return c.json({
    data: userService.findMany(),
  })
})

userController.get('/:id', c => {
  const user = userService.findById(c.req.param('id'))

  if (!user) {
    return c.json(
      {
        message: 'User not found',
      },
      404,
    )
  }

  return c.json({
    data: user,
  })
})

userController.post('/', zValidator('json', userCreateValidator), c => {
  const user = userService.create(c.req.valid('json'))

  return c.json(
    {
      data: user,
    },
    201,
  )
})

userController.patch('/:id', zValidator('json', userUpdateValidator), c => {
  const user = userService.update(c.req.param('id'), c.req.valid('json'))

  if (!user) {
    return c.json(
      {
        message: 'User not found',
      },
      404,
    )
  }

  return c.json({
    data: user,
  })
})

userController.delete('/:id', c => {
  const user = userService.delete(c.req.param('id'))

  if (!user) {
    return c.json(
      {
        message: 'User not found',
      },
      404,
    )
  }

  return c.json({
    data: user,
  })
})
