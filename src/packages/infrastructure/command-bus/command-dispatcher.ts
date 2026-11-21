import type { Command } from "@/packages/building-blocks/command";

export type DispatchContext = Record<string, string | number>;

export interface CommandDispatcher {
    dispatch(command: Command, context: DispatchContext): Promise<void>;
}
