import type { ReactNode } from "react";
import type { MaxDescription } from "../../model/describe-max";
import { MaxBadge, MaxBadgeValue } from "./max-badge";

type WantedItemMaxProps = { max: MaxDescription; children?: ReactNode };

export function WantedItemMax({ max, children }: WantedItemMaxProps) {
    return (
        <MaxBadge tone={max.tone} className="group-data-[enabled=false]/item:opacity-45">
            <MaxBadgeValue>{max.value}</MaxBadgeValue>
            {children}
        </MaxBadge>
    );
}
