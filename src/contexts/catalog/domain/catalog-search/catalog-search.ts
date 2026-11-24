export type Searchable = {
    readonly marketHashName: string;
};

const IGNORED_SYMBOLS = /[|()]/g;
const WHITESPACE = /\s+/;
const WORD_SEPARATOR = " ";
const SAME_RANK = 0;
const BEFORE = -1;
const AFTER = 1;

export class CatalogSearch {
    static readonly MIN_TEXT_LENGTH = 2;
    static readonly DEFAULT_LIMIT = 20;
    static readonly MAX_LIMIT = 50;

    private readonly words: string[];
    private readonly phrase: string;

    constructor(text: string) {
        this.words = CatalogSearch.splitWords(text);
        this.phrase = this.words.join(WORD_SEPARATOR);
    }

    find<T extends Searchable>(items: readonly T[], limit: number = CatalogSearch.DEFAULT_LIMIT): T[] {
        return items
            .filter((item) => this.matches(item))
            .toSorted((first, second) => this.compare(first, second))
            .slice(0, limit);
    }

    private matches({ marketHashName }: Searchable): boolean {
        const name = CatalogSearch.normalize(marketHashName);
        return this.words.length > 0 && this.words.every((word) => name.includes(word));
    }

    private compare(first: Searchable, second: Searchable): number {
        const byRank = this.rankOf(first) - this.rankOf(second);
        return byRank === SAME_RANK ? first.marketHashName.localeCompare(second.marketHashName) : byRank;
    }

    private rankOf({ marketHashName }: Searchable): number {
        return CatalogSearch.normalize(marketHashName).startsWith(this.phrase) ? BEFORE : AFTER;
    }

    private static normalize(text: string): string {
        return CatalogSearch.splitWords(text).join(WORD_SEPARATOR);
    }

    private static splitWords(text: string): string[] {
        return text
            .toLowerCase()
            .replace(IGNORED_SYMBOLS, WORD_SEPARATOR)
            .split(WHITESPACE)
            .filter((word) => word.length > 0);
    }
}
