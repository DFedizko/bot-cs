import { useQuery } from "@tanstack/react-query";
import { useCatalogService } from "../ports/catalog.service";
import { catalogKey } from "./catalog-key";

export function useCatalogSearchQuery(query: string | null) {
    const service = useCatalogService();
    return useQuery({
        queryKey: catalogKey(query),
        queryFn: () => service.search(query ?? ""),
        enabled: query !== null,
    });
}
