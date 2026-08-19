import { describe, expect, it } from 'vitest'
import { appConfigSchema } from '../app.schema.js'

describe('appConfigSchema', () => {
  it('coerces the port and parses multiple cors origins', () => {
    const result = appConfigSchema.safeParse({
      environment: 'development',
      port: '3000',
      serviceName: 'hono-api',
      corsOrigins: 'https://example.com, http://localhost:3000',
      jwtPrivateKey: 'test-private-key',
      jwtPublicKey: 'test-public-key',
    })

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data).toEqual({
        environment: 'development',
        port: 3000,
        serviceName: 'hono-api',
        corsOrigins: ['https://example.com', 'http://localhost:3000'],
        jwtPrivateKey: 'test-private-key',
        jwtPublicKey: 'test-public-key',
      })
    }
  })

  it('accepts a wildcard cors origin', () => {
    const result = appConfigSchema.safeParse({
      environment: 'production',
      port: 443,
      corsOrigins: '*',
      jwtPrivateKey: 'test-private-key',
      jwtPublicKey: 'test-public-key',
    })

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.corsOrigins).toBe('*')
    }
  })

  it('rejects invalid runtime configuration', () => {
    const result = appConfigSchema.safeParse({
      environment: 'staging',
      port: 0,
      corsOrigins: 'not-an-origin',
    })

    expect(result.success).toBe(false)
  })

  it('rejects missing jwt keys', () => {
    const result = appConfigSchema.safeParse({
      environment: 'development',
      port: 3000,
      corsOrigins: 'http://localhost:3000',
    })

    expect(result.success).toBe(false)
  })

  it('normalizes escaped newlines in jwt keys', () => {
    const result = appConfigSchema.parse({
      environment: 'development',
      port: 3000,
      corsOrigins: 'http://localhost:3000',
      jwtPrivateKey: 'private\\nkey',
      jwtPublicKey: 'public\\nkey',
    })

    expect(result.jwtPrivateKey).toBe('private\nkey')
    expect(result.jwtPublicKey).toBe('public\nkey')
  })
})
