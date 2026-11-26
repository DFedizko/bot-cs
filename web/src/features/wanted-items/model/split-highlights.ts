export type Highlight = { text: string; match: boolean };

const SPACES = /\s+/;
const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g;
const ESCAPED = "\\$&";
const IGNORE_CASE_ALL = "gi";

const escapeWord = (word: string) => word.replace(REGEX_SPECIALS, ESCAPED);

const toMatcher = (words: Array<string>) => new RegExp(`(${words.map(escapeWord).join("|")})`, IGNORE_CASE_ALL);

export function splitHighlights(text: string, query: string): Array<Highlight> {
    const words = query.trim().split(SPACES).filter(Boolean);
    if (words.length === 0) return [{ text, match: false }];
    const matcher = toMatcher(words);
    return text
        .split(matcher)
        .filter(Boolean)
        .map((part) => ({ text: part, match: words.some((word) => word.toLowerCase() === part.toLowerCase()) }));
}
