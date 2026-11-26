import { Command, CommandInput, CommandList } from "@/shared/ui/components/command";
import { Kbd } from "@/shared/ui/components/kbd";
import type { CatalogSearchViewModel } from "../view-model/useCatalogSearchViewModel";
import {
    CatalogSearchFooter,
    CatalogSearchLoading,
    CatalogSearchMessage,
    CatalogSearchResults,
} from "./components/catalog-search";

const SEARCH_LABEL = "Search any item";
const SEARCHING = "Searching CSGOEmpire…";

function CatalogSearchContent({ status, groups, query, chooseItem }: CatalogSearchViewModel) {
    if (status === "idle")
        return <CatalogSearchMessage>Type at least 2 characters to search the catalog.</CatalogSearchMessage>;
    if (status === "loading") return <CatalogSearchLoading />;
    if (status === "error")
        return (
            <CatalogSearchMessage>
                The catalog can't be searched right now. The bot may still be loading it: try again in a moment.
            </CatalogSearchMessage>
        );
    if (status === "empty")
        return (
            <CatalogSearchMessage title={`No items match “${query}”`}>
                Check the spelling, or search by weapon or skin alone.
            </CatalogSearchMessage>
        );
    return <CatalogSearchResults groups={groups} query={query} onChoose={chooseItem} />;
}

export function CatalogSearchView(viewModel: CatalogSearchViewModel) {
    const { text, status, resultCount, changeText } = viewModel;
    return (
        <Command label={SEARCH_LABEL} shouldFilter={false} className="p-0">
            <CommandInput placeholder={`${SEARCH_LABEL}…`} value={text} onValueChange={changeText}>
                <Kbd>esc</Kbd>
            </CommandInput>
            <CommandList className="p-1">
                <CatalogSearchContent {...viewModel} />
            </CommandList>
            <CatalogSearchFooter>{status === "loading" ? SEARCHING : resultCount}</CatalogSearchFooter>
        </Command>
    );
}
