import UUID from '../VO/UUID.js'

export default abstract class Entity {
  #id: UUID
  #createdAt: Date

  constructor ({
    id = new UUID(),
    createdAt = new Date()
  }: {
    id?: UUID,
    createdAt?: Date
  }) {
    if (!(id instanceof UUID)) {
      throw new TypeError('Invalid id')
    }
    if (
      !(createdAt instanceof Date)
      // || createdAt.getTime() < Date.now()
    ) {
      throw new TypeError('Invalid createdAt')
    }

    this.#id = id
    this.#createdAt = createdAt
  }

  get id () {
    return this.#id
  }

  get createdAt () {
    return this.#createdAt
  }
}
