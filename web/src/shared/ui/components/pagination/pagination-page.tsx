import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

type PaginationPageProps = ComponentProps<"button"> & { page: number; isCurrent: boolean };

export function PaginationPage({ page, isCurrent, className, ...props }: PaginationPageProps) {
    return (
        <li>
            <button
                type="button"
                aria-label={`Page ${page}`}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                    "h-8 min-w-8 rounded-md border border-transparent px-2 font-mono text-sm font-medium text-muted outline-none hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:border-line-strong aria-[current=page]:bg-surface-2 aria-[current=page]:text-ink",
                    className,
                )}
                {...props}
            >
                {page}
            </button>
        </li>
    );
}
