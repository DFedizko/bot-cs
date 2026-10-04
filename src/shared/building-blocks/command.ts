export abstract class Command {
    public static readonly COMMAND_NAME: string;
    public readonly name: string;
    constructor() {
        this.name = Command.COMMAND_NAME;
    }
}
