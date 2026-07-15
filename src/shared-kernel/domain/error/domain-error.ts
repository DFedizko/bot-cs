import { BaseError, type BaseErrorProps } from './base-error'

export class DomainError extends BaseError {
  constructor({
    message = 'Domain error',
    code = 'DOMAIN_ERROR',
  }: BaseErrorProps) {
    super({ message, status: 422, code })
  }
}
