import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { ToggleGroup } from "@/shared/ui/components/toggle-group";

type FilterChipsProps<TValue extends string> = Omit<
    ComponentProps<typeof ToggleGroup>,
    "value" | "onValueChange" | "defaultValue"
> & { value: TValue; onValueChange: (value: TValue) => void };

export function FilterChips<TValue extends string>({
    value,
    onValueChange,
    className,
    ...props
}: FilterChipsProps<TValue>) {
    const selectChosen = ([chosen]: Array<unknown>) => {
        if (typeof chosen === "string") onValueChange(chosen as TValue);
    };
    return <ToggleGroup value={[value]} onValueChange={selectChosen} className={cn("gap-2", className)} {...props} />;
}
