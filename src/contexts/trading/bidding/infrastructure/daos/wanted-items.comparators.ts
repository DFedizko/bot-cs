import type { WantedItemsSortKey } from "../../application/list-wanted-items/list-wanted-items.query";
import type { CatalogDetailsDto } from "../../application/list-wanted-items/catalog-details.gateway";
import { RARITY_ORDER } from "@/contexts/shared-kernel/domain/rarity-order";
import { MaxForType, type MaxForPrimitives } from "../../domain/wanted-item/max-for/max-for";
import type { WantedItemRecord } from "../stores/wanted-item.store.in-memory";

export type WantedItemEntry = {
    record: WantedItemRecord;
    catalog: CatalogDetailsDto | null;
};

type Comparator = (first: WantedItemEntry, second: WantedItemEntry) => number;

const MAX_FOR_TYPE_ORDER = [MaxForType.PERCENTAGE, MaxForType.VALUE];
const NO_RARITY_RANK = -1;

const byAddedAtDesc: Comparator = (first, second) => second.record.addedAt - first.record.addedAt;

const byName: Comparator = (first, second) => first.record.name.localeCompare(second.record.name);

const typeRankOf = ({ type }: MaxForPrimitives): number => MAX_FOR_TYPE_ORDER.indexOf(type);

const byMaxForType: Comparator = (first, second) => typeRankOf(first.record.maxFor) - typeRankOf(second.record.maxFor);

const byMaxValue: Comparator = (first, second) =>
    Number(first.record.maxFor.value) - Number(second.record.maxFor.value);

const thenBy =
    (primary: Comparator, secondary: Comparator): Comparator =>
    (first, second) =>
        primary(first, second) || secondary(first, second);

const reversed =
    (comparator: Comparator): Comparator =>
    (first, second) =>
        comparator(second, first);

const rarityRankOf = ({ catalog }: WantedItemEntry): number =>
    catalog ? RARITY_ORDER.indexOf(catalog.rarity) : NO_RARITY_RANK;

const byRarityDesc: Comparator = (first, second) => rarityRankOf(second) - rarityRankOf(first);

const COMPARATORS = {
    recent: byAddedAtDesc,
    "name-asc": byName,
    "name-desc": reversed(byName),
    "max-asc": thenBy(byMaxForType, byMaxValue),
    "max-desc": thenBy(byMaxForType, reversed(byMaxValue)),
    rarity: byRarityDesc,
} satisfies Record<WantedItemsSortKey, Comparator>;

export const compareWantedItemsBy = (sort: WantedItemsSortKey): Comparator => thenBy(COMPARATORS[sort], byAddedAtDesc);
