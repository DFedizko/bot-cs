import type { Ref } from "react";
import type { WantedItemDraft } from "../../model/wanted-item-draft";
import { MaxModeField, MaxPercentageField, MaxValueField } from "./wanted-item-form";

type WantedItemMaxFieldsProps = {
    draft: WantedItemDraft;
    error: string | null;
    percentageHint: string;
    onChange: (changes: Partial<WantedItemDraft>) => void;
    inputRef?: Ref<HTMLInputElement>;
};

export function WantedItemMaxFields({ draft, error, percentageHint, onChange, inputRef }: WantedItemMaxFieldsProps) {
    return (
        <section aria-label="Max price" className="flex flex-col gap-3">
            <MaxModeField value={draft.maxMode} onChange={(maxMode) => onChange({ maxMode })} />
            {draft.maxMode === "percentage" ? (
                <MaxPercentageField
                    inputRef={inputRef}
                    value={draft.percentage}
                    error={error}
                    hint={percentageHint}
                    onChange={(percentage) => onChange({ percentage })}
                />
            ) : (
                <MaxValueField
                    inputRef={inputRef}
                    value={draft.value}
                    error={error}
                    onChange={(value) => onChange({ value })}
                />
            )}
        </section>
    );
}
