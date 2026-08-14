import { describe, expect, it } from 'vitest'
import { users } from '../index.js'

describe('users schema', () => {
  it('exports the expected table definition', () => {
    expect(users).toBeDefined()
    expect(users.id.name).toBe('id')
    expect(users.id.notNull).toBe(true)
    expect(users.name.name).toBe('name')
    expect(users.name.length).toBe(100)
    expect(users.email.name).toBe('email')
    expect(users.email.length).toBe(255)
    expect(users.email.isUnique).toBe(true)
  })

  it('updates the timestamp with a new date', () => {
    const onUpdateFn = users.updatedAt.onUpdateFn

    expect(onUpdateFn).toBeTypeOf('function')
    expect((onUpdateFn as () => Date)()).toBeInstanceOf(Date)
  })
})
