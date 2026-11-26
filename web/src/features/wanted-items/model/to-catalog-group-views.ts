import type { CatalogGroup } from "./catalog-group";
import type { CatalogGroupView } from "./catalog-group-view";
import type { CatalogItem } from "./catalog-item";
import { groupCatalogItems } from "./group-catalog-items";
import { toCatalogItemView } from "./to-catalog-item-view";

const toGroupView = ({ category, items }: CatalogGroup): CatalogGroupView => ({
    category,
    items: items.map(toCatalogItemView),
});

export const toCatalogGroupViews = (items: ReadonlyArray<CatalogItem>) => groupCatalogItems(items).map(toGroupView);
