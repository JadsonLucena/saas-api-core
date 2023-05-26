import UUID from '../VO/UUID.js'

export default abstract class Entity {
  readonly id: UUID
  readonly createdAt: Date

  constructor ({
    id = new UUID(),
    createdAt = new Date()
  }: {
    id?: UUID,
    createdAt?: Date
  }) {
    this.id = id
    this.createdAt = createdAt
  }
}
