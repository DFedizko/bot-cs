export interface BaseErrorProps {
    message?: string;
    code?: string;
}

export class BaseError extends Error {
    readonly code?: string = "INTERNAL_SERVER_ERROR";

    constructor({ message = "Internal server error", code }: BaseErrorProps) {
        super(message);
        this.code = code;
    }
}
