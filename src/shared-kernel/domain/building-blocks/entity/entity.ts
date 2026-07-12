import { UUID } from '@/shared-kernel/domain/building-blocks/value-object/uuid'

export abstract class Entity<Props, Id = string> {
  readonly id: Id

  constructor(
    protected readonly props: Props,
    id?: Id,
  ) {
    this.id = id ?? (UUID.create() as Id)
  }

  equals(entity: Entity<Props, Id>): boolean {
    if (entity === undefined || entity === null) return false
    return entity.id === this.id
  }
}
