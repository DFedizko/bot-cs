import { HttpStatus } from "../http-status";
import { HttpError } from "./http.error";

export class InternalServerError extends HttpError {
    constructor(message?: string) {
        super({
            message: message ?? "Internal server error",
            code: "INTERNAL_SERVER_ERROR",
            status: HttpStatus.INTERNAL_SERVER_ERROR,
        });
    }
}
