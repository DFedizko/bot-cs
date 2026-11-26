import { CircleAlert } from "lucide-react";

export function AlreadyWantedNotice() {
    return (
        <section role="alert" className="flex gap-3 rounded-md border border-danger/40 bg-danger/10 p-4">
            <CircleAlert aria-hidden className="size-4 shrink-0 text-danger" />
            <span className="flex flex-col gap-1">
                <strong className="text-field-label text-ink">This item is already in your wanted list</strong>
                <span className="text-xs text-muted">Pick another item, or change the one in your list instead.</span>
            </span>
        </section>
    );
}
