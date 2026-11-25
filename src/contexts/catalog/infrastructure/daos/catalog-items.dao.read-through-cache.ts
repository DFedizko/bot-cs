import type { Logger } from "@/packages/application/logger";
import type { CatalogItemsCriteria, CatalogItemsDao } from "../../application/search-catalog-items/catalog-items.dao";
import type {
    CatalogItemDto,
    SearchCatalogItemsResponse,
} from "../../application/search-catalog-items/search-catalog-items.response";
import { CatalogUnavailableError } from "../../application/search-catalog-items/catalog-unavailable.error";
import type { CatalogRow, CatalogSource } from "../sources/catalog.source";

type Match = { row: CatalogRow; startsWithText: boolean };

const IGNORED_SYMBOLS = /[|()]/g;
const WHITESPACE = /\s+/;
const WORD_SEPARATOR = " ";
const FIRST = 0;
const STARTS_FIRST = -1;
const STARTS_LATER = 1;

export class CatalogItemsDaoReadThroughCache implements CatalogItemsDao {
    private rows?: readonly CatalogRow[];
    private loading?: Promise<void>;

    constructor(
        private readonly source: CatalogSource,
        private readonly logger: Logger,
    ) {}

    warmUp(): Promise<void> {
        if (this.rows) return Promise.resolve();
        this.loading ??= this.load().finally(() => (this.loading = undefined));
        return this.loading;
    }

    async search({ text, limit }: CatalogItemsCriteria): Promise<SearchCatalogItemsResponse> {
        if (!this.rows) return this.refuseWhileLoading();
        const words = this.splitWords(text);
        const matches = this.rows.map((row) => this.matchOf(row, words)).filter((match) => match !== undefined);
        const found = matches.toSorted((first, second) => this.compare(first, second)).slice(FIRST, limit);
        return { items: found.map(({ row }) => this.mapToDto(row)) };
    }

    private async load(): Promise<void> {
        try {
            const rows = await this.source.load();
            this.rows = rows.map((row) => ({ ...row }));
            this.logger.log(`Catalog loaded: ${rows.length} items`);
        } catch (error) {
            this.logger.log(`Could not load the catalog: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private refuseWhileLoading(): never {
        void this.warmUp();
        throw new CatalogUnavailableError();
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
