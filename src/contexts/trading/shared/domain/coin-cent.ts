import { COIN } from "@/shared-kernel/domain/currencies";
import { Money } from "@/shared/domain-primitives/money";

export const CoinCent = (cents: number): Money => Money.fromCents({ amount: cents, currency: COIN });
