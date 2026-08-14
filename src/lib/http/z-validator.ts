import type { ValidationTargets } from 'hono'
import type { z } from 'zod'
import { zValidator as baseZValidator } from '@hono/zod-validator'
import { AppError } from './app-error.js'
import { errorCode } from './error-code.js'

const formatPath = (path: PropertyKey[], target: keyof ValidationTargets) =>
  path.length > 0 ? path.map(String).join('.') : String(target)

export const zValidator = <T extends z.ZodType, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T,
) =>
  baseZValidator(target, schema, result => {
    if (!result.success) {
      throw new AppError(errorCode.validationError, 'Invalid request', {
        details: result.error.issues.map(issue => ({
          path: formatPath(issue.path, target),
          message: issue.message,
        })),
      })
    }
  })
