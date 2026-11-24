import { isAxiosError } from "axios";
import { HttpError } from "@/shared/lib/http/http-error";
import type { HttpErrorBody } from "@/shared/lib/http/http-error";

const isBotErrorBody = (data: unknown): data is HttpErrorBody =>
    typeof data === "object" &&
    data !== null &&
    typeof (data as HttpErrorBody).code === "string" &&
    typeof (data as HttpErrorBody).message === "string";

const toInvalidRequest = (error: unknown) =>
    new HttpError({
        code: HttpError.INVALID_REQUEST,
        message: error instanceof Error ? error.message : String(error),
    });

export function mapAxiosError(error: unknown): HttpError {
    if (!isAxiosError(error)) return toInvalidRequest(error);
    if (!error.response) return new HttpError({ code: HttpError.NETWORK_ERROR, message: error.message });
    const { status, data } = error.response;
    if (isBotErrorBody(data)) return new HttpError({ status, ...data });
    return new HttpError({ status, code: HttpError.UNEXPECTED_RESPONSE, message: error.message });
}
