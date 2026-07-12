import { BaseError, type BaseErrorProps } from './base-error'

export class DomainError extends BaseError {
  constructor({
    message = 'Domain error',
    status = 422,
    code = 'DOMAIN_ERROR',
  }: BaseErrorProps) {
    super({ message, status, code })
  }
}
