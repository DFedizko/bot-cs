import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

type CatalogSearchMessageProps = { title?: ReactNode; children: ReactNode };

export function CatalogSearchMessage({ title, children }: CatalogSearchMessageProps) {
    return (
        <section className="flex flex-col items-center gap-2 p-8 text-center">
            {title && (
                <>
                    <span className="mb-2 grid size-12 place-items-center rounded-md border border-line bg-surface-2 text-muted">
                        <SearchX aria-hidden className="size-5" />
                    </span>
                    <h3 className="text-body font-semibold text-ink">{title}</h3>
                </>
            )}
            <p className="max-w-sm text-helper text-muted">{children}</p>
        </section>
    );
}
