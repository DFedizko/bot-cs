import { DomainError } from "@/packages/error/domain-error";

export class UnknownMaxForError extends DomainError {
    constructor(type: string) {
        super({ message: `Unknown max for type: "${type}"`, code: "UNKNOWN_MAX_FOR" });
    }
}
