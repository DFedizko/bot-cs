import type { ReactNode } from "react";

type DialogFailureProps = { children: ReactNode };

export function DialogFailure({ children }: DialogFailureProps) {
    return (
        <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-helper text-danger">
            {children}
        </p>
    );
}
