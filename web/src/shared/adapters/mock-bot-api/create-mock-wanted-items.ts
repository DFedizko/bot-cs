import { MOCK_CATALOG_EXAMPLES } from "./mock-catalog-examples";
import type { MockWantedItem } from "./mock-wanted-item";
import { MOCK_CATALOG_CATEGORIES } from "./mock-catalog-categories";
import { MOCK_WEARS } from "./mock-wears";
import { toMockMarketName } from "./to-mock-market-name";

type MockCatalog = NonNullable<MockWantedItem["catalog"]>;
type MaxFor = MockWantedItem["maxFor"];

const STATTRAK_VARIANTS = [false, true];
const UNKNOWN_ITEM_NAMES = [
    "Sticker | Titan (Holo) | Katowice 2014",
    "Sticker | iBUYPOWER (Holo) | Katowice 2014",
    "Kilowatt Case",
    "Sticker | Crown (Foil)",
    "Sir Bloody Darryl Royale | The Professionals",
    "Music Kit | Daniel Sadowski, Crimson Assault",
    "Souvenir Package | Copenhagen 2024",
];
const PERCENTAGES = ["-3", "2", "-5", "0", "-4", "1", "-6", "-2", "-1", "3", "-8"];
const FIXED_VALUE_EVERY = 7;
const FIXED_VALUE_STEP = 1250;
const UNKNOWN_ITEM_EVERY = 6;
const PAUSED_POSITIONS = new Set([2, 8, 12, 19, 27, 40]);
const NEWEST_ADDED_AT = Date.parse("2026-11-20T14:03:00.000Z");
const HOUR = 3_600_000;

const nameOf = (catalog: MockCatalog) =>
    toMockMarketName({ ...catalog, category: MOCK_CATALOG_CATEGORIES[catalog.weapon] });

const variantsOf = (wear: MockCatalog["wear"]): Array<MockCatalog> =>
    STATTRAK_VARIANTS.flatMap((stattrak) => MOCK_CATALOG_EXAMPLES.map((example) => ({ ...example, wear, stattrak })));

const maxForAt = (position: number): MaxFor =>
    position % FIXED_VALUE_EVERY === FIXED_VALUE_EVERY - 1
        ? { type: "value", value: (position + 1) * FIXED_VALUE_STEP }
        : { type: "percentage", value: PERCENTAGES[position % PERCENTAGES.length] };

const toWantedItem = ([name, catalog]: [string, MockCatalog | null], position: number): MockWantedItem => ({
    name,
    maxFor: maxForAt(position),
    criteria: catalog?.wear ? [{ type: "IsWear", value: catalog.wear }] : [],
    enabled: !PAUSED_POSITIONS.has(position),
    addedAt: new Date(NEWEST_ADDED_AT - position * HOUR).toISOString(),
    catalog,
});

const interleave = (catalogued: Array<[string, MockCatalog]>, unknown: Array<[string, null]>) =>
    catalogued.flatMap((entry, position) => {
        const extra = unknown.at(position / UNKNOWN_ITEM_EVERY);
        return position % UNKNOWN_ITEM_EVERY === 0 && extra ? [entry, extra] : [entry];
    });

export function createMockWantedItems(): Array<MockWantedItem> {
    const catalogued = MOCK_WEARS.flatMap(variantsOf).map((catalog): [string, MockCatalog] => [
        nameOf(catalog),
        catalog,
    ]);
    const unknown = UNKNOWN_ITEM_NAMES.map((name): [string, null] => [name, null]);
    return interleave(catalogued, unknown).map(toWantedItem);
}
