import { ArrowDown, ArrowUp, CornerDownLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Kbd } from "@/shared/ui/components/kbd";

type CatalogSearchFooterProps = { children: ReactNode };

export function CatalogSearchFooter({ children }: CatalogSearchFooterProps) {
    return (
        <footer className="flex items-center gap-4 border-t border-line px-4 py-3 text-xs text-muted">
            <span className="flex items-center gap-1">
                <Kbd>
                    <ArrowUp aria-hidden />
                </Kbd>
                <Kbd>
                    <ArrowDown aria-hidden />
                </Kbd>
                navigate
            </span>
            <span className="flex items-center gap-1">
                <Kbd>
                    <CornerDownLeft aria-hidden />
                </Kbd>
                select
            </span>
            <span className="flex items-center gap-1">
                <Kbd>esc</Kbd>
                close
            </span>
            <span className="ml-auto text-faint">{children}</span>
        </footer>
    );
}
