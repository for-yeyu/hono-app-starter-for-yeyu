import { describe, expect, it } from 'vitest'
import { appConfigValidator } from '../app-validator.js'

describe('appConfigValidator', () => {
  it('coerces the port and parses multiple cors origins', () => {
    const result = appConfigValidator.safeParse({
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
    const result = appConfigValidator.safeParse({
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
    const result = appConfigValidator.safeParse({
      environment: 'staging',
      port: 0,
      corsOrigins: 'not-an-origin',
    })

    expect(result.success).toBe(false)
  })

  it('rejects missing jwt keys', () => {
    const result = appConfigValidator.safeParse({
      environment: 'development',
      port: 3000,
      corsOrigins: 'http://localhost:3000',
    })

    expect(result.success).toBe(false)
  })

  it('normalizes escaped newlines in jwt keys', () => {
    const result = appConfigValidator.parse({
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
