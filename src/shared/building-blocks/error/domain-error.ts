import { BaseError } from './base-error'
import type { CustomErrorProps } from './custom-error-props'

export class DomainError extends BaseError {
  constructor({
    message = 'Domain error',
    code = 'DOMAIN_ERROR',
  }: CustomErrorProps) {
    super({ message, status: 422, code })
  }
}
