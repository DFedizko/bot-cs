import { COIN } from "@/shared-kernel/domain/currencies";
import { Money } from "@/shared/domain-primitives/money";

export function CoinCent(cents: number): Money {
    return Money.fromCents({ amount: cents, currency: COIN });
}
