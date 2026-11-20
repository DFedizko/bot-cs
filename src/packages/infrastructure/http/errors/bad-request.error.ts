import { HttpStatus } from "../http-status";
import { HttpError } from "./http.error";

export class BadRequestError extends HttpError {
    constructor(message?: string) {
        super({ message: message ?? "Bad request", code: "BAD_REQUEST", status: HttpStatus.BAD_REQUEST });
    }
}
