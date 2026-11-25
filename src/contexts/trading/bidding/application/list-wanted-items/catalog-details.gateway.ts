import type { Rarity } from "@/contexts/shared-kernel/domain/rarity";

export type CatalogDetailsDto = {
    imageUrl: string;
    rarity: Rarity;
    weapon: string;
    skin: string;
    wear: string | null;
    stattrak: boolean;
    souvenir: boolean;
};

export type CatalogDetailsByName = ReadonlyMap<string, CatalogDetailsDto>;

export interface CatalogDetailsGateway {
    findByNames(names: string[]): Promise<CatalogDetailsByName>;
}
