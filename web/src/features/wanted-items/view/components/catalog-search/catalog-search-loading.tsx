import { Skeleton } from "@/shared/ui/components/skeleton";

const SKELETON_ROWS = 4;

export function CatalogSearchLoading() {
    return (
        <ul aria-busy aria-label="Searching the catalog" className="flex flex-col gap-1 p-2">
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <li key={index} className="flex items-center gap-3 p-2">
                    <Skeleton className="size-12 rounded-md" />
                    <span className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                    </span>
                    <Skeleton className="h-6 w-20 rounded-full" />
                </li>
            ))}
        </ul>
    );
}
