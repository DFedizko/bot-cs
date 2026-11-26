import { formatCoins } from "@/shared/lib/format-coins";
import type { Account } from "./account";
import type { AccountSummary } from "./account-summary";

export const summarizeAccount = ({ id, name, balance }: Account): AccountSummary => ({
    id,
    name,
    initial: name.charAt(0).toUpperCase(),
    balance: formatCoins(balance),
});
