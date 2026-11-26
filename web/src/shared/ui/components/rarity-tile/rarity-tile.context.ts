import { createContext, use } from "react";
import type { Store } from "@/shared/lib/store/store";

export type RarityTileState = { failed: boolean };

export const RarityTileContext = createContext<Store<RarityTileState> | null>(null);

export function useRarityTileStore(part: string): Store<RarityTileState> {
    const store = use(RarityTileContext);
    if (!store) throw new Error(`${part} must be used inside RarityTile`);
    return store;
}
