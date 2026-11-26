import type { WantedItemDraft } from "../../model/wanted-item-draft";
import { MaxModeField, MaxPercentageField, MaxValueField } from "./wanted-item-form";

type WantedItemMaxFieldsProps = {
    draft: WantedItemDraft;
    error: string | null;
    percentageHint: string;
    onChange: (changes: Partial<WantedItemDraft>) => void;
};

export function WantedItemMaxFields({ draft, error, percentageHint, onChange }: WantedItemMaxFieldsProps) {
    return (
        <section aria-label="Max price" className="flex flex-col gap-3">
            <MaxModeField value={draft.maxMode} onChange={(maxMode) => onChange({ maxMode })} />
            {draft.maxMode === "percentage" ? (
                <MaxPercentageField
                    value={draft.percentage}
                    error={error}
                    hint={percentageHint}
                    onChange={(percentage) => onChange({ percentage })}
                />
            ) : (
                <MaxValueField value={draft.value} error={error} onChange={(value) => onChange({ value })} />
            )}
        </section>
    );
}
