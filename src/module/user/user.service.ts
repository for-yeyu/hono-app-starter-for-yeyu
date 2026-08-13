const users = [
  {
    id: '1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
  },
  {
    id: '2',
    name: 'Grace Hopper',
    email: 'grace@example.com',
  },
]

export const userService = {
  findMany() {
    return users
  },

  findById(id: string) {
    return users.find(user => user.id === id)
  },

  create(data: { name: string; email: string }) {
    const user = {
      id: crypto.randomUUID(),
      ...data,
    }

    users.push(user)

    return user
  },

  update(id: string, data: { name?: string; email?: string }) {
    const user = users.find(item => item.id === id)

    if (!user) {
      return null
    }

    return Object.assign(user, data)
  },

  delete(id: string) {
    const userIndex = users.findIndex(user => user.id === id)

    if (userIndex === -1) {
      return null
    }

    const [user] = users.splice(userIndex, 1)

    return user
  },
}
