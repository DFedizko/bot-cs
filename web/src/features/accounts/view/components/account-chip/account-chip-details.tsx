import { Coins } from "lucide-react";
import type { AccountSummary } from "../../../model/account-summary";

type AccountChipDetailsProps = { account: AccountSummary };

const COIN_STROKE = 2;

export function AccountChipDetails({ account }: AccountChipDetailsProps) {
    return (
        <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
            <span className="truncate text-field-label text-ink">
                {account.name} <span className="font-mono text-xs text-muted">#{account.id}</span>
            </span>
            <span className="flex items-center gap-1 text-key text-muted">
                <Coins aria-hidden className="size-3 text-rarity-contraband" strokeWidth={COIN_STROKE} />
                {account.balance}
            </span>
        </span>
    );
}
