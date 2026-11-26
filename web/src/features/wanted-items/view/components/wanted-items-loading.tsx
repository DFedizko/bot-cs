import { Skeleton } from "@/shared/ui/components/skeleton";

type WantedItemsLoadingProps = { count: number };

export function WantedItemsLoading({ count }: WantedItemsLoadingProps) {
    return (
        <ul
            aria-busy
            aria-label="Loading wanted items"
            className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
        >
            {Array.from({ length: count }, (_, index) => (
                <li key={index}>
                    <Skeleton className="h-58 rounded-lg bg-surface-2" />
                </li>
            ))}
        </ul>
    );
}
