import type { ComponentProps } from "react";
import { DropdownMenu } from "@/shared/ui/components/dropdown-menu";

export function SortMenu(props: ComponentProps<typeof DropdownMenu>) {
    return <DropdownMenu {...props} />;
}
