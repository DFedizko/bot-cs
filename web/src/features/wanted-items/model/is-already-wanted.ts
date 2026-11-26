import { AlreadyWantedError } from "./already-wanted.error";

export const isAlreadyWanted = (error: unknown) => error instanceof AlreadyWantedError;
