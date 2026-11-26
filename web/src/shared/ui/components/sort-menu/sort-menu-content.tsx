import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import {
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
} from "@/shared/ui/components/dropdown-menu";

type SortMenuContentProps<TValue extends string> = Omit<ComponentProps<typeof DropdownMenuContent>, "children"> & {
    value: TValue;
    onValueChange: (value: TValue) => void;
    children: ComponentProps<typeof DropdownMenuRadioGroup>["children"];
};

export function SortMenuContent<TValue extends string>({
    value,
    onValueChange,
    className,
    children,
    ...props
}: SortMenuContentProps<TValue>) {
    return (
        <DropdownMenuContent align="end" className={cn("w-auto min-w-64 p-1", className)} {...props}>
            <DropdownMenuGroup>
                <DropdownMenuLabel className="px-3 py-2 text-label text-faint">Sort by</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={value} onValueChange={(chosen) => onValueChange(chosen as TValue)}>
                    {children}
                </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
        </DropdownMenuContent>
    );
}
