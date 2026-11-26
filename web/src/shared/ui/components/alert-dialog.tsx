import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { cn } from "@/shared/lib/cn";

function AlertDialog({ ...props }: AlertDialogPrimitive.Root.Props) {
    return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogContent({ className, ...props }: AlertDialogPrimitive.Popup.Props) {
    return (
        <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal">
            <AlertDialogPrimitive.Backdrop
                data-slot="alert-dialog-overlay"
                className="fixed inset-0 isolate z-50 bg-overlay duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
            />
            <AlertDialogPrimitive.Popup
                data-slot="alert-dialog-content"
                className={cn(
                    "fixed top-1/2 left-1/2 z-50 grid w-11/12 max-w-sm -translate-1/2 rounded-xl border border-line-strong bg-surface text-ink shadow-modal duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
                    className,
                )}
                {...props}
            />
        </AlertDialogPrimitive.Portal>
    );
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
    return (
        <AlertDialogPrimitive.Title
            data-slot="alert-dialog-title"
            className={cn("text-heading text-ink", className)}
            {...props}
        />
    );
}

function AlertDialogDescription({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
    return (
        <AlertDialogPrimitive.Description
            data-slot="alert-dialog-description"
            className={cn("text-body text-muted", className)}
            {...props}
        />
    );
}

function AlertDialogClose({ ...props }: AlertDialogPrimitive.Close.Props) {
    return <AlertDialogPrimitive.Close data-slot="alert-dialog-close" {...props} />;
}

export { AlertDialog, AlertDialogClose, AlertDialogContent, AlertDialogDescription, AlertDialogTitle };
