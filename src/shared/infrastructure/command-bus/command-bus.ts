import type { Command } from "@/shared/building-blocks/command";

export interface CommandBus {
    dispatch(command: Command): Promise<void>;
}
