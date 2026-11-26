import { CommandGroup } from "@/shared/ui/components/command";
import type { CatalogGroupView } from "../../../model/catalog-group-view";
import { CatalogResult } from "./catalog-result";

type CatalogSearchResultsProps = { groups: Array<CatalogGroupView>; query: string; onChoose: (name: string) => void };

export function CatalogSearchResults({ groups, query, onChoose }: CatalogSearchResultsProps) {
    return groups.map(({ category, items }) => (
        <CommandGroup
            key={category}
            heading={category}
            className="**:[[cmdk-group-heading]]:text-label **:[[cmdk-group-heading]]:text-faint"
        >
            {items.map((item) => (
                <CatalogResult key={item.name} item={item} query={query} onChoose={onChoose} />
            ))}
        </CommandGroup>
    ));
}
