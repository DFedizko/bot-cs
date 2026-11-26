import type { MockWantedItem, MockWantedItemsQuery } from "./mock-wanted-item";

type SortField = NonNullable<MockWantedItemsQuery["sort"]>;
type Compare = (left: MockWantedItem, right: MockWantedItem) => number;
type Rarity = NonNullable<MockWantedItem["catalog"]>["rarity"];

const RARITY_ORDER: ReadonlyArray<Rarity> = [
    "Consumer Grade",
    "Industrial Grade",
    "Mil-Spec Grade",
    "Restricted",
    "Classified",
    "Covert",
    "Extraordinary",
    "Contraband",
];
const UNKNOWN_RANK = -1;
const DESCENDING = -1;
const ASCENDING = 1;

const timeOf = ({ addedAt }: MockWantedItem) => Date.parse(addedAt);

const rarityRank = ({ catalog }: MockWantedItem) => (catalog ? RARITY_ORDER.indexOf(catalog.rarity) : UNKNOWN_RANK);

const maxRank = ({ maxFor }: MockWantedItem): [number, number] =>
    maxFor.type === "percentage" ? [0, Number(maxFor.value)] : [1, maxFor.value];

const compareMax: Compare = (left, right) => {
    const [leftKind, leftValue] = maxRank(left);
    const [rightKind, rightValue] = maxRank(right);
    return leftKind - rightKind || leftValue - rightValue;
};

const COMPARE_BY_FIELD: Readonly<Record<SortField, Compare>> = {
    addedAt: (left, right) => timeOf(left) - timeOf(right),
    name: (left, right) => left.name.localeCompare(right.name),
    max: compareMax,
    rarity: (left, right) => rarityRank(left) - rarityRank(right),
};

const newestFirst: Compare = (left, right) => timeOf(right) - timeOf(left);

export function compareMockWantedItems(query: MockWantedItemsQuery): Compare {
    const compareField = COMPARE_BY_FIELD[query.sort ?? "addedAt"];
    const direction = (query.order ?? "desc") === "desc" ? DESCENDING : ASCENDING;
    return (left, right) => direction * compareField(left, right) || newestFirst(left, right);
}
