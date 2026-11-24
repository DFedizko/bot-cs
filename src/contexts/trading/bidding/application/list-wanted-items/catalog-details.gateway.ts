export const CATALOG_RARITIES = [
    "consumer",
    "industrial",
    "milspec",
    "restricted",
    "classified",
    "covert",
    "extraordinary",
    "contraband",
] as const;

export type CatalogRarity = (typeof CATALOG_RARITIES)[number];

export type CatalogDetailsDto = {
    imageUrl: string;
    rarity: CatalogRarity;
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
