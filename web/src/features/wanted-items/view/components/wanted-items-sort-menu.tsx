import { Fragment } from "react";
import {
    SortMenu,
    SortMenuContent,
    SortMenuOption,
    SortMenuSeparator,
    SortMenuTrigger,
} from "@/shared/ui/components/sort-menu";
import type { WantedItemsSort } from "../../model/wanted-items-sort";
import { WANTED_ITEMS_SORT_OPTIONS } from "../../model/wanted-items-sort-options";
import { SORT_ICONS } from "./sort-icons";

type WantedItemsSortMenuProps = { value: WantedItemsSort; onValueChange: (sort: WantedItemsSort) => void };

const SORTS = Object.keys(WANTED_ITEMS_SORT_OPTIONS) as Array<WantedItemsSort>;
const FIRST_MAX_SORT: WantedItemsSort = "max-asc";
const ICON_STROKE = 1.7;

export function WantedItemsSortMenu({ value, onValueChange }: WantedItemsSortMenuProps) {
    const CurrentIcon = SORT_ICONS[value];
    return (
        <SortMenu>
            <SortMenuTrigger>
                <CurrentIcon aria-hidden strokeWidth={ICON_STROKE} />
                <span>{WANTED_ITEMS_SORT_OPTIONS[value].label}</span>
            </SortMenuTrigger>
            <SortMenuContent value={value} onValueChange={onValueChange}>
                {SORTS.map((sort) => {
                    const Icon = SORT_ICONS[sort];
                    const { label, hint } = WANTED_ITEMS_SORT_OPTIONS[sort];
                    return (
                        <Fragment key={sort}>
                            {sort === FIRST_MAX_SORT && <SortMenuSeparator />}
                            <SortMenuOption value={sort} hint={hint}>
                                <Icon aria-hidden strokeWidth={ICON_STROKE} />
                                {label}
                            </SortMenuOption>
                        </Fragment>
                    );
                })}
            </SortMenuContent>
        </SortMenu>
    );
}
