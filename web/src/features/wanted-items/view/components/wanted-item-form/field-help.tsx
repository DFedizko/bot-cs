import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

type FieldHelpProps = ComponentProps<"p"> & { error: string | null; hint: string };

export function FieldHelp({ error, hint, className, ...props }: FieldHelpProps) {
    return (
        <p className={cn("text-xs", error ? "text-danger" : "text-muted", className)} {...props}>
            {error ?? hint}
        </p>
    );
}
