import type { ComponentProps } from "react";
import { useInstanceStore } from "@/shared/hooks/useInstanceStore";
import { cn } from "@/shared/lib/cn";
import { useStoreState } from "@/shared/lib/store/useStoreState";
import type { RarityTone } from "@/shared/model/rarity/rarity-tone";
import { RARITY_COLORS } from "./rarity-colors";
import { RarityTileContext } from "./rarity-tile.context";
import type { RarityTileState } from "./rarity-tile.context";

type RarityTileProps = ComponentProps<"div"> & { tone: RarityTone | null };

const LOADING: RarityTileState = { failed: false };

const selectFailed = ({ failed }: RarityTileState) => failed;

export function RarityTile({ tone, className, ...props }: RarityTileProps) {
    const store = useInstanceStore(LOADING);
    const failed = useStoreState(store, selectFailed);
    const tint = tone && !failed ? RARITY_COLORS[tone].tile : null;
    return (
        <RarityTileContext value={store}>
            <div className={cn("relative grid place-items-center bg-surface-3", tint, className)} {...props} />
        </RarityTileContext>
    );
}
