import { splitHighlights } from "../../../model/split-highlights";

type HighlightedNameProps = { name: string; query: string };

export function HighlightedName({ name, query }: HighlightedNameProps) {
    return (
        <span className="truncate text-body font-medium text-ink">
            {splitHighlights(name, query).map(({ text, match }, index) =>
                match ? (
                    <mark key={index} className="rounded-sm bg-accent/25 text-ink">
                        {text}
                    </mark>
                ) : (
                    text
                ),
            )}
        </span>
    );
}
