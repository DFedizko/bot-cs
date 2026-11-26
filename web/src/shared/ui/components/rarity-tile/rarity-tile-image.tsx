import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { sizeSteamImage } from "@/shared/lib/size-steam-image";
import { useStoreState } from "@/shared/lib/store/useStoreState";
import { useRarityTileStore } from "./rarity-tile.context";
import type { RarityTileState } from "./rarity-tile.context";

type RarityTileImageProps = Omit<ComponentProps<"img">, "src"> & { src: string | null; size: number };

const PART = "RarityTileImage";

const selectFailed = ({ failed }: RarityTileState) => failed;
const markFailed = (): RarityTileState => ({ failed: true });

export function RarityTileImage({ src, size, alt = "", className, ...props }: RarityTileImageProps) {
    const store = useRarityTileStore(PART);
    const failed = useStoreState(store, selectFailed);
    if (!src || failed) return null;
    return (
        <img
            src={sizeSteamImage(src, size)}
            alt={alt}
            loading="lazy"
            onError={() => store.setState(markFailed)}
            className={cn("object-contain drop-shadow-lg", className)}
            {...props}
        />
    );
}
