import type { RarityTone } from "@/shared/model/rarity/rarity-tone";

type RarityColors = { tile: string; text: string; dot: string };

export const RARITY_COLORS: Readonly<Record<RarityTone, RarityColors>> = {
    consumer: { tile: "rarity-tile-consumer", text: "text-rarity-consumer", dot: "bg-rarity-consumer" },
    industrial: { tile: "rarity-tile-industrial", text: "text-rarity-industrial", dot: "bg-rarity-industrial" },
    milspec: { tile: "rarity-tile-milspec", text: "text-rarity-milspec", dot: "bg-rarity-milspec" },
    restricted: { tile: "rarity-tile-restricted", text: "text-rarity-restricted", dot: "bg-rarity-restricted" },
    classified: { tile: "rarity-tile-classified", text: "text-rarity-classified", dot: "bg-rarity-classified" },
    covert: { tile: "rarity-tile-covert", text: "text-rarity-covert", dot: "bg-rarity-covert" },
    contraband: { tile: "rarity-tile-contraband", text: "text-rarity-contraband", dot: "bg-rarity-contraband" },
};
