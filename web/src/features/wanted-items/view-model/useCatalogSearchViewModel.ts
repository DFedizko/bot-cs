import { useState } from "react";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useCommandPaletteStore } from "@/shared/lib/store/command-palette.store";
import { createWantedItemDraft } from "../model/create-wanted-item-draft";
import { describeResultCount } from "../model/describe-result-count";
import { toCatalogGroupViews } from "../model/to-catalog-group-views";
import { toCatalogQuery } from "../model/to-catalog-query";
import { toCatalogSearchStatus } from "../model/to-catalog-search-status";
import { useAddWantedItemStore } from "./ports/store/add-wanted-item.store";
import { useCatalogSearchQuery } from "./queries/useCatalogSearchQuery";

const SEARCH_DELAY_MS = 250;
const NO_RESULTS = 0;

export function useCatalogSearchViewModel() {
    const [text, setText] = useState("");
    const query = toCatalogQuery(text);
    const searched = useDebouncedValue(query, SEARCH_DELAY_MS);
    const { data, isError } = useCatalogSearchQuery(searched);
    const setPaletteOpen = useCommandPaletteStore((state) => state.setOpen);
    const startAdding = useAddWantedItemStore((state) => state.startAdding);

    const chooseItem = (name: string) => {
        const item = data?.find(({ marketHashName }) => marketHashName === name);
        if (!item) return;
        setPaletteOpen(false);
        setText("");
        startAdding(item, createWantedItemDraft(item));
    };

    return {
        text,
        query: query ?? "",
        status: toCatalogSearchStatus({ query, searched, items: data, failed: isError }),
        groups: toCatalogGroupViews(data ?? []),
        resultCount: describeResultCount(data?.length ?? NO_RESULTS),
        changeText: setText,
        chooseItem,
    };
}

export type CatalogSearchViewModel = ReturnType<typeof useCatalogSearchViewModel>;
