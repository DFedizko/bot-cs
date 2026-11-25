export type InvalidField = {
    path: string;
    message: string;
};

export type HttpErrorBody = {
    code: string;
    message: string;
    fields?: InvalidField[];
};

export type HttpErrorProps = HttpErrorBody & {
    status?: number;
};

export class HttpError extends Error {
    static readonly ERROR_NAME = "HttpError";
    static readonly INVALID_REQUEST = "INVALID_REQUEST";
    static readonly NETWORK_ERROR = "NETWORK_ERROR";
    static readonly UNEXPECTED_RESPONSE = "UNEXPECTED_RESPONSE";

    readonly status?: number;
    readonly code: string;
    readonly fields: InvalidField[];

    constructor({ status, code, message, fields = [] }: HttpErrorProps) {
        super(message);
        this.name = HttpError.ERROR_NAME;
        this.status = status;
        this.code = code;
        this.fields = fields;
    }
}
