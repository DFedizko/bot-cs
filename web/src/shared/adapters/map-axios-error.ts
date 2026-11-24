import { isAxiosError } from "axios";
import { HttpError } from "@/shared/lib/http/http-error";
import type { HttpErrorBody } from "@/shared/lib/http/http-error";

const isBotErrorBody = (data: unknown): data is HttpErrorBody =>
    typeof data === "object" &&
    data !== null &&
    typeof (data as HttpErrorBody).code === "string" &&
    typeof (data as HttpErrorBody).message === "string";

const toUnknownError = (error: unknown) =>
    new HttpError({
        code: HttpError.UNEXPECTED_RESPONSE,
        message: error instanceof Error ? error.message : String(error),
    });

export function mapAxiosError(error: unknown): HttpError {
    if (error instanceof HttpError) return error;
    if (!isAxiosError(error)) return toUnknownError(error);
    if (!error.response) return new HttpError({ code: HttpError.NETWORK_ERROR, message: error.message });
    const { status, data } = error.response;
    if (isBotErrorBody(data)) return new HttpError({ status, ...data });
    return new HttpError({ status, code: HttpError.UNEXPECTED_RESPONSE, message: error.message });
}
