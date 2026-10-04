import { Command } from "@/shared/building-blocks/command";

export class FooCommand implements Command {
    public readonly name = "foo_command";
}
