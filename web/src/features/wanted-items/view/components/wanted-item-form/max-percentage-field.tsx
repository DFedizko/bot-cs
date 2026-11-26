import { useId } from "react";
import type { Ref } from "react";
import { FieldLabel } from "@/shared/ui/components/field-label";
import { PresetChip } from "@/shared/ui/components/preset-chip";
import { UnitInput } from "@/shared/ui/components/unit-input";
import { PERCENTAGE_PRESETS } from "../../../model/percentage-presets";
import { FieldHelp } from "./field-help";

type MaxPercentageFieldProps = {
    inputRef?: Ref<HTMLInputElement>;
    value: string;
    error: string | null;
    hint: string;
    onChange: (percentage: string) => void;
};

export function MaxPercentageField({ inputRef, value, error, hint, onChange }: MaxPercentageFieldProps) {
    const id = useId();
    const helpId = `${id}-help`;
    return (
        <fieldset className="flex flex-col gap-2">
            <FieldLabel htmlFor={id}>Max price vs recommended</FieldLabel>
            <UnitInput
                ref={inputRef}
                id={id}
                unit="%"
                inputMode="decimal"
                value={value}
                aria-invalid={error !== null}
                aria-describedby={helpId}
                onChange={(event) => onChange(event.target.value)}
            />
            <FieldHelp id={helpId} error={error} hint={hint} />
            <span className="flex gap-2">
                {PERCENTAGE_PRESETS.map(({ label, value: preset }) => (
                    <PresetChip key={preset} active={value === preset} onClick={() => onChange(preset)}>
                        {label}
                    </PresetChip>
                ))}
            </span>
        </fieldset>
    );
}
