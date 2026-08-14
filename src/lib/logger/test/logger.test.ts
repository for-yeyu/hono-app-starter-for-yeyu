import { describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  process.env.Environment = 'production'
  process.env.ServerPort = '3000'
  process.env.CorsOrigins = '*'
  process.env.DatabaseUrl = 'postgres://user:password@localhost:5432/app'
})

import { logger } from '../index.js'

describe('logger', () => {
  it('uses the production logger configuration', () => {
    expect(logger.level).toBe('info')
    expect(logger.bindings()).toMatchObject({
      environment: 'production',
    })
  })
})
