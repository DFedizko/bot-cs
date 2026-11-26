import type { MaxDescription } from "../../model/describe-max";
import { MaxBadge, MaxBadgeNote, MaxBadgeValue } from "./max-badge";

type WantedItemMaxProps = { max: MaxDescription; withNote?: boolean };

export function WantedItemMax({ max, withNote = false }: WantedItemMaxProps) {
    return (
        <MaxBadge tone={max.tone} className="group-data-[enabled=false]/item:opacity-45">
            <MaxBadgeValue>{max.value}</MaxBadgeValue>
            {withNote && max.relative && <MaxBadgeNote>vs rec.</MaxBadgeNote>}
        </MaxBadge>
    );
}
