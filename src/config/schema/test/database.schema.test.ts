import { describe, expect, it } from 'vitest'
import { databaseConfigSchema } from '../database.schema.js'

describe('databaseConfigSchema', () => {
  it('accepts a PostgreSQL connection URL', () => {
    expect(
      databaseConfigSchema.parse({
        url: 'postgres://user:password@localhost:5432/app',
      }),
    ).toEqual({
      url: 'postgres://user:password@localhost:5432/app',
    })
  })

  it('rejects an invalid database URL', () => {
    const result = databaseConfigSchema.safeParse({
      url: 'not-a-url',
    })

    expect(result.success).toBe(false)
  })
})
