import { Rarity } from "@/contexts/shared-kernel/domain/rarity";
import type {
    CatalogItemDto,
    SearchCatalogItemsResponse,
} from "../../application/search-catalog-items/search-catalog-items.response";

export const CATALOG_RARITY_KEYS = [
    "consumer",
    "industrial",
    "milspec",
    "restricted",
    "classified",
    "covert",
    "extraordinary",
    "contraband",
] as const;

export type CatalogRarityKey = (typeof CATALOG_RARITY_KEYS)[number];

export type CatalogItemBody = Omit<CatalogItemDto, "rarity"> & { rarity: CatalogRarityKey };

export type CatalogItemsBody = { items: CatalogItemBody[] };

const KEY_BY_RARITY: Record<Rarity, CatalogRarityKey> = {
    [Rarity.CONSUMER_GRADE]: "consumer",
    [Rarity.INDUSTRIAL_GRADE]: "industrial",
    [Rarity.MIL_SPEC_GRADE]: "milspec",
    [Rarity.RESTRICTED]: "restricted",
    [Rarity.CLASSIFIED]: "classified",
    [Rarity.COVERT]: "covert",
    [Rarity.EXTRAORDINARY]: "extraordinary",
    [Rarity.CONTRABAND]: "contraband",
};

const mapToItemBody = (item: CatalogItemDto): CatalogItemBody => ({ ...item, rarity: KEY_BY_RARITY[item.rarity] });

export const mapToCatalogItemsBody = ({ items }: SearchCatalogItemsResponse): CatalogItemsBody => ({
    items: items.map(mapToItemBody),
});
