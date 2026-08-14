import type { AppEnv } from '#src/lib/logger/request-context.js'
import { Hono } from 'hono'
import { userService } from './user.service.js'
import { userCreateValidator, userIdParamValidator, userUpdateValidator } from './user.validator.js'
import { AppError } from '#src/lib/http/app-error.js'
import { errorCode } from '#src/lib/http/error-code.js'
import { zValidator } from '#src/lib/http/z-validator.js'

export const userController = new Hono<AppEnv>()

userController.get('/', async c => {
  return c.json({
    data: await userService.findMany(),
  })
})

userController.get('/:id', zValidator('param', userIdParamValidator), async c => {
  const user = await userService.findById(c.req.valid('param').id)

  if (!user) {
    throw new AppError(errorCode.notFound, 'User not found')
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
      throw new AppError(errorCode.notFound, 'User not found')
    }

    return c.json({
      data: user,
    })
  },
)

userController.delete('/:id', zValidator('param', userIdParamValidator), async c => {
  const user = await userService.delete(c.req.valid('param').id)

  if (!user) {
    throw new AppError(errorCode.notFound, 'User not found')
  }

  return c.json({
    data: user,
  })
})
