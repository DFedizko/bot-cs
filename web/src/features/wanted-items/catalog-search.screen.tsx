import { CatalogSearchView } from "./view/catalog-search.view";
import { useCatalogSearchViewModel } from "./view-model/useCatalogSearchViewModel";

export function CatalogSearchScreen() {
    return <CatalogSearchView {...useCatalogSearchViewModel()} />;
}
