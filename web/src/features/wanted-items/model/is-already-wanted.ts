import { HttpError } from "@/shared/lib/http/http-error";

const CONFLICT = 409;

export const isAlreadyWanted = (error: unknown) => error instanceof HttpError && error.status === CONFLICT;
