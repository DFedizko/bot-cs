import type { paths } from "@/shared/api/bot-api";
import type { MockCatalogItem } from "./mock-catalog-item";
import type { MockWantedItem } from "./mock-wanted-item";

export type MockNewWantedItem = NonNullable<
    paths["/accounts/{accountId}/wanted-items"]["post"]["requestBody"]
>["content"]["application/json"];

const VANILLA_SKIN = "Vanilla";

const toMaxFor = ({ maxFor }: MockNewWantedItem): MockWantedItem["maxFor"] =>
    maxFor.type === "percentage" ? { type: "percentage", value: String(maxFor.value) } : maxFor;

const toCatalog = (item: MockCatalogItem | undefined): MockWantedItem["catalog"] => {
    if (!item) return null;
    const { imageUrl, rarity, weapon, skin, wear, stattrak, souvenir } = item;
    return { imageUrl, rarity, weapon, skin: skin ?? VANILLA_SKIN, wear, stattrak, souvenir };
};

export const toMockWantedItem = (
    body: MockNewWantedItem,
    catalogItem: MockCatalogItem | undefined,
    addedAt: string,
): MockWantedItem => ({
    name: body.name,
    maxFor: toMaxFor(body),
    criteria: body.criteria ?? [],
    enabled: true,
    addedAt,
    catalog: toCatalog(catalogItem),
});
