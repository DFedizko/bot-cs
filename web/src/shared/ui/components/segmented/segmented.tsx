import { RadioGroup } from "@base-ui/react/radio-group";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

type SegmentedProps<TValue extends string> = Omit<ComponentProps<typeof RadioGroup>, "value" | "onValueChange"> & {
    value: TValue;
    onValueChange: (value: TValue) => void;
};

export function Segmented<TValue extends string>({ className, onValueChange, ...props }: SegmentedProps<TValue>) {
    return (
        <RadioGroup
            onValueChange={(value) => onValueChange(value as TValue)}
            className={cn("flex flex-wrap gap-1 rounded-md border border-line bg-surface-2 p-1", className)}
            {...props}
        />
    );
}
