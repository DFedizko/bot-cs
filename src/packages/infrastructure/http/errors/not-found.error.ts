import { HttpStatus } from "../http-status";
import { HttpError } from "./http.error";

export class NotFoundError extends HttpError {
    constructor(message?: string) {
        super({ message: message ?? "Not found", code: "NOT_FOUND", status: HttpStatus.NOT_FOUND });
    }
}
