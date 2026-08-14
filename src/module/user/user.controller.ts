import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { userService } from './user.service.js'
import { userCreateValidator, userIdParamValidator, userUpdateValidator } from './user.validator.js'

export const userController = new Hono()

userController.get('/', async c => {
  return c.json({
    data: await userService.findMany(),
  })
})

userController.get('/:id', zValidator('param', userIdParamValidator), async c => {
  const user = await userService.findById(c.req.valid('param').id)

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

userController.post('/', zValidator('json', userCreateValidator), async c => {
  const user = await userService.create(c.req.valid('json'))

  return c.json(
    {
      data: user,
    },
    201,
  )
})

userController.patch(
  '/:id',
  zValidator('param', userIdParamValidator),
  zValidator('json', userUpdateValidator),
  async c => {
    const user = await userService.update(c.req.valid('param').id, c.req.valid('json'))

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
  },
)

userController.delete('/:id', zValidator('param', userIdParamValidator), async c => {
  const user = await userService.delete(c.req.valid('param').id)

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
