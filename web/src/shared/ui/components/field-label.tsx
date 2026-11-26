import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type FieldLabelProps = ComponentProps<"label"> & { hint?: ReactNode };

export function FieldLabel({ hint, className, children, ...props }: FieldLabelProps) {
    return (
        <span className={cn("flex items-baseline justify-between gap-3", className)}>
            <label className="text-field-label text-ink" {...props}>
                {children}
            </label>
            {hint && <span className="text-xs text-faint">{hint}</span>}
        </span>
    );
}
