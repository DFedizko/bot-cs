import { Navigate } from "@tanstack/react-router";
import { Skeleton } from "@/shared/ui/components/skeleton";
import type { FirstAccountViewModel } from "../view-model/useFirstAccountViewModel";

export function FirstAccountRedirectView({ status, accountId }: FirstAccountViewModel) {
    if (status === "ready") return <Navigate to="/accounts/$accountId/wanted-items" params={{ accountId }} replace />;
    return (
        <main className="grid min-h-svh place-items-center p-8 text-center">
            {status === "loading" && <Skeleton aria-label="Loading accounts" className="h-6 w-60" />}
            {status === "empty" && <p className="text-body text-muted">The bot has no CSGOEmpire account yet</p>}
            {status === "error" && (
                <p role="alert" className="text-body text-danger">
                    Couldn't reach the bot. Check that it is running, then reload.
                </p>
            )}
        </main>
    );
}
