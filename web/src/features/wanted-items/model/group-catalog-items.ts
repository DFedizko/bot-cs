import type { CatalogGroup } from "./catalog-group";
import type { CatalogItem } from "./catalog-item";

const addToGroup = (groups: Array<CatalogGroup>, item: CatalogItem): Array<CatalogGroup> => {
    const group = groups.find(({ category }) => category === item.category);
    if (!group) return [...groups, { category: item.category, items: [item] }];
    return groups.map((each) => (each === group ? { ...each, items: [...each.items, item] } : each));
};

export const groupCatalogItems = (items: ReadonlyArray<CatalogItem>): Array<CatalogGroup> =>
    items.reduce(addToGroup, []);
