import type { Command } from "@/packages/building-blocks/command";

export interface CommandBus {
    dispatch(command: Command): Promise<void>;
}
