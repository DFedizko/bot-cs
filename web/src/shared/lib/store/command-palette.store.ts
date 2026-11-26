import { definePort } from "../define-port";

const COMMAND_PALETTE_STORE_PORT = "CommandPaletteStore";

export type CommandPaletteState = {
    open: boolean;
    setOpen: (open: boolean) => void;
    toggleOpen: () => void;
};

export type UseCommandPaletteStore = <TValue>(selector: (state: CommandPaletteState) => TValue) => TValue;

const { Provider, usePort } = definePort<UseCommandPaletteStore>(COMMAND_PALETTE_STORE_PORT);

export const CommandPaletteStoreProvider = Provider;

export const useCommandPaletteStore: UseCommandPaletteStore = (selector) => usePort()(selector);
