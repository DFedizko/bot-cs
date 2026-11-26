import { useQuery } from "@tanstack/react-query";
import { useCatalogService } from "../ports/catalog.service";

const CATALOG_KEY = "catalog";

export function useCatalogSearchQuery(query: string | null) {
    const service = useCatalogService();
    return useQuery({
        queryKey: [CATALOG_KEY, query],
        queryFn: () => service.search(query ?? ""),
        enabled: query !== null,
    });
}
