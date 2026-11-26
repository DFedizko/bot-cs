import { useId } from "react";
import { Switch } from "@/shared/ui/components/switch";

type StartEnabledFieldProps = { value: boolean; onChange: (enabled: boolean) => void };

export function StartEnabledField({ value, onChange }: StartEnabledFieldProps) {
    const id = useId();
    return (
        <section className="flex items-center justify-between gap-4 rounded-md border border-line px-4 py-3">
            <span className="flex flex-col gap-1">
                <span id={id} className="text-field-label text-ink">
                    Start enabled
                </span>
                <span className="text-xs text-muted">Bot starts bidding as soon as it's saved</span>
            </span>
            <Switch aria-labelledby={id} checked={value} onCheckedChange={onChange} />
        </section>
    );
}
