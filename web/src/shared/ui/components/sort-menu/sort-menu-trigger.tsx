import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { DropdownMenuTrigger } from "@/shared/ui/components/dropdown-menu";

const CHEVRON_STROKE = 2;

export function SortMenuTrigger({ className, children, ...props }: ComponentProps<typeof DropdownMenuTrigger>) {
    return (
        <DropdownMenuTrigger
            className={cn(
                "inline-flex h-8 items-center gap-2 rounded-md border border-line px-3 text-sm font-medium whitespace-nowrap text-ink outline-none hover:border-line-strong focus-visible:ring-2 focus-visible:ring-ring data-popup-open:border-line-strong data-popup-open:bg-surface-2 [&_svg]:size-4 [&_svg]:text-muted",
                className,
            )}
            {...props}
        >
            <span className="font-normal text-faint">Sort:</span>
            {children}
            <ChevronDown aria-hidden className="size-3! text-faint!" strokeWidth={CHEVRON_STROKE} />
        </DropdownMenuTrigger>
    );
}
