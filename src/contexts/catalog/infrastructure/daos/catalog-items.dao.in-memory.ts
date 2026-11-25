import type { CatalogRow } from "../../application/catalog-row";
import type { CatalogItemsCriteria, CatalogItemsDao } from "../../application/search-catalog-items/catalog-items.dao";
import type {
    CatalogItemDto,
    SearchCatalogItemsResponse,
} from "../../application/search-catalog-items/search-catalog-items.response";
import { CatalogUnavailableError } from "../../application/search-catalog-items/catalog-unavailable.error";
import type { CatalogStoreInMemory } from "../stores/catalog.store.in-memory";

type Match = { row: CatalogRow; startsWithText: boolean };

const IGNORED_SYMBOLS = /[|()]/g;
const WHITESPACE = /\s+/;
const WORD_SEPARATOR = " ";
const FIRST = 0;
const STARTS_FIRST = -1;
const STARTS_LATER = 1;

export class CatalogItemsDaoInMemory implements CatalogItemsDao {
    constructor(private readonly store: CatalogStoreInMemory) {}

    async search({ text, limit }: CatalogItemsCriteria): Promise<SearchCatalogItemsResponse> {
        if (!this.store.isLoaded()) throw new CatalogUnavailableError();
        const words = this.splitWords(text);
        const matches = this.store
            .list()
            .map((row) => this.matchOf(row, words))
            .filter((match) => match !== undefined);
        const page = matches.toSorted((first, second) => this.compare(first, second)).slice(FIRST, limit);
        return { items: page.map(({ row }) => this.mapToDto(row)) };
    }

    private matchOf(row: CatalogRow, words: string[]): Match | undefined {
        const name = this.splitWords(row.marketHashName).join(WORD_SEPARATOR);
        const holdsEveryWord = words.length > 0 && words.every((word) => name.includes(word));
        return holdsEveryWord ? { row, startsWithText: name.startsWith(words.join(WORD_SEPARATOR)) } : undefined;
    }

    private compare(first: Match, second: Match): number {
        if (first.startsWithText !== second.startsWithText) return first.startsWithText ? STARTS_FIRST : STARTS_LATER;
        return first.row.marketHashName.localeCompare(second.row.marketHashName);
    }

    private splitWords(text: string): string[] {
        return text
            .toLowerCase()
            .replace(IGNORED_SYMBOLS, WORD_SEPARATOR)
            .split(WHITESPACE)
            .filter((word) => word.length > 0);
    }

    private mapToDto(row: CatalogRow): CatalogItemDto {
        const { marketHashName, weapon, skin, wear, stattrak, souvenir, category, rarity, imageUrl } = row;
        return { marketHashName, weapon, skin, wear, stattrak, souvenir, category, rarity, imageUrl };
    }
}
