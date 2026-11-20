import { DomainError } from "@/packages/error/domain-error";

export class UnknownCriterionError extends DomainError {
    constructor(type: string) {
        super({ message: `Unknown criterion: "${type}"`, code: "UNKNOWN_CRITERION" });
    }
}
