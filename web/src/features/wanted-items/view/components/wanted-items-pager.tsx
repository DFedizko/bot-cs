import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildPageList } from "@/shared/lib/build-page-list";
import {
    Pagination,
    PaginationGap,
    PaginationPage,
    PaginationPageSize,
    PaginationPages,
    PaginationStep,
    PaginationSummary,
} from "@/shared/ui/components/pagination";
import type { WantedItemsPagination } from "../../view-model/useWantedItemsViewModel";

type WantedItemsPagerProps = {
    pagination: WantedItemsPagination;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
};

const STEP = 1;

export function WantedItemsPager({ pagination, onPageChange, onPageSizeChange }: WantedItemsPagerProps) {
    const { page, pageCount, pageSize, pageSizes, from, to, total } = pagination;
    return (
        <Pagination className="mt-auto border-t border-line pt-4">
            <PaginationSummary>
                Showing {from}–{to} of {total} items
            </PaginationSummary>
            <PaginationPageSize value={pageSize} options={pageSizes} onValueChange={onPageSizeChange} />
            <span className="flex-1" />
            <PaginationStep
                aria-label="Previous page"
                disabled={page <= STEP}
                onClick={() => onPageChange(page - STEP)}
            >
                <ChevronLeft aria-hidden />
                Previous
            </PaginationStep>
            <PaginationPages>
                {buildPageList(page, pageCount).map((entry, index) =>
                    entry === "gap" ? (
                        <PaginationGap key={`gap-${index}`} />
                    ) : (
                        <PaginationPage
                            key={entry}
                            page={entry}
                            isCurrent={entry === page}
                            onClick={() => onPageChange(entry)}
                        />
                    ),
                )}
            </PaginationPages>
            <PaginationStep
                aria-label="Next page"
                disabled={page >= pageCount}
                onClick={() => onPageChange(page + STEP)}
            >
                Next
                <ChevronRight aria-hidden />
            </PaginationStep>
        </Pagination>
    );
}
