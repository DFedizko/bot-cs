import { LayoutGrid, List } from "lucide-react";
import { FilterChip, FilterChipCount, FilterChips } from "@/shared/ui/components/filter-chips";
import { ViewToggle, ViewToggleItem } from "@/shared/ui/components/view-toggle";
import type { WantedItemsViewModel } from "../../view-model/useWantedItemsViewModel";
import { FILTER_LABELS } from "./filter-labels";
import { WantedItemsSortMenu } from "./wanted-items-sort-menu";

type WantedItemsToolbarProps = Pick<
    WantedItemsViewModel,
    "search" | "filters" | "bidding" | "selectFilter" | "selectSort" | "selectView"
>;

const ICON_STROKE = 1.7;

export function WantedItemsToolbar({
    search,
    filters,
    bidding,
    selectFilter,
    selectSort,
    selectView,
}: WantedItemsToolbarProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <FilterChips aria-label="Filter wanted items" value={search.filter} onValueChange={selectFilter}>
                {filters.map(({ value, count }) => (
                    <FilterChip key={value} value={value}>
                        {FILTER_LABELS[value]}
                        <FilterChipCount>{count}</FilterChipCount>
                    </FilterChip>
                ))}
            </FilterChips>
            <p className="mr-2 ml-auto text-sm text-muted">
                Bot is bidding on{" "}
                <b className="font-medium text-ink">
                    {bidding.enabled} of {bidding.all}
                </b>{" "}
                items
            </p>
            <WantedItemsSortMenu value={search.sort} onValueChange={selectSort} />
            <ViewToggle aria-label="Layout" value={search.view} onValueChange={selectView}>
                <ViewToggleItem value="grid" aria-label="Grid view">
                    <LayoutGrid aria-hidden strokeWidth={ICON_STROKE} />
                </ViewToggleItem>
                <ViewToggleItem value="list" aria-label="List view">
                    <List aria-hidden strokeWidth={ICON_STROKE} />
                </ViewToggleItem>
            </ViewToggle>
        </div>
    );
}
