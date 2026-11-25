import { RARITY_ORDER } from "@/contexts/shared-kernel/domain/rarity-order";
import { DESCENDING, type SortOrder } from "@/packages/building-blocks/sort";
import type { Comparator } from "@/packages/infrastructure/in-memory-query/comparators/comparator";
import { KeyComparator } from "@/packages/infrastructure/in-memory-query/comparators/key.comparator";
import { RankComparator } from "@/packages/infrastructure/in-memory-query/comparators/rank.comparator";
import { ReversedComparator } from "@/packages/infrastructure/in-memory-query/comparators/reversed.comparator";
import { ChainedComparator } from "@/packages/infrastructure/in-memory-query/comparators/chained.comparator";
import type {
    WantedItemsSort,
    WantedItemsSortField,
} from "../../application/list-wanted-items/list-wanted-items.query";
import type { CatalogDetailsDto } from "../../application/list-wanted-items/catalog-details.gateway";
import { MaxForType } from "../../domain/wanted-item/max-for/max-for";
import type { WantedItemRecord } from "../stores/wanted-item.store.in-memory";

export type WantedItemEntry = {
    record: WantedItemRecord;
    catalog: CatalogDetailsDto | null;
};

const MAX_FOR_TYPE_ORDER = [MaxForType.PERCENTAGE, MaxForType.VALUE];
const UNKNOWN_TYPE_RANK = MAX_FOR_TYPE_ORDER.length;
const NO_RARITY_RANK = -1;

const byAddedAt = new KeyComparator<WantedItemEntry>(({ record }) => record.addedAt);

const FIELD_COMPARATORS: Record<WantedItemsSortField, Comparator<WantedItemEntry>> = {
    addedAt: byAddedAt,
    name: new KeyComparator(({ record }) => record.name),
    max: new ChainedComparator(
        new RankComparator(({ record }) => record.maxFor.type, MAX_FOR_TYPE_ORDER, UNKNOWN_TYPE_RANK),
        new KeyComparator(({ record }) => Number(record.maxFor.value)),
    ),
    rarity: new RankComparator(({ catalog }) => catalog?.rarity, RARITY_ORDER, NO_RARITY_RANK),
};

const newestFirst = new ReversedComparator(byAddedAt);

const inOrder = (comparator: Comparator<WantedItemEntry>, order: SortOrder): Comparator<WantedItemEntry> =>
    order === DESCENDING ? new ReversedComparator(comparator) : comparator;

export const compareWantedItemsBy = ({ field, order }: WantedItemsSort): Comparator<WantedItemEntry> =>
    new ChainedComparator(inOrder(FIELD_COMPARATORS[field], order), newestFirst);
