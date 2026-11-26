import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { sizeSteamImage } from "@/shared/lib/size-steam-image";
import { useFailedImagesStore } from "@/shared/lib/store/failed-images.store";

type RarityTileImageProps = Omit<ComponentProps<"img">, "src"> & { src: string | null; size: number };

const NO_IMAGE = "";

export function RarityTileImage({ src, size, alt = "", className, ...props }: RarityTileImageProps) {
    const imageUrl = src ? sizeSteamImage(src, size) : NO_IMAGE;
    const failed = useFailedImagesStore((state) => state.failedImages.includes(imageUrl));
    const markImageFailed = useFailedImagesStore((state) => state.markImageFailed);
    if (!imageUrl || failed) return null;
    return (
        <img
            src={imageUrl}
            alt={alt}
            loading="lazy"
            onError={() => markImageFailed(imageUrl)}
            className={cn("object-contain drop-shadow-lg", className)}
            {...props}
        />
    );
}
