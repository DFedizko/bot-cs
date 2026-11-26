import { useId } from "react";
import { FieldLabel } from "@/shared/ui/components/field-label";
import { Segmented, SegmentedItem } from "@/shared/ui/components/segmented";
import type { Wear } from "../../../model/wear";

const ANY_WEAR = "any";

type WearChoice = Wear | typeof ANY_WEAR;

type WearFieldProps = {
    wears: ReadonlyArray<Wear>;
    value: Wear | null;
    hint?: string;
    onChange: (wear: Wear | null) => void;
};

export function WearField({ wears, value, hint, onChange }: WearFieldProps) {
    const labelId = useId();
    return (
        <fieldset className="flex flex-col gap-2">
            <FieldLabel id={labelId} hint={hint}>
                Wear
            </FieldLabel>
            <Segmented<WearChoice>
                aria-labelledby={labelId}
                value={value ?? ANY_WEAR}
                onValueChange={(choice) => onChange(choice === ANY_WEAR ? null : choice)}
            >
                <SegmentedItem value={ANY_WEAR}>Any</SegmentedItem>
                {wears.map((wear) => (
                    <SegmentedItem key={wear} value={wear}>
                        {wear}
                    </SegmentedItem>
                ))}
            </Segmented>
        </fieldset>
    );
}
