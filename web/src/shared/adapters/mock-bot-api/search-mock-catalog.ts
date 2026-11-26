import type { MockCatalogItem } from "./mock-catalog-item";

const DEFAULT_LIMIT = 20;
const IGNORED_MARKS = /[|()]/g;
const SPACES = /\s+/;

const normalize = (text: string) => text.replace(IGNORED_MARKS, " ").toLowerCase().trim();

const holdsEveryWord = (words: Array<string>) => (item: MockCatalogItem) =>
    words.every((word) => normalize(item.marketHashName).includes(word));

const startsWithFirst = (text: string) => (left: MockCatalogItem, right: MockCatalogItem) =>
    Number(!normalize(left.marketHashName).startsWith(text)) -
        Number(!normalize(right.marketHashName).startsWith(text)) ||
    left.marketHashName.localeCompare(right.marketHashName);

export function searchMockCatalog(
    catalog: ReadonlyArray<MockCatalogItem>,
    text: string,
    limit = DEFAULT_LIMIT,
): Array<MockCatalogItem> {
    const normalized = normalize(text);
    const words = normalized.split(SPACES).filter(Boolean);
    return catalog.filter(holdsEveryWord(words)).sort(startsWithFirst(normalized)).slice(0, limit);
}
