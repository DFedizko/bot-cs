import type { RarityTone } from "@/shared/model/rarity/rarity-tone";

type RarityColors = { tile: string; text: string; dot: string };

export const RARITY_COLORS: Readonly<Record<RarityTone, RarityColors>> = {
    consumer: { tile: "has-[img]:rarity-tile-consumer", text: "text-rarity-consumer", dot: "bg-rarity-consumer" },
    industrial: {
        tile: "has-[img]:rarity-tile-industrial",
        text: "text-rarity-industrial",
        dot: "bg-rarity-industrial",
    },
    milspec: { tile: "has-[img]:rarity-tile-milspec", text: "text-rarity-milspec", dot: "bg-rarity-milspec" },
    restricted: {
        tile: "has-[img]:rarity-tile-restricted",
        text: "text-rarity-restricted",
        dot: "bg-rarity-restricted",
    },
    classified: {
        tile: "has-[img]:rarity-tile-classified",
        text: "text-rarity-classified",
        dot: "bg-rarity-classified",
    },
    covert: { tile: "has-[img]:rarity-tile-covert", text: "text-rarity-covert", dot: "bg-rarity-covert" },
    contraband: {
        tile: "has-[img]:rarity-tile-contraband",
        text: "text-rarity-contraband",
        dot: "bg-rarity-contraband",
    },
};
