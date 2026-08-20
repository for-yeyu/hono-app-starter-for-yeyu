import type { AppEnv } from '#src/lib/http/request-context.js'
import { Hono } from 'hono'
import { userCreateSchema, userIdParamSchema, userUpdateSchema } from './user.schema.js'
import { userService } from './user.service.js'
import { AppError } from '#src/lib/http/app-error.js'
import { errorCode } from '#src/lib/http/error-code.js'
import { zValidator } from '#src/lib/http/z-validator.js'

export const userController = new Hono<AppEnv>()

userController.get('/', async c => {
  return c.json({
    data: await userService.findMany(),
  })
})

userController.get('/:id', zValidator('param', userIdParamSchema), async c => {
  const user = await userService.findById(c.req.valid('param').id)

  if (!user) {
    throw new AppError(errorCode.notFound, 'User not found')
  }

  return c.json({
    data: user,
  })
})

userController.post('/', zValidator('json', userCreateSchema), async c => {
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
  zValidator('param', userIdParamSchema),
  zValidator('json', userUpdateSchema),
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

userController.delete('/:id', zValidator('param', userIdParamSchema), async c => {
  const user = await userService.delete(c.req.valid('param').id)

  if (!user) {
    throw new AppError(errorCode.notFound, 'User not found')
  }

  return c.json({
    data: user,
  })
})
