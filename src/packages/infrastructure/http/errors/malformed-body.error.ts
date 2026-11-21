import { HttpStatus } from "../http-status";
import { HttpError } from "./http.error";

export class MalformedBodyError extends HttpError {
    constructor() {
        super({
            message: "The request body is not valid JSON",
            code: "MALFORMED_BODY",
            status: HttpStatus.BAD_REQUEST,
        });
    }
}
