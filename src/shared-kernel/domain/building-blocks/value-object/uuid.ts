import { DomainError } from '@/shared-kernel/domain/error/domain-error'
import { ValueObject } from '@/shared-kernel/domain/building-blocks/value-object/value-object'

export class UUID extends ValueObject<{ value: string }> {
  private static readonly REGEX: RegExp =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  private constructor(private readonly _value: string) {
    super({ value: _value })
  }

  static create(): UUID {
    return new UUID(crypto.randomUUID())
  }

  static restore(value: string): UUID {
    if (!UUID.isValid(value)) {
      throw new DomainError({
        message: `The uuid ${value} is invalid`,
        code: 'INVALID_UUID',
      })
    }

    return new UUID(value)
  }

  get value(): string {
    return this._value
  }

  static isValid(value: string): boolean {
    return UUID.REGEX.test(value)
  }
}
