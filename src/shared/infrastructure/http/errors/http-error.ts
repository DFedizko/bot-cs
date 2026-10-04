import { BaseError, BaseErrorProps } from "@/shared/building-blocks/base-error";
import { HttpStatus } from "../http-status";

interface HttpErrorProps extends BaseErrorProps {
    httpStatus?: HttpStatus;
}

export class HttpError extends BaseError {
    public readonly httpStatus: HttpStatus;
    constructor(props?: HttpErrorProps) {
        super({ message: props?.message ?? "Internal server error", code: props?.code ?? "INTERNAL_SERVER_ERROR" });
        this.httpStatus = props?.httpStatus ?? HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
