import type { WantedItem } from "./wanted-item";
import type { WantedItemsPage } from "./wanted-items-page";

const STEP = 1;

export function setWantedItemEnabled(page: WantedItemsPage, name: string, enabled: boolean): WantedItemsPage {
    const changes = page.items.some((item) => item.name === name && item.enabled !== enabled);
    if (!changes) return page;
    const shift = enabled ? STEP : -STEP;
    const toggle = (item: WantedItem) => (item.name === name ? { ...item, enabled } : item);
    return {
        ...page,
        items: page.items.map(toggle),
        counts: {
            all: page.counts.all,
            enabled: page.counts.enabled + shift,
            disabled: page.counts.disabled - shift,
        },
    };
}
