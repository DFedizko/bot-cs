interface BaseErrorProps {
  message?: string
  status?: number
  code?: string
}

export class BaseError extends Error {
  readonly status?: number = 500
  readonly code?: string = 'INTERNAL_SERVER_ERROR'

  constructor({
    message = 'Internal server error',
    status,
    code,
  }: BaseErrorProps) {
    super(message)
    this.status = status
    this.code = code
  }
}
