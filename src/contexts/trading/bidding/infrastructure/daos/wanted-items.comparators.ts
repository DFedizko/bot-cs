import { RARITY_ORDER } from "@/contexts/shared-kernel/domain/rarity-order";
import { ASCENDING, type SortOrder } from "@/packages/building-blocks/sort";
import type {
    WantedItemsSort,
    WantedItemsSortField,
} from "../../application/list-wanted-items/list-wanted-items.query";
import type { CatalogDetailsDto } from "../../application/list-wanted-items/catalog-details.gateway";
import { MaxForType, type MaxForPrimitives } from "../../domain/wanted-item/max-for/max-for";
import type { WantedItemRecord } from "../stores/wanted-item.store.in-memory";

export type WantedItemEntry = {
    record: WantedItemRecord;
    catalog: CatalogDetailsDto | null;
};

type Comparator = (first: WantedItemEntry, second: WantedItemEntry) => number;

type FieldComparators = {
    group: Comparator;
    value: Comparator;
};

const MAX_FOR_TYPE_ORDER = [MaxForType.PERCENTAGE, MaxForType.VALUE];
const KNOWN_FIRST = [true, false];
const SAME_GROUP: Comparator = () => 0;

const byAddedAt: Comparator = (first, second) => first.record.addedAt - second.record.addedAt;

const byName: Comparator = (first, second) => first.record.name.localeCompare(second.record.name);

const typeRankOf = ({ type }: MaxForPrimitives): number => MAX_FOR_TYPE_ORDER.indexOf(type);

const byMaxForType: Comparator = (first, second) => typeRankOf(first.record.maxFor) - typeRankOf(second.record.maxFor);

const byMaxValue: Comparator = (first, second) =>
    Number(first.record.maxFor.value) - Number(second.record.maxFor.value);

const knownRankOf = ({ catalog }: WantedItemEntry): number => KNOWN_FIRST.indexOf(catalog !== null);

const byCatalogKnown: Comparator = (first, second) => knownRankOf(first) - knownRankOf(second);

const rarityRankOf = ({ catalog }: WantedItemEntry): number => (catalog ? RARITY_ORDER.indexOf(catalog.rarity) : 0);

const byRarity: Comparator = (first, second) => rarityRankOf(first) - rarityRankOf(second);

const FIELD_COMPARATORS = {
    addedAt: { group: SAME_GROUP, value: byAddedAt },
    name: { group: SAME_GROUP, value: byName },
    max: { group: byMaxForType, value: byMaxValue },
    rarity: { group: byCatalogKnown, value: byRarity },
} satisfies Record<WantedItemsSortField, FieldComparators>;

const thenBy =
    (primary: Comparator, secondary: Comparator): Comparator =>
    (first, second) =>
        primary(first, second) || secondary(first, second);

const reversed =
    (comparator: Comparator): Comparator =>
    (first, second) =>
        comparator(second, first);

const inOrder = (comparator: Comparator, order: SortOrder): Comparator =>
    order === ASCENDING ? comparator : reversed(comparator);

const newestFirst = reversed(byAddedAt);

export const compareWantedItemsBy = ({ field, order }: WantedItemsSort): Comparator => {
    const { group, value } = FIELD_COMPARATORS[field];
    return thenBy(thenBy(group, inOrder(value, order)), newestFirst);
};
