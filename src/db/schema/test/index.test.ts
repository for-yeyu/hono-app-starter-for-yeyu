import { describe, expect, it } from 'vitest'
import { users } from '../index.js'

describe('users schema', () => {
  it('exports the expected table definition', () => {
    expect(users).toBeDefined()
    expect(users.id.name).toBe('id')
    expect(users.id.notNull).toBe(true)
    expect(users.name.name).toBe('name')
    expect(users.name.length).toBe(100)
    expect(users.password.name).toBe('password')
    expect(users.password.length).toBe(255)
    expect(users.password.isUnique).toBe(false)
  })

  it('updates the timestamp with a new date', () => {
    const onUpdateFn = users.updatedAt.onUpdateFn

    expect(onUpdateFn).toBeTypeOf('function')
    expect((onUpdateFn as () => Date)()).toBeInstanceOf(Date)
  })
})
