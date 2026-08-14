import { describe, expect, it } from 'vitest'
import { databaseConfigValidator } from '../database-validator.js'

describe('databaseConfigValidator', () => {
  it('accepts a PostgreSQL connection URL', () => {
    expect(
      databaseConfigValidator.parse({
        url: 'postgres://user:password@localhost:5432/app',
      }),
    ).toEqual({
      url: 'postgres://user:password@localhost:5432/app',
    })
  })

  it('rejects an invalid database URL', () => {
    const result = databaseConfigValidator.safeParse({
      url: 'not-a-url',
    })

    expect(result.success).toBe(false)
  })
})
