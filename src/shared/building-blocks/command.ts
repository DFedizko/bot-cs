export abstract class Command {
    public static readonly COMMAND_NAME: string;
    public readonly name: string;
    constructor() {
        this.name = new.target.COMMAND_NAME;
    }
}
