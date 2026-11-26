import { Radio } from "@base-ui/react/radio";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function SegmentedItem({ className, ...props }: ComponentProps<typeof Radio.Root>) {
    return (
        <Radio.Root
            className={cn(
                "grow cursor-pointer rounded-sm px-1 py-2 text-center text-xs font-medium whitespace-nowrap text-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring data-checked:bg-ground data-checked:text-ink data-checked:ring-1 data-checked:ring-line-strong",
                className,
            )}
            {...props}
        />
    );
}
