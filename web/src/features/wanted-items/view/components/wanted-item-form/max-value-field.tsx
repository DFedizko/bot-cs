import { useId } from "react";
import { FieldLabel } from "@/shared/ui/components/field-label";
import { UnitInput } from "@/shared/ui/components/unit-input";
import { FieldHelp } from "./field-help";

const VALUE_HINT = "Bot bids up to this many coins, whatever the recommended price.";

type MaxValueFieldProps = { value: string; error: string | null; onChange: (value: string) => void };

export function MaxValueField({ value, error, onChange }: MaxValueFieldProps) {
    const id = useId();
    const helpId = `${id}-help`;
    return (
        <fieldset className="flex flex-col gap-2">
            <FieldLabel htmlFor={id}>Max value</FieldLabel>
            <UnitInput
                id={id}
                unit="coins"
                inputMode="numeric"
                placeholder="0"
                value={value}
                aria-invalid={error !== null}
                aria-describedby={helpId}
                onChange={(event) => onChange(event.target.value)}
            />
            <FieldHelp id={helpId} error={error} hint={VALUE_HINT} />
        </fieldset>
    );
}
