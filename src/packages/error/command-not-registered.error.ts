import { BaseError } from "../building-blocks/base-error";

export class CommandNotRegisteredError extends BaseError {
    constructor(command: string) {
        super({ message: `Command: "${command}" not registered`, code: "COMMAND_NOT_REGISTERED" });
    }
}
