import { COIN } from "@/contexts/shared-kernel/domain/currencies";
import { Money } from "@/packages/domain-primitives/money";

export const CoinCent = (cents: number): Money => Money.fromCents({ amount: cents, currency: COIN });
