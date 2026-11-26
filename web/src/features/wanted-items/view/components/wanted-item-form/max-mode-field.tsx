import { Segmented, SegmentedItem } from "@/shared/ui/components/segmented";
import type { MaxMode } from "../../../model/max-mode";

type MaxModeFieldProps = { value: MaxMode; onChange: (maxMode: MaxMode) => void };

export function MaxModeField({ value, onChange }: MaxModeFieldProps) {
    return (
        <Segmented<MaxMode> aria-label="Max price" value={value} onValueChange={onChange}>
            <SegmentedItem value="percentage">% vs recommended</SegmentedItem>
            <SegmentedItem value="value">Fixed value</SegmentedItem>
        </Segmented>
    );
}
