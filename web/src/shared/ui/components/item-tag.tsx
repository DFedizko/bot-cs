import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

type ItemTagKind = "stattrak" | "souvenir";

type ItemTagProps = ComponentProps<"span"> & { kind: ItemTagKind };

const KIND_CLASSES: Readonly<Record<ItemTagKind, string>> = {
    stattrak: "border-stattrak/40 bg-stattrak/15 text-stattrak",
    souvenir: "border-rarity-contraband/40 bg-rarity-contraband/15 text-rarity-contraband",
};

export function ItemTag({ kind, className, ...props }: ItemTagProps) {
    return (
        <span
            className={cn(
                "inline-flex h-5 items-center rounded-sm border px-2 text-label whitespace-nowrap",
                KIND_CLASSES[kind],
                className,
            )}
            {...props}
        />
    );
}
