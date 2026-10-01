import { BaseError } from './base-error';
import type { ErrorProps } from './error-props';

export class DomainError extends BaseError {
    constructor({ message = 'Domain error', code = 'DOMAIN_ERROR' }: ErrorProps) {
        super({ message, status: 422, code });
    }
}
