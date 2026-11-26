import { MOCK_CATALOG_CATEGORIES } from "./mock-catalog-categories";
import { MOCK_CATALOG_EXAMPLES } from "./mock-catalog-examples";
import { MOCK_WEARS } from "./mock-wears";
import type { MockCatalogItem } from "./mock-catalog-item";
import { toMockMarketName } from "./to-mock-market-name";

type MockCatalog = Omit<(typeof MOCK_CATALOG_EXAMPLES)[number], "wear"> & { wear: MockCatalogItem["wear"] };

const STATTRAK_VARIANTS = [false, true];
const VANILLA_KARAMBIT_IMAGE =
    "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XuWbwcuyMESA4Fdl-4nnpU7iQA3-kKnr8ytd6s2labZsLfKaGinEx-0u5LhqGHrjlElz52jRmN2sd3yfb1NzWZVwRbNeu0S5k9WxMuvh-UWA3ObnwJvj";
const VANILLA_KARAMBIT = {
    weapon: "Karambit",
    skin: null,
    wear: null,
    souvenir: false,
    category: "Knives",
    rarity: "Covert",
    imageUrl: VANILLA_KARAMBIT_IMAGE,
} as const;

const toCatalogItem = (catalog: MockCatalog): MockCatalogItem => {
    const parts = { ...catalog, category: MOCK_CATALOG_CATEGORIES[catalog.weapon] };
    return { ...parts, marketHashName: toMockMarketName(parts) };
};

const variantsOf = (wear: MockCatalogItem["wear"]) =>
    STATTRAK_VARIANTS.flatMap((stattrak) => MOCK_CATALOG_EXAMPLES.map((example) => ({ ...example, wear, stattrak })));

const vanillaKarambit = (stattrak: boolean): MockCatalogItem => ({
    ...VANILLA_KARAMBIT,
    stattrak,
    marketHashName: toMockMarketName({ ...VANILLA_KARAMBIT, stattrak }),
});

export function createMockCatalog(): Array<MockCatalogItem> {
    return [...MOCK_WEARS.flatMap(variantsOf).map(toCatalogItem), ...STATTRAK_VARIANTS.map(vanillaKarambit)];
}
